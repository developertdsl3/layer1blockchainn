#!/bin/bash

# Fix IAM permissions for ECS Fargate deployment

echo "🔧 FIXING IAM PERMISSIONS FOR ECS FARGATE"
echo "=========================================="

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

echo ""
log_info "Since you can't modify IAM via CLI, please follow these manual steps:"
echo ""

echo -e "${BLUE}STEP 1: Go to IAM Console${NC}"
echo "=============================="
echo "1. Open: https://console.aws.amazon.com/iam/"
echo "2. Click 'Roles' in the left sidebar"
echo "3. Search for: AWSServiceRoleForECS"
echo "4. Click on the role name"
echo ""

echo -e "${BLUE}STEP 2: Attach Policy${NC}"
echo "========================="
echo "1. Click the 'Permissions' tab"
echo "2. Click 'Add permissions' → 'Attach policies'"
echo "3. Search for: AmazonECSTaskExecutionRolePolicy"
echo "4. Check the box next to it"
echo "5. Click 'Attach policies'"
echo ""

echo -e "${BLUE}STEP 3: Wait and Verify${NC}"
echo "==========================="
echo "1. Wait 2-3 minutes for changes to propagate"
echo "2. Run this command to check:"
echo ""
echo "   aws ecs describe-services --cluster myl1-blockchain-cluster \\"
echo "       --services myl1-blockchain-node --region us-east-1 \\"
echo "       --query 'services[0].runningCount'"
echo ""
echo "   Expected output: 1"
echo ""

echo -e "${BLUE}STEP 4: Get Your Blockchain Endpoints${NC}"
echo "=========================================="
echo "Once running, get the public IP:"
echo ""
echo "   aws ecs describe-tasks --cluster myl1-blockchain-cluster \\"
echo "       --tasks \$(aws ecs list-tasks --cluster myl1-blockchain-cluster \\"
echo "           --service-name myl1-blockchain-node --query 'taskArns[0]' --output text) \\"
echo "       --query 'tasks[0].attachments[0].details[?name==\`networkInterfaceId\`].value' \\"
echo "       --output text | xargs aws ec2 describe-network-interfaces \\"
echo "       --network-interface-ids --query 'NetworkInterfaces[0].Association.PublicIp' \\"
echo "       --output text"
echo ""

echo -e "${GREEN}ALTERNATIVE: Use AWS Console ECS${NC}"
echo "====================================="
echo ""
echo "If IAM permissions are blocked:"
echo ""
echo "1. Go to: https://console.aws.amazon.com/ecs/"
echo "2. Click 'Clusters' → 'myl1-blockchain-cluster'"
echo "3. Click 'Services' → 'myl1-blockchain-node'"
echo "4. Click 'Update'"
echo "5. Change 'Desired tasks' from 0 to 1"
echo "6. Click 'Update service'"
echo ""
echo "This should force ECS to try starting the task again."
echo ""

echo -e "${YELLOW}WHY THIS HAPPENED:${NC}"
echo "===================="
echo "Fargate requires an execution role to pull images from ECR"
echo "and write logs to CloudWatch. The role exists but needs the policy."
echo ""

echo -e "${BLUE}Need help?${NC} Just follow the steps above in your AWS Console!"


