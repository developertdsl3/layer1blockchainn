#!/bin/bash
# Script to run Bob node and connect to Alice

set -e

if [ -z "$1" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "MyL1 Bob Node - Connect to Alice"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Usage: $0 <ALICE_PEER_ID>"
    echo ""
    echo "Example:"
    echo "  $0 12D3KooWJW4GfKPZbZEPf3ijLTpWEk8sjvMNRdo1AvX5644AfxgE"
    echo ""
    echo "To get Alice's peer ID, check the logs from Alice node:"
    echo "  Local node identity is: 12D3KooW..."
    echo ""
    exit 1
fi

ALICE_PEER_ID="$1"

# Check if built
if [ ! -f "target/release/myl1-node" ]; then
    echo "⚠️  Node not built. Please run: cargo build --release --package myl1-node-cli"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Starting Bob node..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Clean up old base path if it exists and has issues
if [ -d "./bob-fresh" ]; then
    echo "⚠️  Found existing base path. Removing to start fresh..."
    rm -rf ./bob-fresh
    echo "✅ Cleaned up old base path"
    echo ""
fi

echo "Bob Node:"
echo "  P2P Port: 30334"
echo "  RPC Port: 9934 (HTTP + WebSocket)"
echo "  Base Path: ./bob-fresh"
echo "  Connecting to Alice: $ALICE_PEER_ID"
echo ""
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Use --unsafe-force-node-key-generation for local testing
# This allows the node to generate a network key automatically
# Use --unsafe-rpc-external for validators (required for external RPC access)
./target/release/myl1-node \
    --chain local \
    --bob \
    --validator \
    --base-path ./bob-fresh \
    --port 30334 \
    --rpc-port 9934 \
    --rpc-cors all \
    --unsafe-rpc-external \
    --unsafe-force-node-key-generation \
    --bootnodes "/ip4/127.0.0.1/tcp/30333/p2p/$ALICE_PEER_ID" \
    --name "MyL1-Bob"

