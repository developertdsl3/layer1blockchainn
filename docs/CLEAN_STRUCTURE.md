# Clean Folder Structure Guide

## Current Problem
Your repository contains the entire Polkadot SDK (~20GB with target/), which includes:
- Full Substrate framework
- Polkadot relay chain code
- Cumulus parachain code
- Bridges
- Templates
- Test data

## Recommended Approach

Since you're building an L1 blockchain, you have two options:

### Option A: Keep SDK Structure (Easier)
Keep the current structure but organize it better:
- Keep `substrate/` folder (needed for dependencies)
- Keep `umbrella/` (workspace dependencies)
- Archive or remove: `polkadot/`, `cumulus/`, `bridges/`, `templates/`, `prdoc/`
- Move test data to `archive/`
- Clean `target/` (can regenerate)

### Option B: Minimal Structure (Cleaner but More Work)
Create a minimal structure with only what you need:
- Extract node and runtime code
- Use SDK as external dependency
- Much cleaner but requires more setup

## Recommended: Option A (Hybrid)

### Clean Structure:
```
layer1blockhain/
├── node/                    # Your node (symlink or copy from substrate/bin/node/cli)
├── runtime/                 # Your runtime (symlink or copy from substrate/bin/node/runtime)
├── substrate/               # Keep (needed for framework)
├── umbrella/                # Keep (workspace dependencies)
├── scripts/                 # Your scripts
├── config/                  # Chain specs and configs
│   ├── chain-specs/
│   └── genesis/
├── docs/                    # Documentation
├── archive/                 # Old test data
│   ├── alice-fresh/
│   └── bob-fresh/
├── .gitignore
├── Cargo.toml
└── README.md
```

## Quick Cleanup Commands

```bash
# 1. Archive test data
mkdir -p archive
mv alice-fresh bob-fresh archive/ 2>/dev/null || true

# 2. Remove unnecessary folders (optional - be careful!)
# rm -rf polkadot/ cumulus/ bridges/ templates/ prdoc/

# 3. Clean build artifacts (can regenerate)
# rm -rf target/

# 4. Organize configs
mkdir -p config/chain-specs
mv local.json local-raw.json config/chain-specs/ 2>/dev/null || true

# 5. Organize docs
mkdir -p docs
mv PROJECT_PLAN.md SETUP_GUIDE.md PHASE1_STATUS.md docs/ 2>/dev/null || true
```

## Important Notes

⚠️ **Don't delete `substrate/` or `umbrella/`** - These are needed for the build!

⚠️ **Don't delete `Cargo.toml`** - It defines the workspace

✅ **Safe to archive**: `alice-fresh/`, `bob-fresh/`, test data

✅ **Safe to remove**: `target/` (will regenerate on build)

## Next Steps

1. Run cleanup commands above
2. Update `.gitignore` 
3. Test build: `cargo build --release`
4. Verify node runs: `./target/release/myl1-node --dev`

