# Folder Structure

## Current Clean Structure

```
layer1blockhain/
│
├── 📁 node/                    # Node implementation (from substrate/bin/node/cli)
│   └── (Node CLI code)
│
├── 📁 runtime/                 # Runtime implementation (from substrate/bin/node/runtime)
│   └── (Runtime code)
│
├── 📁 substrate/               # Substrate framework (REQUIRED - don't delete!)
│   ├── bin/node/              # Your node and runtime
│   ├── client/                # Client libraries
│   ├── frame/                 # FRAME pallets
│   └── primitives/            # Core primitives
│
├── 📁 umbrella/                # Workspace dependencies (REQUIRED)
│   └── (Polkadot SDK umbrella crate)
│
├── 📁 config/                  # Configuration files
│   └── chain-specs/           # Chain specifications
│       ├── local.json
│       └── local-raw.json
│
├── 📁 docs/                     # Documentation
│   ├── SETUP_GUIDE.md
│   ├── PROJECT_PLAN.md
│   ├── PHASE1_STATUS.md
│   ├── CLEAN_STRUCTURE.md
│   └── FOLDER_STRUCTURE.md (this file)
│
├── 📁 scripts/                  # Build and deployment scripts
│   └── reorganize.sh
│
├── 📁 archive/                  # Archived test data
│   ├── alice-fresh/
│   └── bob-fresh/
│
├── 📁 bridges/                  # Bridge modules (can be removed if not needed)
├── 📁 cumulus/                  # Parachain code (can be removed if not needed)
├── 📁 polkadot/                 # Polkadot relay chain (can be removed if not needed)
├── 📁 prdoc/                    # Documentation (can be removed)
├── 📁 templates/                # Templates (can be removed)
│
├── 📄 Cargo.toml                # Workspace root (REQUIRED)
├── 📄 Cargo.lock                # Dependency lock file
├── 📄 README.md                 # Main README
├── 📄 .gitignore                # Git ignore rules
└── 📄 L1 Blockchain Development Plan (Stage 1) (1).pdf
```

## Essential Folders (DO NOT DELETE)

- ✅ `substrate/` - Framework code, required for build
- ✅ `umbrella/` - Workspace dependencies
- ✅ `Cargo.toml` - Workspace configuration

## Optional Folders (Can Remove to Save Space)

- ⚠️ `polkadot/` - Only needed for Polkadot relay chain (not needed for L1)
- ⚠️ `cumulus/` - Only needed for parachains (not needed for L1)
- ⚠️ `bridges/` - Only needed for cross-chain bridges
- ⚠️ `templates/` - Example templates (can reference externally)
- ⚠️ `prdoc/` - Documentation (can be viewed online)
- ⚠️ `target/` - Build artifacts (can regenerate, ~20GB)

## Organized Folders

- ✅ `config/` - All configuration files
- ✅ `docs/` - All documentation
- ✅ `archive/` - Test data and old files
- ✅ `scripts/` - Build and utility scripts

## Size Reference

```
substrate/    69M   (REQUIRED)
umbrella/     148K  (REQUIRED)
polkadot/     37M   (Optional - can remove)
cumulus/      66M   (Optional - can remove)
bridges/      5.4M  (Optional - can remove)
target/       20G   (Can regenerate)
```

## Cleanup Commands (Optional)

If you want to free up space:

```bash
# Remove optional folders (be careful!)
# rm -rf polkadot/ cumulus/ bridges/ templates/ prdoc/

# Clean build artifacts (will regenerate)
# rm -rf target/

# This will free up ~100MB+ but keep essential functionality
```

## Next Steps

1. ✅ Structure organized
2. ✅ Test data archived
3. ✅ Configs organized
4. ✅ Docs organized
5. ⏭️ Test build: `cargo build --release`
6. ⏭️ Verify node runs: `./target/release/myl1-node --dev`

