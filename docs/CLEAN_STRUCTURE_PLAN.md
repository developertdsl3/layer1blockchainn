# Clean Folder Structure Plan

## Current Issues
- Full Polkadot SDK repository (huge, contains many unused components)
- Test data mixed with source code
- Unclear organization

## Proposed Clean Structure

```
layer1blockhain/
├── node/                    # Node implementation
│   ├── src/
│   │   ├── chain_spec.rs
│   │   ├── service.rs
│   │   ├── cli.rs
│   │   └── main.rs
│   └── Cargo.toml
│
├── runtime/                 # Runtime implementation
│   ├── src/
│   │   └── lib.rs
│   └── Cargo.toml
│
├── pallets/                 # Custom pallets (if needed)
│   └── (future custom pallets)
│
├── scripts/                 # Build and deployment scripts
│   ├── build.sh
│   ├── run-dev.sh
│   └── run-testnet.sh
│
├── config/                  # Configuration files
│   ├── chain-specs/
│   └── genesis/
│
├── docs/                    # Documentation
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   └── API.md
│
├── tests/                   # Integration tests
│
├── .gitignore
├── Cargo.toml              # Workspace root
├── Cargo.lock
└── README.md

```

## What to Keep
- Node CLI code (substrate/bin/node/cli)
- Runtime code (substrate/bin/node/runtime)
- Your custom files (PROJECT_PLAN.md, etc.)

## What to Remove/Archive
- polkadot/ (not needed for L1)
- cumulus/ (parachain stuff, not needed)
- bridges/ (not needed initially)
- templates/ (can reference but don't need in repo)
- prdoc/ (documentation, not needed)
- Test node data (alice-fresh, bob-fresh) - can archive

## Implementation Options

### Option 1: Minimal (Recommended)
Create a new clean structure and copy only needed files

### Option 2: Reorganize Existing
Move and organize existing files

### Option 3: Keep SDK, Organize
Keep SDK structure but add clear organization

Which approach do you prefer?

