#!/bin/bash

# Check MyL1 Deployment Status

REGION="us-east-1"
STACK_NAME="myl1-blockchain"

echo "🔍 MyL1 Deployment Status Check"
echo "================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI not installed"
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    log_error "AWS CLI not configured"
    exit 1
fi

echo "Region: $REGION"
echo ""

# Check ECR repository
log_info "Checking ECR repository..."
if aws ecr describe-repositories --repository-names myl1-node --region "$REGION" &> /dev/null; then
    log_success "ECR repository: myl1-node"
else
    log_error "ECR repository not found"
fi

# Check ECS cluster
log_info "Checking ECS cluster..."
if aws ecs describe-clusters --clusters "$STACK_NAME-cluster" --region "$REGION" | jq -r '.clusters[0].status' | grep -q ACTIVE; then
    log_success "ECS cluster: $STACK_NAME-cluster"
else
    log_error "ECS cluster not found or not active"
fi

# Check service
log_info "Checking ECS service..."
SERVICE_STATUS=$(aws ecs describe-services \
    --cluster "$STACK_NAME-cluster" \
    --services "$STACK_NAME-node" \
    --region "$REGION" \
    --query 'services[0].status' \
    --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$SERVICE_STATUS" = "ACTIVE" ]; then
    log_success "ECS service: $STACK_NAME-node (ACTIVE)"

    # Get running count
    RUNNING_COUNT=$(aws ecs describe-services \
        --cluster "$STACK_NAME-cluster" \
        --services "$STACK_NAME-node" \
        --region "$REGION" \
        --query 'services[0].runningCount' \
        --output text)

    if [ "$RUNNING_COUNT" = "1" ]; then
        log_success "Running tasks: $RUNNING_COUNT"

        # Get public IP
        TASK_ARN=$(aws ecs list-tasks \
            --cluster "$STACK_NAME-cluster" \
            --service-name "$STACK_NAME-node" \
            --region "$REGION" \
            --query 'taskArns[0]' \
            --output text 2>/dev/null)

        if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
            ENI_ID=$(aws ecs describe-tasks \
                --cluster "$STACK_NAME-cluster" \
                --tasks "$TASK_ARN" \
                --region "$REGION" \
                --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
                --output text 2>/dev/null)

            if [ -n "$ENI_ID" ] && [ "$ENI_ID" != "None" ]; then
                PUBLIC_IP=$(aws ec2 describe-network-interfaces \
                    --network-interface-ids "$ENI_ID" \
                    --region "$REGION" \
                    --query 'NetworkInterfaces[0].Association.PublicIp' \
                    --output text 2>/dev/null || echo "")

                if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "None" ]; then
                    echo ""
                    log_success "🎉 Blockchain Node is LIVE!"
                    echo "================================"
                    echo "WebSocket: ws://$PUBLIC_IP:9944"
                    echo "HTTP RPC:  http://$PUBLIC_IP:9933"
                    echo "P2P:       $PUBLIC_IP:30333"
                    echo ""
                    echo "✅ Ready for Vercel frontend deployment!"
                    echo "Add these env vars to your Vercel projects:"
                    echo "NEXT_PUBLIC_WS_ENDPOINT=ws://$PUBLIC_IP:9944"
                    echo "NEXT_PUBLIC_RPC_ENDPOINT=http://$PUBLIC_IP:9933"
                else
                    log_warning "Public IP not available yet"
                fi
            fi
        fi
    else
        log_warning "Running tasks: $RUNNING_COUNT (should be 1)"
    fi
elif [ "$SERVICE_STATUS" = "NOT_FOUND" ]; then
    log_error "ECS service not found"
else
    log_warning "ECS service status: $SERVICE_STATUS"
fi

# Check CloudWatch logs
log_info "Checking CloudWatch logs..."
if aws logs describe-log-groups --log-group-name-prefix "/ecs/$STACK_NAME-node" --region "$REGION" | jq -r '.logGroups[0].logGroupName' | grep -q "/ecs/$STACK_NAME-node"; then
    log_success "CloudWatch logs: /ecs/$STACK_NAME-node"
else
    log_error "CloudWatch log group not found"
fi

echo ""
echo "💡 Management Commands:"
echo "======================"
echo "# View recent logs"
echo "aws logs tail /ecs/$STACK_NAME-node --follow --region $REGION"
echo ""
echo "# Check service details"
echo "aws ecs describe-services --cluster $STACK_NAME-cluster --services $STACK_NAME-node --region $REGION"
echo ""
echo "# Restart service"
echo "aws ecs update-service --cluster $STACK_NAME-cluster --service $STACK_NAME-node --force-new-deployment --region $REGION"


