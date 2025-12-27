#!/bin/bash

# Simple EC2-based deployment (no Fargate/IAM issues)

echo "🖥️  MYL1 BLOCKCHAIN - EC2 DEPLOYMENT"
echo "==================================="

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

# Push to Docker Hub instead of ECR (simpler)
log_info "Pushing to Docker Hub..."
echo "You'll need to:"
echo "1. Create Docker Hub account: https://hub.docker.com/"
echo "2. Login: docker login"
echo "3. Tag: docker tag myl1-node:latest yourusername/myl1-node:latest"
echo "4. Push: docker push yourusername/myl1-node:latest"
echo ""

# Launch EC2 instance
log_info "Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id ami-0c7217cdde317cfec \
    --count 1 \
    --instance-type t3.medium \
    --security-group-ids sg-09db33bd7f5799cc3 \
    --user-data '#!/bin/bash
# MyL1 Blockchain Setup Script
exec > /var/log/user-data.log 2>&1
set -x

echo "Starting MyL1 blockchain setup..."

# Update system
yum update -y

# Install Docker
yum install -y docker
service docker start
usermod -a -G docker ec2-user

# Wait for Docker to be ready
sleep 10

# Pull and run blockchain
echo "Pulling MyL1 blockchain image..."
docker pull gyufugugu/myl1-node:latest

echo "Starting MyL1 blockchain..."
docker run -d \
  --name myl1-node \
  -p 9944:9944 \
  -p 9933:9933 \
  -p 30333:30333 \
  --restart unless-stopped \
  gyufugugu/myl1-node:latest \
  --dev --ws-external --rpc-external --prometheus-external --prometheus-port 9615

# Check if container started
sleep 5
if docker ps | grep -q myl1-node; then
    echo "MyL1 blockchain started successfully"
    docker logs myl1-node
else
    echo "MyL1 blockchain failed to start"
    docker logs myl1-node || echo "No logs available"
fi

# Optional: Install monitoring
echo "Starting monitoring stack..."
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  --restart unless-stopped \
  prom/prometheus

docker run -d \
  --name grafana \
  -p 3000:3000 \
  --restart unless-stopped \
  grafana/grafana

echo "Setup complete. Check logs at /var/log/user-data.log"
' \
    --query 'Instances[0].InstanceId' \
    --output text \
    --region us-east-1)

log_success "EC2 instance launched: $INSTANCE_ID"

# Wait for instance to be running
log_info "Waiting for instance to start..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region us-east-1

# Get public IP
sleep 10
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --region us-east-1)

log_success "BLOCKCHAIN DEPLOYED!"
echo ""
echo "🌐 ENDPOINTS:"
echo "============="
echo "WebSocket: ws://$PUBLIC_IP:9944"
echo "HTTP RPC:  http://$PUBLIC_IP:9933"
echo "P2P:       $PUBLIC_IP:30333"
echo "Grafana:   http://$PUBLIC_IP:3000 (admin/admin)"
echo "Prometheus: http://$PUBLIC_IP:9090"
echo ""
echo "📊 MANAGEMENT:"
echo "=============="
echo "Check status: aws ec2 describe-instances --instance-ids $INSTANCE_ID --region us-east-1"
echo "Stop instance: aws ec2 stop-instances --instance-ids $INSTANCE_ID --region us-east-1"
echo "Start instance: aws ec2 start-instances --instance-ids $INSTANCE_ID --region us-east-1"
echo "Terminate: aws ec2 terminate-instances --instance-ids $INSTANCE_ID --region us-east-1"
echo ""
echo "💰 COST: ~$30/month (EC2 t3.medium)"
echo ""
echo "🎯 READY FOR VERCEL FRONTENDS!"
