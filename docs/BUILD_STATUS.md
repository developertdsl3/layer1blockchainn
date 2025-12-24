# How to Check Build Status

## Quick Check

```bash
# Check if build is complete
ls -lh target/release/myl1-node

# If file exists: ✅ BUILD SUCCESSFUL
# If not: ⏳ Still building or not started
```

## Using the Check Script

```bash
./scripts/check-build.sh
```

This will tell you:
- ✅ If build is complete
- ⏳ If still building
- ⚠️ If not started

## Monitor Build Progress

### Method 1: Watch Command
```bash
watch -n 5 'ls -lh target/release/myl1-node 2>/dev/null && echo "✅ Built!" || echo "⏳ Building..."'
```

### Method 2: Check Process
```bash
# See if cargo is running
ps aux | grep cargo | grep -v grep

# See build output
tail -f target/release/.cargo-lock 2>/dev/null
```

### Method 3: Check Target Directory
```bash
# Watch target directory grow
du -sh target/
watch -n 10 'du -sh target/'
```

## Build Time

- **First build**: 10-30 minutes (compiles everything)
- **Subsequent builds**: 2-5 minutes (incremental)

## Signs Build is Complete

1. ✅ `target/release/myl1-node` file exists
2. ✅ File size: ~50-100MB
3. ✅ No cargo processes running
4. ✅ Terminal shows "Finished release"

## After Build Completes

```bash
# 1. Verify binary
./target/release/myl1-node --version

# 2. Run tests
./scripts/test-phase1.sh

# 3. Start node
./scripts/run-dev-node.sh
```

## Troubleshooting

### Build Stuck?
```bash
# Kill and restart
pkill -f cargo
cargo clean
cargo build --release --package myl1-node-cli
```

### Build Failed?
```bash
# Check errors
cargo build --release --package myl1-node-cli 2>&1 | tee build.log

# Common fixes:
cargo update
cargo clean
```

