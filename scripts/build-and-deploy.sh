#!/bin/bash

# Build MyL1 Node and Deploy to AWS
# Complete automated script

set -euo pipefail

echo "🔨 BUILDING MYL1 NODE"
echo "===================="

# Build the binary
echo "Building MyL1 Node binary..."
cargo build --release --package myl1-node-cli

# Create artifacts directory and copy binary
echo "Creating artifacts..."
mkdir -p artifacts
cp target/release/myl1-node artifacts/substrate
chmod +x artifacts/substrate

echo "✅ Binary ready: artifacts/substrate"

echo ""
echo "🚀 DEPLOYING TO AWS"
echo "==================="

# Run AWS deployment
./scripts/deploy-blockchain-aws.sh


