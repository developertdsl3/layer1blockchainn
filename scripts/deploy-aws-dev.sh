#!/bin/bash
set -euo pipefail

# MyL1 AWS Development Deployment Script
# Quick deployment for testing and development

REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_BASE="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
STACK_NAME="myl1-dev"

echo "🚀 MyL1 AWS Dev Deployment"
echo "=========================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Step 1: Create ECR repositories
log_info "Creating ECR repositories..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_BASE

for repo in myl1-node myl1-rest-api myl1-explorer myl1-wallet myl1-faucet; do
    aws ecr create-repository --repository-name $repo --region $REGION || true
done
log_success "ECR repositories ready"

# Step 2: Build and push images
log_info "Building and pushing Docker images..."

# Build Node
log_info "Building MyL1 Node..."
docker build -f docker/dockerfiles/substrate_injected.Dockerfile -t myl1-node:latest .
docker tag myl1-node:latest $ECR_BASE/myl1-node:latest
docker push $ECR_BASE/myl1-node:latest
log_success "Node image pushed"

# Build API
log_info "Building REST API..."
docker build -f infra/rest-api/Dockerfile.production -t myl1-rest-api:latest infra/rest-api/
docker tag myl1-rest-api:latest $ECR_BASE/myl1-rest-api:latest
docker push $ECR_BASE/myl1-rest-api:latest
log_success "API image pushed"

# Build Explorer
log_info "Building Explorer..."
docker build -f explorer/Dockerfile.production -t myl1-explorer:latest explorer/
docker tag myl1-explorer:latest $ECR_BASE/myl1-explorer:latest
docker push $ECR_BASE/myl1-explorer:latest
log_success "Explorer image pushed"

# Build Wallet
log_info "Building Wallet..."
docker build -f wallet/Dockerfile.production -t myl1-wallet:latest wallet/
docker tag myl1-wallet:latest $ECR_BASE/myl1-wallet:latest
docker push $ECR_BASE/myl1-wallet:latest
log_success "Wallet image pushed"

# Build Faucet
log_info "Building Faucet..."
docker build -f infra/faucet/Dockerfile.production -t myl1-faucet:latest infra/faucet/
docker tag myl1-faucet:latest $ECR_BASE/myl1-faucet:latest
docker push $ECR_BASE/myl1-faucet:latest
log_success "Faucet image pushed"

# Step 3: Create ECS cluster
log_info "Creating ECS cluster..."
aws ecs create-cluster --cluster-name $STACK_NAME-cluster || true
log_success "ECS cluster ready"

# Step 4: Create task definitions
log_info "Creating task definitions..."

# Node task definition
cat > /tmp/node-task.json << EOF
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
            {"containerPort": 9933, "protocol": "tcp"}
        ],
        "environment": [
            {"name": "CHAIN", "value": "local"}
        ],
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": "/ecs/$STACK_NAME-node",
                "awslogs-region": "$REGION",
                "awslogs-stream-prefix": "ecs"
            }
        }
    }]
}
EOF

aws ecs register-task-definition --cli-input-json file:///tmp/node-task.json

# API task definition
cat > /tmp/api-task.json << EOF
{
    "family": "$STACK_NAME-api",
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

aws ecs register-task-definition --cli-input-json file:///tmp/api-task.json

# Explorer task definition
cat > /tmp/explorer-task.json << EOF
{
    "family": "$STACK_NAME-explorer",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "512",
    "memory": "1024",
    "containerDefinitions": [{
        "name": "myl1-explorer",
        "image": "$ECR_BASE/myl1-explorer:latest",
        "essential": true,
        "portMappings": [{"containerPort": 3000, "protocol": "tcp"}],
        "environment": [
            {"name": "PORT", "value": "3000"},
            {"name": "REACT_APP_API_URL", "value": "http://myl1-api-service:3002"}
        ],
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": "/ecs/$STACK_NAME-explorer",
                "awslogs-region": "$REGION",
                "awslogs-stream-prefix": "ecs"
            }
        }
    }]
}
EOF

aws ecs register-task-definition --cli-input-json file:///tmp/explorer-task.json

log_success "Task definitions created"

# Step 5: Get default VPC and subnets
log_info "Getting network configuration..."
VPC_ID=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text)
SUBNETS=$(aws ec2 describe-subnets --filters Name=vpc-id,Values=$VPC_ID Name=default-for-az,Values=true --query 'Subnets[*].SubnetId' --output text | tr '\t' ',')

log_success "Network configuration ready"

# Step 6: Create CloudWatch log groups
log_info "Creating CloudWatch log groups..."
aws logs create-log-group --log-group-name /ecs/$STACK_NAME-node || true
aws logs create-log-group --log-group-name /ecs/$STACK_NAME-api || true
aws logs create-log-group --log-group-name /ecs/$STACK_NAME-explorer || true
log_success "Log groups created"

# Step 7: Deploy services
log_info "Deploying services..."

# Deploy Node
log_info "Deploying MyL1 Node..."
aws ecs create-service \
    --cluster $STACK_NAME-cluster \
    --service-name $STACK_NAME-node \
    --task-definition $STACK_NAME-node \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],assignPublicIp=ENABLED}"

# Get node service details
NODE_ARN=$(aws ecs describe-services --cluster $STACK_NAME-cluster --services $STACK_NAME-node --query 'services[0].serviceArn' --output text)

# Wait for node to be running
log_info "Waiting for node to start..."
aws ecs wait services-stable --cluster $STACK_NAME-cluster --services $STACK_NAME-node

# Get node IP
TASK_ARN=$(aws ecs list-tasks --cluster $STACK_NAME-cluster --service-name $STACK_NAME-node --query 'taskArns[0]' --output text)
NODE_IP=$(aws ecs describe-tasks --cluster $STACK_NAME-cluster --tasks $TASK_ARN --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)

if [ -n "$NODE_IP" ]; then
    NETWORK_INTERFACE=$(aws ec2 describe-network-interfaces --network-interface-ids $NODE_IP --query 'NetworkInterfaces[0].PrivateIpAddress' --output text)
    NODE_PRIVATE_IP=$NETWORK_INTERFACE
fi

# Deploy API
log_info "Deploying REST API..."
aws ecs create-service \
    --cluster $STACK_NAME-cluster \
    --service-name $STACK_NAME-api \
    --task-definition $STACK_NAME-api \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],assignPublicIp=ENABLED}"

# Deploy Explorer
log_info "Deploying Explorer..."
aws ecs create-service \
    --cluster $STACK_NAME-cluster \
    --service-name $STACK_NAME-explorer \
    --task-definition $STACK_NAME-explorer \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],assignPublicIp=ENABLED}"

log_success "Services deployed!"

# Get public IPs
log_info "Getting service endpoints..."

# Function to get service public IP
get_service_ip() {
    local service_name=$1
    local task_arn=$(aws ecs list-tasks --cluster $STACK_NAME-cluster --service-name $service_name --query 'taskArns[0]' --output text 2>/dev/null)
    if [ -n "$task_arn" ] && [ "$task_arn" != "None" ]; then
        local eni_id=$(aws ecs describe-tasks --cluster $STACK_NAME-cluster --tasks $task_arn --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text 2>/dev/null)
        if [ -n "$eni_id" ] && [ "$eni_id" != "None" ]; then
            local public_ip=$(aws ec2 describe-network-interfaces --network-interface-ids $eni_id --query 'NetworkInterfaces[0].Association.PublicIp' --output text 2>/dev/null)
            echo $public_ip
        fi
    fi
}

EXPLORER_IP=$(get_service_ip $STACK_NAME-explorer)
API_IP=$(get_service_ip $STACK_NAME-api)

echo ""
echo "🎉 MyL1 Development Environment Deployed!"
echo "=========================================="
echo ""
echo "Service Endpoints:"
if [ -n "$EXPLORER_IP" ]; then
    echo "  Explorer: http://$EXPLORER_IP:3000"
fi
if [ -n "$API_IP" ]; then
    echo "  REST API: http://$API_IP:3002"
fi
echo ""
echo "Node WebSocket: ws://$NODE_PRIVATE_IP:9944 (internal)"
echo ""
echo "To check service status:"
echo "  aws ecs describe-services --cluster $STACK_NAME-cluster --services $STACK_NAME-node $STACK_NAME-api $STACK_NAME-explorer"
echo ""
echo "To view logs:"
echo "  aws logs tail /ecs/$STACK_NAME-node --follow"
echo "  aws logs tail /ecs/$STACK_NAME-api --follow"
echo "  aws logs tail /ecs/$STACK_NAME-explorer --follow"
echo ""
echo "To cleanup:"
echo "  aws ecs update-service --cluster $STACK_NAME-cluster --service $STACK_NAME-node --desired-count 0"
echo "  aws ecs update-service --cluster $STACK_NAME-cluster --service $STACK_NAME-api --desired-count 0"
echo "  aws ecs update-service --cluster $STACK_NAME-cluster --service $STACK_NAME-explorer --desired-count 0"
