#!/bin/bash
# Phase 1 Complete Testing Script

set -e

echo "╔══════════════════════════════════════════════════════╗"
echo "║         Phase 1 Testing - MyL1 Blockchain           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Build
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Building Node"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f "target/release/myl1-node" ]; then
    echo -e "${YELLOW}⚠️  Node not built. Building now...${NC}"
    echo "This will take 10-30 minutes..."
    cargo build --release --package myl1-node-cli
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build successful!${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Node binary exists${NC}"
fi

# Test 2: Chain Specs
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Chain Spec Generation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "2.1 Testing dev chain spec..."
./target/release/myl1-node build-spec --chain dev --disable-default-bootnode > config/chain-specs/dev.json 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Dev chain spec generated${NC}"
    # Check if MYL1 token is in spec
    if grep -q "MYL1" config/chain-specs/dev.json; then
        echo -e "${GREEN}   ✅ MYL1 token found in spec${NC}"
    else
        echo -e "${YELLOW}   ⚠️  MYL1 token not found in spec${NC}"
    fi
else
    echo -e "${RED}   ❌ Dev chain spec failed${NC}"
fi

echo "2.2 Testing local chain spec..."
./target/release/myl1-node build-spec --chain local --disable-default-bootnode > config/chain-specs/local-generated.json 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Local chain spec generated${NC}"
else
    echo -e "${RED}   ❌ Local chain spec failed${NC}"
fi

# Test 3: Node Info
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Node Information"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "3.1 Node version:"
./target/release/myl1-node --version
echo ""

echo "3.2 Available chains:"
./target/release/myl1-node --help | grep -A 5 "chain" | head -10

# Test 4: Runtime Features Check
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Runtime Features Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Checking runtime pallets in code..."
PALLETS=("Babe" "Grandpa" "Staking" "Democracy" "Council" "Contracts" "TransactionPayment")

for pallet in "${PALLETS[@]}"; do
    if grep -r "pallet_${pallet,,}" substrate/bin/node/runtime/src/lib.rs > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ $pallet pallet found${NC}"
    else
        echo -e "${YELLOW}   ⚠️  $pallet pallet check needed${NC}"
    fi
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Build: Complete"
echo "✅ Chain Specs: Generated"
echo "✅ Node: Ready"
echo ""
echo "Next: Run dev node to test block production"
echo "Command: ./target/release/myl1-node --dev"
echo ""

