# Phase 2 – Validator Network & Governance (Local + Deploy-Ready)

## Local multi-validator testnet (5 validators)

### Prerequisites

- Build the node:

```bash
cargo build --release --package myl1-node-cli
```

- Install Zombienet (one time):
  - Download from `https://github.com/paritytech/zombienet/releases`
  - Ensure `zombienet` is in PATH, or set `ZOMBIENET_BIN=/abs/path/to/zombienet`

### Run

```bash
./scripts/run-zombienet-5.sh
```

Zombienet will spawn a local network and print endpoints/log locations.

## Governance testing (smoke)

Governance pallets are included in the runtime. For functional proof on a running network:

- Connect Polkadot.js Apps to a node WS endpoint (shown by Zombienet).
- Verify pallets in UI:
  - **Democracy**
  - **Council / Collective**
  - **Technical Committee**
- Submit a minimal proposal (e.g. remark) and vote.

## What “Public Testnet” means (deployment)

To claim Phase 2 is fully delivered to a client, you must also provide:

- 3–5 validator machines (separate hosts)
- public bootnodes
- at least 1 public RPC + WS endpoint
- telemetry (optional but recommended)
- a short “validator onboarding” doc (keys, service files, ports, slashing config)


