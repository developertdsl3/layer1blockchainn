# Where Is Everything? - File Location Guide

## 📁 Organized Folders (Clean Structure)

### `config/` - Configuration Files
```
config/
└── chain-specs/
    ├── local.json          # Local testnet chain spec
    └── local-raw.json      # Raw chain spec
```

### `docs/` - All Documentation
```
docs/
├── SETUP_GUIDE.md          # How to setup and run
├── PROJECT_PLAN.md          # Full project plan
├── PHASE1_STATUS.md        # Phase 1 status
├── CLEAN_STRUCTURE.md      # Clean structure guide
├── CLEAN_STRUCTURE_PLAN.md # Structure planning
├── FOLDER_STRUCTURE.md     # Folder structure doc
└── CLEANUP_SUMMARY.md      # Cleanup summary
```

### `archive/` - Archived Test Data
```
archive/
├── alice-fresh/            # Old Alice validator data
└── bob-fresh/              # Old Bob validator data
```

### `scripts/` - Build Scripts
```
scripts/
└── reorganize.sh           # Reorganization script
```

## 📁 Framework Folders (Required - Don't Delete)

### `substrate/` - Substrate Framework
- **Location**: Root level
- **Purpose**: Core blockchain framework
- **Contains**: Node, runtime, pallets, primitives
- **Size**: ~69MB
- **Required**: ✅ YES - Don't delete!

### `umbrella/` - Workspace Dependencies
- **Location**: Root level
- **Purpose**: Polkadot SDK umbrella crate
- **Size**: ~148KB
- **Required**: ✅ YES - Don't delete!

## 📁 Optional Folders (Can Remove to Save Space)

### `polkadot/` - Polkadot Relay Chain
- **Location**: Root level
- **Purpose**: Polkadot-specific code
- **Size**: ~37MB
- **Required**: ❌ NO - Can remove if not needed

### `cumulus/` - Parachain Framework
- **Location**: Root level
- **Purpose**: Parachain development
- **Size**: ~66MB
- **Required**: ❌ NO - Can remove if not needed

### `bridges/` - Bridge Modules
- **Location**: Root level
- **Purpose**: Cross-chain bridges
- **Size**: ~5.4MB
- **Required**: ❌ NO - Can remove if not needed

### `templates/` - Example Templates
- **Location**: Root level
- **Purpose**: Example projects
- **Size**: ~25MB
- **Required**: ❌ NO - Can remove if not needed

### `prdoc/` - Documentation
- **Location**: Root level
- **Purpose**: PR documentation
- **Size**: ~6.4MB
- **Required**: ❌ NO - Can remove if not needed

### `target/` - Build Artifacts
- **Location**: Root level
- **Purpose**: Compiled code
- **Size**: ~20GB
- **Required**: ❌ NO - Can regenerate with `cargo build`

## 📄 Root Level Files

### Essential Files
- `Cargo.toml` - Workspace configuration (REQUIRED)
- `Cargo.lock` - Dependency lock file
- `README.md` - Main project README
- `.gitignore` - Git ignore rules

### Documentation Links
- `CODE_OF_CONDUCT.md` - Symlink to docs
- `CONTRIBUTING.md` - Symlink to docs

### Other Files
- `.rustfmt.toml` - Rust formatting config
- `.prdoc.toml` - PR doc config
- `docs/plans/L1_Blockchain_Development_Plan_Stage1.pdf` - Project plan PDF

## 🎯 Quick Reference

**Where are my docs?** → `docs/`
**Where are configs?** → `config/chain-specs/`
**Where is test data?** → `archive/`
**Where are scripts?** → `scripts/`
**Where is the node code?** → `substrate/bin/node/cli/`
**Where is the runtime?** → `substrate/bin/node/runtime/`

## 🧹 To Clean Further

If you want to remove build artifacts and local node data:

```bash
# Clean build artifacts (saves ~20GB, can regenerate)
rm -rf target/

# Remove local node data (if you created base paths like alice-fresh/, bob-fresh/, etc.)
rm -rf alice-fresh/ bob-fresh/ charlie-fresh/ archive/
```

**Note**: This repo includes Polkadot SDK sources (e.g. `polkadot/`, `cumulus/`, `bridges/`, `templates/`) as part of the workspace.
Removing them may break builds and is not recommended for client handoff.

