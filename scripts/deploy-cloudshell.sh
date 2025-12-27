#!/bin/bash

# AWS CloudShell Deployment Script
# Run this directly in AWS CloudShell (console.aws.amazon.com/cloudshell)

set -euo pipefail

REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_BASE="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
STACK_NAME="myl1-blockchain"

echo "⛓️  MyL1 Blockchain - CloudShell Deployment"
echo "=========================================="
echo "Region: $REGION"
echo "Account: $ACCOUNT_ID"
echo ""

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

# Clone repo in CloudShell
log_info "Setting up environment..."
git clone https://github.com/your-org/myl1-blockchain.git || log_warning "Git clone failed, assuming files are uploaded"
cd myl1-blockchain || true

# Install Docker if needed
if ! command -v docker &> /dev/null; then
    log_info "Installing Docker..."
    sudo yum update -y
    sudo yum install -y docker
    sudo service docker start
    sudo usermod -a -G docker $USER
fi

# Create ECR repository
log_info "Creating ECR repository..."
aws ecr create-repository --repository-name myl1-node --region "$REGION" || log_warning "Repository may already exist"

# Login to ECR
log_info "Logging in to ECR..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_BASE"

# Build and push image
log_info "Building and pushing Docker image..."
docker build -f docker/dockerfiles/substrate_injected.Dockerfile -t myl1-node:latest .

IMAGE_URI="$ECR_BASE/myl1-node:latest"
docker tag myl1-node:latest "$IMAGE_URI"
docker push "$IMAGE_URI"

log_success "Image pushed: $IMAGE_URI"

# Create ECS cluster
log_info "Creating ECS cluster..."
aws ecs create-cluster --cluster-name "$STACK_NAME-cluster" --region "$REGION" || log_warning "Cluster may already exist"

# Create CloudWatch log group
log_info "Creating CloudWatch log group..."
aws logs create-log-group --log-group-name "/ecs/$STACK_NAME-node" --region "$REGION" || log_warning "Log group may already exist"

# Create task definition
log_info "Creating task definition..."
cat > /tmp/task-def.json << EOF
{
    "family": "$STACK_NAME-node",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "2048",
    "memory": "4096",
    "containerDefinitions": [{
        "name": "myl1-node",
        "image": "$IMAGE_URI",
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
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": "/ecs/$STACK_NAME-node",
                "awslogs-region": "$REGION",
                "awslogs-stream-prefix": "ecs"
            }
        },
        "healthCheck": {
            "command": ["CMD-SHELL", "curl -f http://localhost:9933/health || exit 1"],
            "interval": 30,
            "timeout": 5,
            "retries": 3,
            "startPeriod": 60
        }
    }]
}
EOF

aws ecs register-task-definition --cli-input-json file:///tmp/task-def.json --region "$REGION"
log_success "Task definition created"

# Get network configuration
log_info "Getting network configuration..."
VPC_ID=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text --region "$REGION" 2>/dev/null || \
         aws ec2 describe-vpcs --query 'Vpcs[0].VpcId' --output text --region "$REGION")

SUBNETS=$(aws ec2 describe-subnets --filters Name=vpc-id,Values="$VPC_ID" --query 'Subnets[*].SubnetId' --output text --region "$REGION" | head -2 | tr '\t' ',')

# Create security group
log_info "Creating security group..."
SG_ID=$(aws ec2 create-security-group \
    --group-name "$STACK_NAME-sg" \
    --description "MyL1 Blockchain Node" \
    --vpc-id "$VPC_ID" \
    --region "$REGION" \
    --query 'GroupId' \
    --output text 2>/dev/null || \
    aws ec2 describe-security-groups --group-names "$STACK_NAME-sg" --region "$REGION" --query 'SecurityGroups[0].GroupId' --output text)

# Add rules
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 9944 --cidr "0.0.0.0/0" --region "$REGION" || true
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 9933 --cidr "0.0.0.0/0" --region "$REGION" || true
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 30333 --cidr "0.0.0.0/0" --region "$REGION" || true

log_success "Security group configured"

# Deploy service
log_info "Deploying service..."
aws ecs create-service \
    --cluster "$STACK_NAME-cluster" \
    --service-name "$STACK_NAME-node" \
    --task-definition "$STACK_NAME-node" \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
    --region "$REGION" || \
aws ecs update-service --cluster "$STACK_NAME-cluster" --service "$STACK_NAME-node" --desired-count 1 --region "$REGION"

log_success "Service deployed! Waiting for startup..."

# Wait and get endpoint
sleep 60

TASK_ARN=$(aws ecs list-tasks --cluster "$STACK_NAME-cluster" --service-name "$STACK_NAME-node" --region "$REGION" --query 'taskArns[0]' --output text 2>/dev/null)

if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
    ENI_ID=$(aws ecs describe-tasks --cluster "$STACK_NAME-cluster" --tasks "$TASK_ARN" --region "$REGION" --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text 2>/dev/null)

    if [ -n "$ENI_ID" ] && [ "$ENI_ID" != "None" ]; then
        PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids "$ENI_ID" --region "$REGION" --query 'NetworkInterfaces[0].Association.PublicIp' --output text 2>/dev/null || echo "")

        if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "None" ]; then
            echo ""
            log_success "🎉 BLOCKCHAIN NODE IS LIVE!"
            echo "=============================="
            echo "🌐 WebSocket: ws://$PUBLIC_IP:9944"
            echo "🔗 HTTP RPC:  http://$PUBLIC_IP:9933"
            echo "📡 P2P:       $PUBLIC_IP:30333"
            echo ""
            echo "✅ Ready for Vercel frontend deployment!"
            echo ""
            echo "Add these environment variables to your Vercel projects:"
            echo "NEXT_PUBLIC_WS_ENDPOINT=ws://$PUBLIC_IP:9944"
            echo "NEXT_PUBLIC_RPC_ENDPOINT=http://$PUBLIC_IP:9933"
        else
            log_warning "Public IP not available yet. Check AWS console."
        fi
    fi
fi

echo ""
log_info "Check status: aws ecs describe-services --cluster $STACK_NAME-cluster --services $STACK_NAME-node --region $REGION"
log_info "View logs: aws logs tail /ecs/$STACK_NAME-node --follow --region $REGION"


