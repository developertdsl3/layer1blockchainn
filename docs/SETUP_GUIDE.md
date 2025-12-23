# MyL1 Blockchain Setup Guide

## Prerequisites

- Rust (latest stable version)
- Git
- Linux/macOS/WSL

## Quick Start

### 1. Build the Node

```bash
cd /home/anupam/layer1blockhain
cargo build --release
```

### 2. Run Development Node

```bash
./target/release/myl1-node --dev
```

### 3. Run Local Testnet (2 validators)

```bash
# Terminal 1 - Alice
./target/release/myl1-node --chain local --alice --port 30333 --ws-port 9944

# Terminal 2 - Bob  
./target/release/myl1-node --chain local --bob --port 30334 --ws-port 9945 --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/12D3KooW...
```

## Chain Configuration

- **Chain Name**: MyL1
- **Token Symbol**: MYL1
- **Decimals**: 18
- **Consensus**: BABE + GRANDPA
- **Staking**: NPoS enabled
- **Governance**: Democracy, Council, Technical Committee
- **Smart Contracts**: Ink! + EVM (Revive)

## Current Features

✅ BABE block production
✅ GRANDPA finality
✅ NPoS staking
✅ Transaction fees
✅ Governance pallets
✅ Smart contract support

## Next Steps

See PROJECT_PLAN.md for Phase 2-5 implementation.

