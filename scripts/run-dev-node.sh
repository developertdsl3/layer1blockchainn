#!/bin/bash
# Script to run development node

set -e

echo "Starting MyL1 Development Node..."
echo ""

# Check if built
if [ ! -f "target/release/myl1-node" ]; then
    echo "⚠️  Node not built. Please run: cargo build --release --package myl1-node-cli"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "MyL1 Devnet - Single Validator (Alice)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Chain: MyL1 Devnet"
echo "Token: MYL1 (18 decimals)"
echo "RPC: ws://127.0.0.1:9944"
echo "HTTP: http://127.0.0.1:9933"
echo ""
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

./target/release/myl1-node \
    --dev \
    --name "MyL1-Dev" \
    --rpc-cors all \
    --ws-external \
    --rpc-external

