#!/bin/bash
set -euo pipefail

# MyL1 Blockchain Node - AWS Deployment Script
# Deploys only the core blockchain node to AWS ECS Fargate

REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_BASE="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
STACK_NAME="myl1-blockchain"

echo "⛓️  MyL1 Blockchain Node AWS Deployment"
echo "======================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Prerequisites check
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI not installed"
        exit 1
    fi

    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS CLI not configured. Run 'aws configure'"
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        log_error "Docker not installed"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker daemon not running"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Create ECR repository
create_ecr_repo() {
    log_info "Creating ECR repository..."

    if aws ecr describe-repositories --repository-names myl1-node --region "$REGION" --query 'repositories[0].repositoryName' --output text 2>/dev/null | grep -q myl1-node; then
        log_warning "ECR repository already exists"
    else
        aws ecr create-repository \
            --repository-name myl1-node \
            --region "$REGION" \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256
        log_success "Created ECR repository: myl1-node"
    fi
}

# Build and push Docker image
build_and_push_image() {
    log_info "Building and pushing MyL1 node image..."

    # Build image
    log_info "Building Docker image..."
    docker build -f docker/dockerfiles/substrate_injected.Dockerfile -t myl1-node:latest .

    # Tag and push
    IMAGE_URI="$ECR_BASE/myl1-node:latest"
    docker tag myl1-node:latest "$IMAGE_URI"

    # Login to ECR
    aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_BASE"

    # Push image
    docker push "$IMAGE_URI"

    log_success "Image pushed to: $IMAGE_URI"
}

# Create ECS service linked role
create_ecs_service_role() {
    log_info "Creating ECS service linked role..."

    # Check if role exists
    if aws iam get-role --role-name AWSServiceRoleForECS --region "$REGION" 2>/dev/null; then
        log_warning "ECS service role already exists"
    else
        aws iam create-service-linked-role \
            --aws-service-name ecs.amazonaws.com \
            --region "$REGION" || log_warning "Service linked role may already exist"
        log_success "Created ECS service linked role"
    fi
}

# Create ECS cluster
create_ecs_cluster() {
    log_info "Creating ECS cluster..."

    if aws ecs describe-clusters --clusters "$STACK_NAME-cluster" --region "$REGION" --query 'clusters[0].status' --output text 2>/dev/null | grep -q ACTIVE; then
        log_warning "ECS cluster already exists"
    else
        aws ecs create-cluster \
            --cluster-name "$STACK_NAME-cluster" \
            --capacity-providers FARGATE FARGATE_SPOT \
            --default-capacity-provider-strategy \
                capacityProvider=FARGATE,weight=1 \
                capacityProvider=FARGATE_SPOT,weight=4 \
            --region "$REGION"
        log_success "Created ECS cluster: $STACK_NAME-cluster"
    fi
}

# Create CloudWatch log group
create_log_group() {
    log_info "Creating CloudWatch log group..."

    if aws logs describe-log-groups --log-group-name-prefix "/ecs/$STACK_NAME-node" --region "$REGION" --query 'logGroups[0].logGroupName' --output text 2>/dev/null | grep -q "/ecs/$STACK_NAME-node"; then
        log_warning "CloudWatch log group already exists"
    else
        aws logs create-log-group \
            --log-group-name "/ecs/$STACK_NAME-node" \
            --region "$REGION"
        log_success "Created CloudWatch log group: /ecs/$STACK_NAME-node"
    fi
}

# Create task definition
create_task_definition() {
    log_info "Creating ECS task definition..."

    TASK_DEF_FILE="/tmp/myl1-node-task-def.json"

    cat > "$TASK_DEF_FILE" << EOF
{
    "family": "$STACK_NAME-node",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "2048",
    "memory": "4096",
    "containerDefinitions": [{
        "name": "myl1-node",
        "image": "$ECR_BASE/myl1-node:latest",
        "essential": true,
        "portMappings": [
            {"containerPort": 9944, "protocol": "tcp"},
            {"containerPort": 9933, "protocol": "tcp"},
            {"containerPort": 30333, "protocol": "tcp"}
        ],
        "environment": [
            {"name": "CHAIN", "value": "local"},
            {"name": "NODE_NAME", "value": "myl1-aws-node"},
            {"name": "WS_EXTERNAL", "value": "true"},
            {"name": "RPC_EXTERNAL", "value": "true"}
        ],
        "healthCheck": {
            "command": [
                "CMD-SHELL",
                "curl -f http://localhost:9933/health || exit 1"
            ],
            "interval": 30,
            "timeout": 5,
            "retries": 3,
            "startPeriod": 60
        }
    }]
}
EOF

    aws ecs register-task-definition \
        --cli-input-json file://"$TASK_DEF_FILE" \
        --region "$REGION"

    log_success "Task definition created: $STACK_NAME-node"
}

# Get default VPC and subnets
get_network_config() {
    log_info "Getting network configuration..."

    # Try to get default VPC first
    VPC_ID=$(aws ec2 describe-vpcs \
        --filters Name=isDefault,Values=true \
        --query 'Vpcs[0].VpcId' \
        --output text \
        --region "$REGION" 2>/dev/null || echo "")

    if [ -z "$VPC_ID" ] || [ "$VPC_ID" = "None" ]; then
        log_warning "No default VPC found. Looking for any VPC..."
        VPC_ID=$(aws ec2 describe-vpcs \
            --query 'Vpcs[0].VpcId' \
            --output text \
            --region "$REGION" 2>/dev/null || echo "")

        if [ -z "$VPC_ID" ] || [ "$VPC_ID" = "None" ]; then
            log_error "No VPC found. Please create a VPC first."
            exit 1
        fi
    fi

    # Get subnets
    SUBNETS=$(aws ec2 describe-subnets \
        --filters Name=vpc-id,Values="$VPC_ID" Name=default-for-az,Values=true \
        --query 'Subnets[*].SubnetId' \
        --output text \
        --region "$REGION" | tr '\t' ',')

    if [ -z "$SUBNETS" ]; then
        log_warning "No default subnets found. Using first 2 available subnets..."
        SUBNETS=$(aws ec2 describe-subnets \
            --filters Name=vpc-id,Values="$VPC_ID" \
            --query 'Subnets[0:2].SubnetId' \
            --output text \
            --region "$REGION" | tr '\t' ',')
    fi

    log_success "Network config ready - VPC: $VPC_ID, Subnets: $SUBNETS"
}

# Create security group
create_security_group() {
    log_info "Creating security group..."

    # Check if security group already exists
    SG_ID=$(aws ec2 describe-security-groups \
        --group-names "$STACK_NAME-sg" \
        --region "$REGION" \
        --query 'SecurityGroups[0].GroupId' \
        --output text 2>/dev/null || echo "")

    if [ -n "$SG_ID" ] && [ "$SG_ID" != "None" ]; then
        log_warning "Security group already exists: $SG_ID"
        return
    fi

    # Create security group
    SG_ID=$(aws ec2 create-security-group \
        --group-name "$STACK_NAME-sg" \
        --description "MyL1 Blockchain Node Security Group" \
        --vpc-id "$VPC_ID" \
        --region "$REGION" \
        --query 'GroupId' \
        --output text)

    # Add inbound rules
    aws ec2 authorize-security-group-ingress \
        --group-id "$SG_ID" \
        --protocol tcp \
        --port 9944 \
        --cidr "0.0.0.0/0" \
        --region "$REGION"

    aws ec2 authorize-security-group-ingress \
        --group-id "$SG_ID" \
        --protocol tcp \
        --port 9933 \
        --cidr "0.0.0.0/0" \
        --region "$REGION"

    aws ec2 authorize-security-group-ingress \
        --group-id "$SG_ID" \
        --protocol tcp \
        --port 30333 \
        --cidr "0.0.0.0/0" \
        --region "$REGION"

    log_success "Security group created: $SG_ID"
}

# Deploy service
deploy_service() {
    log_info "Deploying MyL1 blockchain service..."

    # Check if service already exists
    SERVICE_EXISTS=$(aws ecs describe-services \
        --cluster "$STACK_NAME-cluster" \
        --services "$STACK_NAME-node" \
        --region "$REGION" \
        --query 'services[0].serviceName' \
        --output text 2>/dev/null || echo "")

    if [ -n "$SERVICE_EXISTS" ] && [ "$SERVICE_EXISTS" != "None" ]; then
        log_info "Service exists, updating..."
        aws ecs update-service \
            --cluster "$STACK_NAME-cluster" \
            --service "$STACK_NAME-node" \
            --task-definition "$STACK_NAME-node" \
            --desired-count 1 \
            --force-new-deployment \
            --region "$REGION"
    else
        # Create new service
        aws ecs create-service \
            --cluster "$STACK_NAME-cluster" \
            --service-name "$STACK_NAME-node" \
            --task-definition "$STACK_NAME-node" \
            --desired-count 1 \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
            --region "$REGION"
    fi

    log_success "Service deployed. Waiting for startup..."
}

# Wait for service to be ready and get public IP
get_service_endpoint() {
    log_info "Waiting for service to be ready..."

    # Wait for service to be stable
    aws ecs wait services-stable \
        --cluster "$STACK_NAME-cluster" \
        --services "$STACK_NAME-node" \
        --region "$REGION"

    log_success "Service is stable"

    # Get task information
    TASK_ARN=$(aws ecs list-tasks \
        --cluster "$STACK_NAME-cluster" \
        --service-name "$STACK_NAME-node" \
        --region "$REGION" \
        --query 'taskArns[0]' \
        --output text)

    if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" = "None" ]; then
        log_error "No running tasks found"
        return 1
    fi

    # Get network interface and public IP
    ENI_ID=$(aws ecs describe-tasks \
        --cluster "$STACK_NAME-cluster" \
        --tasks "$TASK_ARN" \
        --region "$REGION" \
        --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
        --output text)

    if [ -n "$ENI_ID" ] && [ "$ENI_ID" != "None" ]; then
        PUBLIC_IP=$(aws ec2 describe-network-interfaces \
            --network-interface-ids "$ENI_ID" \
            --region "$REGION" \
            --query 'NetworkInterfaces[0].Association.PublicIp' \
            --output text 2>/dev/null || echo "")

        if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "None" ]; then
            log_success "Public IP found: $PUBLIC_IP"
        else
            log_warning "No public IP found yet. Task might still be starting..."
            PUBLIC_IP=""
        fi
    else
        log_warning "Network interface not available yet"
        PUBLIC_IP=""
    fi
}

# Show deployment summary
show_summary() {
    echo ""
    log_success "🎉 MyL1 Blockchain Node Deployed Successfully!"
    echo ""
    echo "📊 Deployment Summary:"
    echo "======================"
    echo "Region: $REGION"
    echo "ECS Cluster: $STACK_NAME-cluster"
    echo "Service: $STACK_NAME-node"
    echo "Task Definition: $STACK_NAME-node"
    echo ""

    if [ -n "$PUBLIC_IP" ]; then
        echo "🌐 Blockchain Endpoints:"
        echo "========================"
        echo "WebSocket (Frontend): ws://$PUBLIC_IP:9944"
        echo "HTTP RPC (API): http://$PUBLIC_IP:9933"
        echo "P2P (Other nodes): $PUBLIC_IP:30333"
        echo ""
        echo "🔗 Ready for Vercel deployment!"
        echo "=============================="
        echo "Add these environment variables to your Vercel frontend projects:"
        echo ""
        echo "NEXT_PUBLIC_WS_ENDPOINT=ws://$PUBLIC_IP:9944"
        echo "NEXT_PUBLIC_RPC_ENDPOINT=http://$PUBLIC_IP:9933"
        echo "NEXT_PUBLIC_CHAIN_NAME=MyL1"
    else
        echo "⚠️  Public IP not available yet."
        echo "Run this command to check later:"
        echo "aws ecs describe-tasks --cluster $STACK_NAME-cluster --tasks \$(aws ecs list-tasks --cluster $STACK_NAME-cluster --service-name $STACK_NAME-node --query 'taskArns[0]' --output text) --query 'tasks[0].attachments[0].details[?name==\`networkInterfaceId\`].value' --output text | xargs aws ec2 describe-network-interfaces --network-interface-ids --query 'NetworkInterfaces[0].Association.PublicIp' --output text"
    fi

    echo ""
    echo "🛠️  Management Commands:"
    echo "======================="
    echo "# Check service status"
    echo "aws ecs describe-services --cluster $STACK_NAME-cluster --services $STACK_NAME-node --region $REGION"
    echo ""
    echo "# View logs"
    echo "aws logs tail /ecs/$STACK_NAME-node --follow --region $REGION"
    echo ""
    echo "# Stop blockchain"
    echo "aws ecs update-service --cluster $STACK_NAME-cluster --service $STACK_NAME-node --desired-count 0 --region $REGION"
    echo ""
    echo "# Delete everything"
    echo "aws ecs delete-service --cluster $STACK_NAME-cluster --service $STACK_NAME-node --force --region $REGION"
    echo "aws ecs delete-cluster --cluster $STACK_NAME-cluster --region $REGION"
    echo "aws ecr delete-repository --repository-name myl1-node --force --region $REGION"
}

# Main deployment function
main() {
    echo "Starting MyL1 Blockchain Node deployment to AWS..."
    echo ""

    check_prerequisites
    create_ecr_repo
    build_and_push_image
    create_ecs_service_role
    create_ecs_cluster
    create_log_group
    create_task_definition
    get_network_config
    create_security_group
    deploy_service
    get_service_endpoint
    show_summary
}

# Run main function
main "$@"
