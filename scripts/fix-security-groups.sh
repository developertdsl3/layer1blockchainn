#!/bin/bash

# Fix AWS Security Groups for MyL1 blockchain

INSTANCE_IP="13.211.114.206"
INSTANCE_ID="i-0e4cb9b36de96cfa5"
SG_ID="sg-0e553a93885146d0d"

echo "🔧 FIXING SECURITY GROUPS FOR MYL1 BLOCKCHAIN"
echo "Instance: $INSTANCE_ID"
echo "Security Group: $SG_ID"
echo "Region: ap-southeast-2"
echo ""

# Add required ports
echo "🚪 Adding required ports..."

# WebSocket port 9944
echo "Adding port 9944 (WebSocket)..."
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 9944 --cidr 0.0.0.0/0

# HTTP-RPC port 9933
echo "Adding port 9933 (HTTP-RPC)..."
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 9933 --cidr 0.0.0.0/0

# P2P port 30333
echo "Adding port 30333 (P2P)..."
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 30333 --cidr 0.0.0.0/0

# Prometheus port 9615
echo "Adding port 9615 (Prometheus)..."
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 9615 --cidr 0.0.0.0/0

echo ""
echo "✅ SECURITY GROUPS FIXED!"
echo ""
echo "🌐 Your blockchain is now accessible:"
echo "WebSocket: ws://$INSTANCE_IP:9944"
echo "HTTP RPC:  http://$INSTANCE_IP:9933"
echo "P2P:       $INSTANCE_IP:30333"
echo "Prometheus: $INSTANCE_IP:9615"
echo ""
echo "🧪 Test WebSocket:"
echo "curl -X POST -H 'Content-Type: application/json' --data '{\"jsonrpc\":\"2.0\",\"method\":\"system_health\",\"params\":[],\"id\":1}' http://$INSTANCE_IP:9944"
