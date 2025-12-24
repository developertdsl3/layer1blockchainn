#!/bin/bash
# Script to run 2-node local testnet

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "MyL1 2-Node Local Testnet Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if built
if [ ! -f "target/release/myl1-node" ]; then
    echo "⚠️  Node not built. Please run: cargo build --release --package myl1-node-cli"
    exit 1
fi

echo "This script will start Alice node."
echo ""
echo "After Alice starts, you'll see a peer ID in the logs like:"
echo "  Local node identity is: 12D3KooW..."
echo ""
echo "Then in another terminal, run Bob with:"
echo "  ./scripts/run-bob-node.sh <ALICE_PEER_ID>"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Starting Alice node..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Clean up old base path completely
echo "🧹 Cleaning up any existing base path..."
rm -rf ./alice-fresh
echo "✅ Base path cleaned"
echo ""

# Re-enable exit on error
set -e

echo "Alice Node:"
echo "  P2P Port: 30333"
echo "  RPC Port: 9933 (HTTP + WebSocket)"
echo "  Base Path: ./alice-fresh"
echo ""
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Use --unsafe-force-node-key-generation for local testing
# This allows the node to generate a network key automatically
./target/release/myl1-node \
    --chain local \
    --alice \
    --validator \
    --base-path ./alice-fresh \
    --port 30333 \
    --rpc-port 9933 \
    --rpc-cors all \
    --unsafe-rpc-external \
    --unsafe-force-node-key-generation \
    --name "MyL1-Alice"

