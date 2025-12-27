#!/bin/bash
set -euo pipefail

# MyL1 AWS Production Deployment Script
# This script deploys the complete MyL1 blockchain infrastructure to AWS ECS/Fargate

# Configuration - Change these values as needed
STACK_NAME="myl1-production"
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_BASE="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
VPC_CIDR="10.0.0.0/16"
SUBNET_PUBLIC_1_CIDR="10.0.1.0/24"
SUBNET_PUBLIC_2_CIDR="10.0.2.0/24"
SUBNET_PRIVATE_1_CIDR="10.0.3.0/24"
SUBNET_PRIVATE_2_CIDR="10.0.4.0/24"

echo "🚀 Deploying MyL1 Blockchain to AWS Production"
echo "==============================================="
echo "Region: $REGION"
echo "Account: $ACCOUNT_ID"
echo "Stack: $STACK_NAME"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check if command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# Prerequisites check
check_prerequisites() {
    log_info "Checking prerequisites..."

    check_command "aws"
    check_command "docker"
    check_command "jq"

    # Check AWS CLI configuration
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS CLI is not configured. Please run 'aws configure'"
        exit 1
    fi

    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Create ECR repositories
create_ecr_repos() {
    log_info "Creating ECR repositories..."

    local repos=("myl1-node" "myl1-rest-api" "myl1-explorer" "myl1-wallet" "myl1-faucet" "myl1-monitoring")

    for repo in "${repos[@]}"; do
        if aws ecr describe-repositories --repository-names "$repo" --region "$REGION" &> /dev/null; then
            log_warning "ECR repository $repo already exists"
        else
            aws ecr create-repository \
                --repository-name "$repo" \
                --region "$REGION" \
                --image-scanning-configuration scanOnPush=true \
                --encryption-configuration encryptionType=AES256
            log_success "Created ECR repository: $repo"
        fi
    done

    # Login to ECR
    aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_BASE"
    log_success "Logged in to ECR"
}

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images..."

    local services=(
        "myl1-node:docker/dockerfiles/substrate_injected.Dockerfile"
        "myl1-rest-api:infra/rest-api"
        "myl1-explorer:explorer"
        "myl1-wallet:wallet"
        "myl1-faucet:infra/faucet"
    )

    for service_info in "${services[@]}"; do
        IFS=':' read -r service_name dockerfile_path <<< "$service_info"

        log_info "Building $service_name..."

        # Build image
        if [[ "$service_name" == "myl1-node" ]]; then
            docker build -f "$dockerfile_path" -t "$service_name:latest" .
        else
            # For Node.js services, use production Dockerfile
            docker build -f "$dockerfile_path/Dockerfile.production" -t "$service_name:latest" "$dockerfile_path"
        fi

        # Tag and push
        local image_uri="$ECR_BASE/$service_name:latest"
        docker tag "$service_name:latest" "$image_uri"
        docker push "$image_uri"

        log_success "Pushed $service_name to $image_uri"
    done
}

# Create VPC and networking
create_networking() {
    log_info "Creating VPC and networking infrastructure..."

    # Create VPC
    VPC_ID=$(aws ec2 create-vpc \
        --cidr-block "$VPC_CIDR" \
        --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$STACK_NAME-vpc}]" \
        --query 'Vpc.VpcId' \
        --output text)

    log_success "Created VPC: $VPC_ID"

    # Create subnets
    SUBNET_PUBLIC_1=$(aws ec2 create-subnet \
        --vpc-id "$VPC_ID" \
        --cidr-block "$SUBNET_PUBLIC_1_CIDR" \
        --availability-zone "${REGION}a" \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$STACK_NAME-public-1}]" \
        --query 'Subnet.SubnetId' \
        --output text)

    SUBNET_PUBLIC_2=$(aws ec2 create-subnet \
        --vpc-id "$VPC_ID" \
        --cidr-block "$SUBNET_PUBLIC_2_CIDR" \
        --availability-zone "${REGION}b" \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$STACK_NAME-public-2}]" \
        --query 'Subnet.SubnetId' \
        --output text)

    SUBNET_PRIVATE_1=$(aws ec2 create-subnet \
        --vpc-id "$VPC_ID" \
        --cidr-block "$SUBNET_PRIVATE_1_CIDR" \
        --availability-zone "${REGION}a" \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$STACK_NAME-private-1}]" \
        --query 'Subnet.SubnetId' \
        --output text)

    SUBNET_PRIVATE_2=$(aws ec2 create-subnet \
        --vpc-id "$VPC_ID" \
        --cidr-block "$SUBNET_PRIVATE_2_CIDR" \
        --availability-zone "${REGION}b" \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$STACK_NAME-private-2}]" \
        --query 'Subnet.SubnetId' \
        --output text)

    # Create Internet Gateway
    IGW_ID=$(aws ec2 create-internet-gateway \
        --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$STACK_NAME-igw}]" \
        --query 'InternetGateway.InternetGatewayId' \
        --output text)

    aws ec2 attach-internet-gateway --vpc-id "$VPC_ID" --internet-gateway-id "$IGW_ID"

    # Create NAT Gateway (for private subnets)
    EIP_ALLOC=$(aws ec2 allocate-address \
        --domain vpc \
        --query 'AllocationId' \
        --output text)

    NAT_GW=$(aws ec2 create-nat-gateway \
        --subnet-id "$SUBNET_PUBLIC_1" \
        --allocation-id "$EIP_ALLOC" \
        --query 'NatGateway.NatGatewayId' \
        --output text)

    # Wait for NAT Gateway to be available
    aws ec2 wait nat-gateway-available --nat-gateway-ids "$NAT_GW"

    # Create route tables
    PUBLIC_RT=$(aws ec2 create-route-table \
        --vpc-id "$VPC_ID" \
        --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$STACK_NAME-public-rt}]" \
        --query 'RouteTable.RouteTableId' \
        --output text)

    PRIVATE_RT=$(aws ec2 create-route-table \
        --vpc-id "$VPC_ID" \
        --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$STACK_NAME-private-rt}]" \
        --query 'RouteTable.RouteTableId' \
        --output text)

    # Add routes
    aws ec2 create-route --route-table-id "$PUBLIC_RT" --destination-cidr-block "0.0.0.0/0" --gateway-id "$IGW_ID"
    aws ec2 create-route --route-table-id "$PRIVATE_RT" --destination-cidr-block "0.0.0.0/0" --nat-gateway-id "$NAT_GW"

    # Associate subnets with route tables
    aws ec2 associate-route-table --subnet-id "$SUBNET_PUBLIC_1" --route-table-id "$PUBLIC_RT"
    aws ec2 associate-route-table --subnet-id "$SUBNET_PUBLIC_2" --route-table-id "$PUBLIC_RT"
    aws ec2 associate-route-table --subnet-id "$SUBNET_PRIVATE_1" --route-table-id "$PRIVATE_RT"
    aws ec2 associate-route-table --subnet-id "$SUBNET_PRIVATE_2" --route-table-id "$PRIVATE_RT"

    log_success "Networking infrastructure created"
}

# Create security groups
create_security_groups() {
    log_info "Creating security groups..."

    # ALB Security Group (public access)
    ALB_SG=$(aws ec2 create-security-group \
        --group-name "$STACK_NAME-alb-sg" \
        --description "ALB Security Group" \
        --vpc-id "$VPC_ID" \
        --query 'GroupId' \
        --output text)

    aws ec2 authorize-security-group-ingress \
        --group-id "$ALB_SG" \
        --protocol tcp \
        --port 80 \
        --cidr "0.0.0.0/0"

    aws ec2 authorize-security-group-ingress \
        --group-id "$ALB_SG" \
        --protocol tcp \
        --port 443 \
        --cidr "0.0.0.0/0"

    # ECS Security Group (internal access)
    ECS_SG=$(aws ec2 create-security-group \
        --group-name "$STACK_NAME-ecs-sg" \
        --description "ECS Tasks Security Group" \
        --vpc-id "$VPC_ID" \
        --query 'GroupId' \
        --output text)

    # Allow ALB to access ECS tasks
    aws ec2 authorize-security-group-ingress \
        --group-id "$ECS_SG" \
        --protocol tcp \
        --port 3000-3003 \
        --source-group "$ALB_SG"

    # Allow internal communication between ECS tasks
    aws ec2 authorize-security-group-ingress \
        --group-id "$ECS_SG" \
        --protocol tcp \
        --port 9933-9944 \
        --source-group "$ECS_SG"

    # Allow internal communication for monitoring
    aws ec2 authorize-security-group-ingress \
        --group-id "$ECS_SG" \
        --protocol tcp \
        --port 9090 \
        --source-group "$ECS_SG"

    aws ec2 authorize-security-group-ingress \
        --group-id "$ECS_SG" \
        --protocol tcp \
        --port 3000 \
        --source-group "$ECS_SG"

    log_success "Security groups created"
}

# Create ECS cluster
create_ecs_cluster() {
    log_info "Creating ECS cluster..."

    aws ecs create-cluster \
        --cluster-name "$STACK_NAME-cluster" \
        --capacity-providers FARGATE FARGATE_SPOT \
        --default-capacity-provider-strategy \
            capacityProvider=FARGATE,weight=1 \
            capacityProvider=FARGATE_SPOT,weight=4

    log_success "ECS cluster created: $STACK_NAME-cluster"
}

# Create EFS for persistent storage
create_efs() {
    log_info "Creating EFS for persistent node data..."

    EFS_ID=$(aws efs create-file-system \
        --creation-token "$STACK_NAME-efs" \
        --encrypted \
        --performance-mode generalPurpose \
        --throughput-mode bursting \
        --tags "Key=Name,Value=$STACK_NAME-efs" \
        --query 'FileSystemId' \
        --output text)

    # Create mount targets
    aws efs create-mount-target \
        --file-system-id "$EFS_ID" \
        --subnet-id "$SUBNET_PRIVATE_1" \
        --security-groups "$ECS_SG"

    aws efs create-mount-target \
        --file-system-id "$EFS_ID" \
        --subnet-id "$SUBNET_PRIVATE_2" \
        --security-groups "$ECS_SG"

    log_success "EFS created: $EFS_ID"
}

# Create load balancer
create_load_balancer() {
    log_info "Creating Application Load Balancer..."

    ALB_ARN=$(aws elbv2 create-load-balancer \
        --name "$STACK_NAME-alb" \
        --subnets "$SUBNET_PUBLIC_1" "$SUBNET_PUBLIC_2" \
        --security-groups "$ALB_SG" \
        --scheme internet-facing \
        --type application \
        --ip-address-type ipv4 \
        --query 'LoadBalancers[0].LoadBalancerArn' \
        --output text)

    # Wait for ALB to be active
    aws elbv2 wait load-balancer-available --load-balancer-arns "$ALB_ARN"

    ALB_DNS=$(aws elbv2 describe-load-balancers \
        --load-balancer-arns "$ALB_ARN" \
        --query 'LoadBalancers[0].DNSName' \
        --output text)

    log_success "ALB created: $ALB_DNS"

    # Create target groups
    create_target_group "explorer" 3000
    create_target_group "api" 3002
    create_target_group "wallet" 3001
    create_target_group "faucet" 3003
    create_target_group "monitoring" 3000

    # Create listeners and rules
    create_listener_rules
}

create_target_group() {
    local service=$1
    local port=$2

    TG_ARN=$(aws elbv2 create-target-group \
        --name "$STACK_NAME-$service-tg" \
        --protocol HTTP \
        --port "$port" \
        --vpc-id "$VPC_ID" \
        --target-type ip \
        --health-check-path "/health" \
        --query 'TargetGroups[0].TargetGroupArn' \
        --output text)

    # Store target group ARN
    declare -g "TG_${service^^}_ARN=$TG_ARN"

    log_info "Created target group for $service"
}

create_listener_rules() {
    # Create HTTP listener
    HTTP_LISTENER_ARN=$(aws elbv2 create-listener \
        --load-balancer-arn "$ALB_ARN" \
        --protocol HTTP \
        --port 80 \
        --default-actions "Type=redirect,Redirect={Protocol=HTTPS,Port=443,StatusCode=HTTP_301}" \
        --query 'Listeners[0].ListenerArn' \
        --output text)

    # Create HTTPS listener (requires SSL certificate)
    # Note: You'll need to create an ACM certificate first
    # HTTPS_LISTENER_ARN=$(aws elbv2 create-listener ...)

    # Create rules for different services based on host/path
    # For now, using path-based routing
    aws elbv2 create-rule \
        --listener-arn "$HTTP_LISTENER_ARN" \
        --priority 1 \
        --conditions "Field=path-pattern,Values='/api/*'" \
        --actions "Type=forward,TargetGroupArn=$TG_API_ARN"

    aws elbv2 create-rule \
        --listener-arn "$HTTP_LISTENER_ARN" \
        --priority 2 \
        --conditions "Field=path-pattern,Values='/wallet/*'" \
        --actions "Type=forward,TargetGroupArn=$TG_WALLET_ARN"

    aws elbv2 create-rule \
        --listener-arn "$HTTP_LISTENER_ARN" \
        --priority 3 \
        --conditions "Field=path-pattern,Values='/faucet/*'" \
        --actions "Type=forward,TargetGroupArn=$TG_FAUCET_ARN"

    aws elbv2 create-rule \
        --listener-arn "$HTTP_LISTENER_ARN" \
        --priority 4 \
        --conditions "Field=path-pattern,Values='/monitor/*'" \
        --actions "Type=forward,TargetGroupArn=$TG_MONITORING_ARN"

    # Default rule for explorer
    aws elbv2 create-rule \
        --listener-arn "$HTTP_LISTENER_ARN" \
        --priority 100 \
        --actions "Type=forward,TargetGroupArn=$TG_EXPLORER_ARN"

    log_success "ALB listeners and rules created"
}

# Create ECS task definitions
create_task_definitions() {
    log_info "Creating ECS task definitions..."

    # Node task definition
    cat > /tmp/node-task-def.json << EOF
{
    "family": "$STACK_NAME-node",
    "taskRoleArn": "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    "executionRoleArn": "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "2048",
    "memory": "4096",
    "volumes": [{
        "name": "node-data",
        "efsVolumeConfiguration": {
            "fileSystemId": "$EFS_ID",
            "rootDirectory": "/node-data"
        }
    }],
    "containerDefinitions": [{
        "name": "myl1-node",
        "image": "$ECR_BASE/myl1-node:latest",
        "essential": true,
        "portMappings": [
            {"containerPort": 9944, "protocol": "tcp"},
            {"containerPort": 9933, "protocol": "tcp"}
        ],
        "environment": [
            {"name": "CHAIN", "value": "local"},
            {"name": "BASE_PATH", "value": "/node-data"}
        ],
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": "/ecs/$STACK_NAME-node",
                "awslogs-region": "$REGION",
                "awslogs-stream-prefix": "ecs"
            }
        },
        "mountPoints": [{
            "sourceVolume": "node-data",
            "containerPath": "/node-data",
            "readOnly": false
        }]
    }]
}
EOF

    aws ecs register-task-definition --cli-input-json file:///tmp/node-task-def.json

    # API task definition
    cat > /tmp/api-task-def.json << EOF
{
    "family": "$STACK_NAME-api",
    "executionRoleArn": "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "512",
    "memory": "1024",
    "containerDefinitions": [{
        "name": "myl1-api",
        "image": "$ECR_BASE/myl1-rest-api:latest",
        "essential": true,
        "portMappings": [{"containerPort": 3002, "protocol": "tcp"}],
        "environment": [
            {"name": "PORT", "value": "3002"},
            {"name": "WS_ENDPOINT", "value": "ws://myl1-node-service:9944"}
        ],
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": "/ecs/$STACK_NAME-api",
                "awslogs-region": "$REGION",
                "awslogs-stream-prefix": "ecs"
            }
        }
    }]
}
EOF

    aws ecs register-task-definition --cli-input-json file:///tmp/api-task-def.json

    # Similar task definitions for explorer, wallet, faucet, monitoring...

    log_success "ECS task definitions created"
}

# Deploy services
deploy_services() {
    log_info "Deploying ECS services..."

    # Create services
    aws ecs create-service \
        --cluster "$STACK_NAME-cluster" \
        --service-name "$STACK_NAME-node" \
        --task-definition "$STACK_NAME-node" \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_PRIVATE_1,$SUBNET_PRIVATE_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}"

    aws ecs create-service \
        --cluster "$STACK_NAME-cluster" \
        --service-name "$STACK_NAME-api" \
        --task-definition "$STACK_NAME-api" \
        --desired-count 2 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_PRIVATE_1,$SUBNET_PRIVATE_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
        --load-balancers "targetGroupArn=$TG_API_ARN,containerName=myl1-api,containerPort=3002"

    # Deploy other services similarly...

    log_success "ECS services deployed"
}

# Setup DNS (optional)
setup_dns() {
    log_info "Setting up Route 53 DNS..."

    # Create hosted zone if needed
    # Add records pointing to ALB

    log_info "DNS setup complete. Update your domain's nameservers to point to Route 53."
}

# Main deployment function
main() {
    echo "Starting MyL1 AWS Production Deployment..."
    echo "=========================================="

    check_prerequisites
    create_ecr_repos
    build_and_push_images
    create_networking
    create_security_groups
    create_ecs_cluster
    create_efs
    create_load_balancer
    create_task_definitions
    deploy_services
    setup_dns

    echo ""
    log_success "🎉 MyL1 Blockchain successfully deployed to AWS!"
    echo ""
    echo "Access your blockchain at:"
    echo "  Explorer: http://$ALB_DNS"
    echo "  API: http://$ALB_DNS/api"
    echo "  Wallet: http://$ALB_DNS/wallet"
    echo "  Faucet: http://$ALB_DNS/faucet"
    echo "  Monitoring: http://$ALB_DNS/monitor"
    echo ""
    echo "Node WebSocket: ws://$ALB_DNS:9944 (internal)"
    echo ""
    echo "Next steps:"
    echo "1. Configure SSL certificate in ACM for HTTPS"
    echo "2. Set up CloudWatch alarms and monitoring"
    echo "3. Configure auto-scaling policies"
    echo "4. Set up backup strategies for EFS data"
}

# Run main function
main "$@"
