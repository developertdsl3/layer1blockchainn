#!/bin/bash

# Manual AWS Deployment Steps for MyL1 Blockchain
# Follow these steps if automated script fails

echo "🛠️  MANUAL AWS DEPLOYMENT GUIDE"
echo "=============================="
echo ""
echo "Since AWS CLI installation failed, follow these manual steps:"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}STEP 1: Install AWS CLI Manually${NC}"
echo "======================================"
echo ""
echo "Visit: https://aws.amazon.com/cli/"
echo "Download: AWS CLI MSI installer for Windows"
echo "Install it on your Windows machine (not WSL)"
echo ""
echo "Then run in PowerShell/Command Prompt:"
echo "aws --version"
echo ""

echo -e "${BLUE}STEP 2: Configure AWS CLI${NC}"
echo "=============================="
echo ""
echo "Run in PowerShell/Command Prompt:"
echo "aws configure"
echo ""
echo "Enter your AWS credentials:"
echo "- AWS Access Key ID: [your access key]"
echo "- AWS Secret Access Key: [your secret key]"
echo "- Default region name: us-east-1"
echo "- Default output format: json"
echo ""

echo -e "${BLUE}STEP 3: Verify AWS Setup${NC}"
echo "============================"
echo ""
echo "Test AWS connection:"
echo "aws sts get-caller-identity"
echo ""
echo "You should see your account info"
echo ""

echo -e "${BLUE}STEP 4: Run Automated Deployment${NC}"
echo "===================================="
echo ""
echo "Once AWS CLI is working, run:"
echo "./scripts/deploy-blockchain-aws.sh"
echo ""

echo -e "${BLUE}STEP 5: Alternative - Use AWS Console${NC}"
echo "=========================================="
echo ""
echo "If CLI still doesn't work, you can deploy manually via AWS Console:"
echo ""
echo "1. Go to https://console.aws.amazon.com/ecs/"
echo "2. Create cluster: myl1-blockchain-cluster (Fargate)"
echo "3. Create ECR repository: myl1-node"
echo "4. Build and push Docker image:"
echo "   docker build -f docker/dockerfiles/substrate_injected.Dockerfile -t myl1-node:latest ."
echo "   aws ecr get-login-password | docker login --username AWS --password-stdin [ACCOUNT-ID].dkr.ecr.us-east-1.amazonaws.com"
echo "   docker tag myl1-node:latest [ACCOUNT-ID].dkr.ecr.us-east-1.amazonaws.com/myl1-node:latest"
echo "   docker push [ACCOUNT-ID].dkr.ecr.us-east-1.amazonaws.com/myl1-node:latest"
echo ""
echo "5. Create task definition:"
echo "   - Name: myl1-blockchain-node"
echo "   - Image: [ACCOUNT-ID].dkr.ecr.us-east-1.amazonaws.com/myl1-node:latest"
echo "   - CPU: 2 vCPU, Memory: 4 GB"
echo "   - Ports: 9944, 9933, 30333"
echo "   - Environment: CHAIN=local, WS_EXTERNAL=true, RPC_EXTERNAL=true"
echo ""
echo "6. Create service:"
echo "   - Launch type: Fargate"
echo "   - VPC: default"
echo "   - Subnets: all default subnets"
echo "   - Security group: allow 9944, 9933, 30333 from 0.0.0.0/0"
echo ""

echo -e "${GREEN}WHICH METHOD WOULD YOU LIKE TO USE?${NC}"
echo ""
echo "1. Install AWS CLI and run automated script (recommended)"
echo "2. Manual AWS Console deployment"
echo "3. Use AWS CloudShell (web-based, no installation needed)"
echo ""

echo -e "${YELLOW}For CloudShell method:${NC}"
echo "1. Go to https://console.aws.amazon.com/cloudshell/"
echo "2. Upload your project files or clone from GitHub"
echo "3. Run the deployment script"
echo ""

echo -e "${BLUE}Need help with any step?${NC}"


