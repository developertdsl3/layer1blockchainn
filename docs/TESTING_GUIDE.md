# Testing Guide - Phase 1

## Quick Test

Run the test script:
```bash
./scripts/test-node.sh
```

## Manual Testing Steps

### 1. Build the Node

```bash
cargo build --release --package myl1-node-cli
```

**Note**: This may take 10-30 minutes on first build.

### 2. Test Chain Spec Generation

```bash
# Test dev chain spec
./target/release/myl1-node build-spec --chain dev --disable-default-bootnode > config/chain-specs/dev.json

# Test local chain spec
./target/release/myl1-node build-spec --chain local --disable-default-bootnode > config/chain-specs/local.json
```

### 3. Run Development Node

```bash
./target/release/myl1-node --dev
```

Expected output:
- Node should start
- Blocks should be produced
- RPC should be available on ws://127.0.0.1:9944

### 4. Test Block Production

In another terminal:
```bash
# Check block height
curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "chain_getBlock", "params":[]}' http://localhost:9933

# Or use Polkadot.js Apps
# Open: https://polkadot.js.org/apps
# Connect to: ws://127.0.0.1:9944
```

### 5. Test Staking (if configured)

Check if staking pallet is active:
```bash
curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "state_call", "params":["Staking_validators", ""]}' http://localhost:9933
```

### 6. Test Transaction Fees

Send a test transaction and verify fees are deducted.

## Expected Results

✅ Node builds successfully
✅ Chain specs generate correctly
✅ Node starts and produces blocks
✅ RPC endpoints respond
✅ Staking pallet is active (if configured)
✅ Transaction fees work

## Troubleshooting

### Build Errors
- If workspace errors: The Cargo.toml may need cleanup (we're working on this)
- If dependency errors: Run `cargo update`

### Runtime Errors
- Check logs for specific errors
- Verify chain spec is valid
- Check if ports are available (9933, 9944)

## Next Steps After Testing

1. ✅ Verify all Phase 1 requirements
2. ⏭️ Document any issues found
3. ⏭️ Proceed to Phase 2 (multi-validator testnet)

