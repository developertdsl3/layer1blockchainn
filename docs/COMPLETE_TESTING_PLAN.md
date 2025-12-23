# Complete Testing Plan - Phase 1

## Overview

This document outlines all testing required for Phase 1 completion.

## Pre-Testing Checklist

- [x] Clean folder structure
- [x] Chain spec customized
- [x] Runtime has all pallets
- [ ] Workspace builds successfully
- [ ] Node binary created

## Test Suite

### 1. Build Tests

```bash
# Test 1.1: Workspace builds
cargo build --release --package myl1-node-cli

# Test 1.2: Runtime compiles
cargo build --release --package kitchensink-runtime

# Expected: Both build successfully
```

### 2. Chain Spec Tests

```bash
# Test 2.1: Dev chain spec
./target/release/myl1-node build-spec --chain dev --disable-default-bootnode

# Test 2.2: Local chain spec
./target/release/myl1-node build-spec --chain local --disable-default-bootnode

# Test 2.3: Verify MYL1 token in spec
grep -i "MYL1" config/chain-specs/dev.json

# Expected: 
# - Specs generate without errors
# - MYL1 token appears in properties
# - Decimals set to 18
```

### 3. Node Startup Tests

```bash
# Test 3.1: Dev node starts
./target/release/myl1-node --dev

# Expected:
# - Node starts without errors
# - Blocks start producing
# - RPC available on ws://127.0.0.1:9944
```

### 4. Block Production Tests

```bash
# Test 4.1: Check block height via RPC
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "chain_getBlock", "params":[]}' \
  http://localhost:9933

# Test 4.2: Monitor block production
# Watch logs for "Prepared block" messages

# Expected:
# - Blocks produced every ~6 seconds (BABE)
# - Block numbers increment
```

### 5. Consensus Tests

```bash
# Test 5.1: BABE block production
# Check logs for BABE slot assignments

# Test 5.2: GRANDPA finality
# Check logs for GRANDPA finalization

# Expected:
# - BABE produces blocks
# - GRANDPA finalizes blocks periodically
```

### 6. Staking Tests

```bash
# Test 6.1: Check staking pallet active
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "state_call", "params":["Staking_validators", ""]}' \
  http://localhost:9933

# Test 6.2: Check validator set
# Use Polkadot.js Apps to query staking

# Expected:
# - Staking pallet responds
# - Validators visible (Alice in dev mode)
```

### 7. Transaction Fee Tests

```bash
# Test 7.1: Send transaction
# Use Polkadot.js Apps or subxt

# Test 7.2: Verify fee deduction
# Check balance before/after transaction

# Expected:
# - Transaction succeeds
# - Fees deducted correctly
```

### 8. Governance Tests (Basic)

```bash
# Test 8.1: Check Democracy pallet
# Query via RPC or Polkadot.js Apps

# Test 8.2: Check Council
# Verify council members exist

# Expected:
# - Governance pallets active
# - Can query state
```

## Automated Test Script

Run the complete test suite:

```bash
./scripts/test-phase1.sh
```

## Manual Testing

### Start Dev Node

```bash
./scripts/run-dev-node.sh
```

### Start Testnet (2 validators)

Terminal 1:
```bash
./scripts/run-testnet.sh
```

Terminal 2 (get peer ID from Terminal 1):
```bash
./target/release/myl1-node \
  --chain local \
  --bob \
  --port 30334 \
  --ws-port 9945 \
  --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/<PEER_ID>
```

## Expected Results

### ✅ Success Criteria

1. **Build**: Node compiles successfully
2. **Chain Specs**: Generate with MYL1 token
3. **Node Startup**: Starts without errors
4. **Block Production**: Blocks produced every ~6s
5. **Consensus**: BABE + GRANDPA working
6. **Staking**: Pallet active, validators visible
7. **Fees**: Transaction fees work
8. **Governance**: Pallets accessible

### ❌ Failure Indicators

- Build errors
- Node crashes on startup
- No block production
- RPC not responding
- Staking pallet errors

## Troubleshooting

### Build Fails
- Check Rust version: `rustc --version`
- Update dependencies: `cargo update`
- Clean build: `cargo clean && cargo build --release`

### Node Won't Start
- Check ports: 9933, 9944 available?
- Check logs for errors
- Verify chain spec is valid

### No Blocks
- Check validator keys
- Verify BABE configuration
- Check logs for consensus errors

## Next Steps After Testing

Once all tests pass:

1. ✅ Document results
2. ✅ Fix any issues found
3. ⏭️ Proceed to Phase 2 (multi-validator testnet)

