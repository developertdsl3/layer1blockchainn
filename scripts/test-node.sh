#!/bin/bash
# Test script for MyL1 node

set -e

echo "=== MyL1 Node Testing ==="
echo ""

# Check if built
if [ ! -f "target/release/myl1-node" ]; then
    echo "⚠️  Node not built. Building now..."
    echo "This will take 10-30 minutes..."
    cargo build --release --package myl1-node-cli
fi

echo "✅ Node binary found"
echo ""
echo "=== Testing Chain Specs ==="

# Test dev chain spec
echo "1. Testing dev chain spec..."
./target/release/myl1-node build-spec --chain dev --disable-default-bootnode > /dev/null 2>&1 && echo "   ✅ Dev chain spec OK" || echo "   ❌ Dev chain spec failed"

# Test local chain spec  
echo "2. Testing local chain spec..."
./target/release/myl1-node build-spec --chain local --disable-default-bootnode > /dev/null 2>&1 && echo "   ✅ Local chain spec OK" || echo "   ❌ Local chain spec failed"

echo ""
echo "=== Node Info ==="
./target/release/myl1-node --version
./target/release/myl1-node --help | head -20

echo ""
echo "✅ Basic tests complete!"
echo ""
echo "To run dev node: ./target/release/myl1-node --dev"
