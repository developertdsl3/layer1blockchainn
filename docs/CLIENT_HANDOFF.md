# Client Handoff (MyL1 – Stage 1)

## What you are receiving

- **Node**: `myl1-node` (package: `myl1-node-cli`)
- **Runtime**: `myl1-runtime` (Wasm is built during `cargo build --release`)
- **Chain specs**: `config/chain-specs/` (includes local specs; scripts can regenerate)
- **Explorer**: `explorer/` (React)
- **Wallet**: `wallet/` (React)
- **Docs**: `docs/` (see `docs/INDEX.md`)

## Reproducible build

This repo pins Rust via `rust-toolchain.toml`.

### Build

```bash
cargo build --release --package myl1-node-cli
```

### Smoke-test

```bash
./target/release/myl1-node --version
./scripts/test-phase1.sh
```

## Running

### Dev node (single validator)

```bash
./scripts/run-dev-node.sh
```

### Local testnet (2 validators)

```bash
# Terminal 1 (Alice)
./target/release/myl1-node --chain local --alice --validator --port 30333 --rpc-port 9944 --name "MyL1-Alice"

# Terminal 2 (Bob) - use Alice's peer ID from logs for <ALICE_PEER_ID>
./target/release/myl1-node --chain local --bob --validator --port 30334 --rpc-port 9945 --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/<ALICE_PEER_ID> --name "MyL1-Bob"
```

## What to deliver as “Stage 1”

- **Source**: this repository at a git tag (example: `stage1-v1.0.0`)
- **Binary**: `myl1-node` for the agreed OS/arch (or a Docker image)
- **Runtime Wasm**: `myl1_runtime.compact.wasm` from the build output (for upgrades/audit)
- **Chain spec(s)**: the JSON you intend to run (e.g. `config/chain-specs/local-raw.json`)
- **Docs**: `docs/` (especially setup/testing + architecture)

### One-command packaging (optional)

```bash
./scripts/package-stage1.sh
```

## Recommended handoff checklist (before sending)

- `git status` is clean
- `./scripts/test-phase1.sh` passes
- `./target/release/myl1-node --dev` produces blocks
- No local chain DBs are committed (e.g. `alice-fresh/`, `bob-fresh/`, `target/`)
- Optional Phase 2 smoke: `./scripts/test-phase2.sh` (governance + staking snapshot)

## Optional: pre-commit hooks

If you use `pre-commit`, this repo includes `.pre-commit-config.yaml`:

```bash
pipx install pre-commit
pre-commit install
```


