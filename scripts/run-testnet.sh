#!/bin/bash
# Script to run local testnet with 2 validators

set -e

echo "Starting MyL1 Local Testnet (2 validators)..."
echo ""

# Check if built
if [ ! -f "target/release/myl1-node" ]; then
    echo "⚠️  Node not built. Please run: cargo build --release --package myl1-node-cli"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "MyL1 Local Testnet Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will start Alice node. In another terminal, run:"
echo "  ./target/release/myl1-node --chain local --bob --port 30334 --ws-port 9945 --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/<PEER_ID>"
echo ""
echo "Alice Node:"
echo "  Port: 30333"
echo "  WS: 9944"
echo "  HTTP: 9933"
echo ""
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

./target/release/myl1-node \
    --chain local \
    --alice \
    --port 30333 \
    --ws-port 9944 \
    --rpc-port 9933 \
    --rpc-cors all \
    --ws-external \
    --rpc-external \
    --name "MyL1-Alice"

