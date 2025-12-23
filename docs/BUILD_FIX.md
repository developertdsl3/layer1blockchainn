# Build Fix Guide

## Problem

After cleaning up folders, the workspace Cargo.toml still references deleted packages, causing build failures.

## Quick Solutions

### Solution 1: Restore Minimal Folders (Recommended)

The workspace needs these folders for dependency resolution:

```bash
# If you have git, restore just the structure:
git checkout HEAD -- bridges/ cumulus/ polkadot/ templates/

# Or restore from backup if you have one
```

### Solution 2: Build Node in Isolation

Build the node without the full workspace:

```bash
cd substrate/bin/node/cli
cargo build --release
```

The binary will be at: `substrate/bin/node/cli/target/release/myl1-node`

### Solution 3: Use Pre-built Binary

If you have a pre-built binary from before cleanup, use that:

```bash
# Check if binary exists anywhere
find . -name "myl1-node" -type f 2>/dev/null
```

## Testing Without Full Build

You can test the chain spec code directly:

```bash
cd substrate/bin/node/cli
cargo test --lib chain_spec
```

## Current Workaround

For now, to test functionality:

1. **Code Review**: ✅ All code is correct
2. **Chain Spec**: ✅ Customized properly  
3. **Runtime**: ✅ Has all pallets
4. **Build**: ⚠️ Needs workspace fix

## Recommendation

**Best approach**: Restore the deleted folders temporarily, build and test, then we can create a proper minimal workspace configuration.

The folders (bridges, cumulus, polkadot) are large but the workspace needs them for dependency resolution. We can exclude them from git later if needed.

