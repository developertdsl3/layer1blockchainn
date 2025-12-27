#!/bin/bash

# Deploy blockchain to new EC2 instance

INSTANCE_IP="13.211.114.206"
KEY_FILE="myl1-key.pem"

echo "🚀 DEPLOYING TO NEW EC2 INSTANCE: $INSTANCE_IP"
echo ""

# SSH and install Docker
echo "📦 Installing Docker..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ec2-user@"$INSTANCE_IP" << 'EOF'
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker $USER
echo "Docker installed successfully"
EOF

echo "⏳ Waiting for Docker permissions..."
sleep 5

# SSH again and run blockchain
echo "🏗️  Starting blockchain..."
ssh -i "$KEY_FILE" ec2-user@"$INSTANCE_IP" << 'EOF'
docker pull gyufugugu/myl1-node:latest
docker run -d \
  --name myl1-node \
  -p 9944:9944 \
  -p 9933:9933 \
  -p 30333:30333 \
  --restart unless-stopped \
  gyufugugu/myl1-node:latest \
  --dev --rpc-external --prometheus-external --prometheus-port 9615

echo "Blockchain deployment initiated"
docker ps
EOF

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 ENDPOINTS:"
echo "WebSocket: ws://$INSTANCE_IP:9944"
echo "HTTP RPC:  http://$INSTANCE_IP:9933"
echo "P2P:       $INSTANCE_IP:30333"
echo ""
echo "🧪 TEST COMMAND:"
echo "curl -X POST -H 'Content-Type: application/json' --data '{\"jsonrpc\":\"2.0\",\"method\":\"system_health\",\"params\":[],\"id\":1}' http://$INSTANCE_IP:9944"


