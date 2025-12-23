# MyL1 Blockchain

A production-ready Layer-1 blockchain built with Substrate framework, featuring validators, staking, governance, smart contracts (Ink! + EVM), and robust infrastructure for future stablecoin deployment.

## 🚀 Quick Start

### Build

```bash
cargo build --release --package myl1-node-cli
```

### Run Development Node

```bash
./target/release/myl1-node --chain dev --alice
```

### Run Local Testnet (2 Validators)

```bash
# Terminal 1 - Alice
./target/release/myl1-node \
    --chain local \
    --alice \
    --validator \
    --base-path ./alice-fresh \
    --port 30333 \
    --rpc-port 9944 \
    --unsafe-rpc-external \
    --unsafe-force-node-key-generation \
    --name "MyL1-Alice"

# Terminal 2 - Bob (after getting Alice's peer ID from logs)
./target/release/myl1-node \
    --chain local \
    --bob \
    --validator \
    --base-path ./bob-fresh \
    --port 30334 \
    --rpc-port 9945 \
    --unsafe-rpc-external \
    --unsafe-force-node-key-generation \
    --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/<ALICE_PEER_ID> \
    --name "MyL1-Bob"
```

## ✨ Features

### ✅ Phase 1: Core Architecture (COMPLETE)
- ✅ **Consensus**: BABE (block production) + GRANDPA (finality)
- ✅ **Staking**: NPoS (Nominated Proof of Stake)
- ✅ **Governance**: Democracy, Council, Technical Committee
- ✅ **Smart Contracts**: Ink! and EVM compatibility (Revive)
- ✅ **Transaction Fees**: Gas model with TransactionPayment pallet
- ✅ **Token**: MYL1 (18 decimals)

### ⚙️ Phase 2: Validator Network & Governance (CONFIGURED)
- ✅ Multi-validator support
- ✅ Governance pallets active
- ✅ Staking rewards configured (2.5%-10% inflation)
- ⏳ Testing in progress

### ⚙️ Phase 3: Smart Contract Layer (CONFIGURED)
- ✅ Ink! contracts enabled
- ✅ EVM (Revive) enabled
- ✅ Multi-token support (Assets pallet)
- ⏳ Testing in progress

### ✅ Phase 4: Infrastructure & Monitoring (IN PROGRESS)
- ✅ **Blockchain Explorer** - React-based block explorer
- ✅ **Wallet Integration** - Web wallet with Polkadot.js
- ⏳ RPC nodes deployment
- ⏳ Monitoring (Prometheus + Grafana)

### 📋 Phase 5: QA & Documentation (PLANNED)
- ⏳ Full integration testing
- ⏳ Complete documentation
- ⏳ Audit preparation

## 📊 Network Configuration

- **Chain Name**: MyL1
- **Token Symbol**: MYL1
- **Decimals**: 18
- **Consensus**: BABE + GRANDPA
- **Block Time**: ~6 seconds
- **Finality**: 1-2 seconds
- **Max Validators**: 1000

## 📁 Project Structure

```
layer1blockhain/
├── substrate/bin/node/     # Node and runtime implementation
│   ├── cli/                # Node CLI
│   └── runtime/            # Runtime (pallets, consensus)
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md
│   ├── PHASE1_COMPLETE.md
│   ├── PHASE2_GOVERNANCE.md
│   ├── PHASE3_SMART_CONTRACTS.md
│   └── COMPLETE_IMPLEMENTATION_PLAN.md
├── scripts/                # Build and test scripts
└── Cargo.toml             # Workspace configuration
```

## 📚 Documentation

- **[Client Handoff](docs/CLIENT_HANDOFF.md)** - What to deliver and how to validate Stage 1
- **[Docs Index](docs/INDEX.md)** - Quick map of the documentation set
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture overview
- **[Phase 1 Complete](docs/PHASE1_COMPLETE.md)** - Phase 1 implementation status
- **[Phase 2 Governance](docs/PHASE2_GOVERNANCE.md)** - Governance configuration
- **[Phase 3 Smart Contracts](docs/PHASE3_SMART_CONTRACTS.md)** - Smart contract support
- **[Complete Implementation Plan](docs/COMPLETE_IMPLEMENTATION_PLAN.md)** - Full project status

## 🌐 Explorer & Wallet

### Blockchain Explorer

Real-time block explorer with wallet integration.

```bash
# Start explorer
./scripts/start-explorer.sh

# Or manually
cd explorer
npm install
npm start
```

Opens at: **http://localhost:3000**

**Features:**
- Real-time block explorer
- Chain statistics
- Wallet integration
- Account balance display

### Web Wallet

Simple web wallet for sending transfers.

```bash
# Start wallet
./scripts/start-wallet.sh

# Or manually
cd wallet
npm install
PORT=3001 npm start
```

Opens at: **http://localhost:3001**

**Features:**
- Connect Polkadot.js extension
- View balances
- Send MYL1 transfers
- Multi-account support

**Setup:**
1. Install [Polkadot.js Extension](https://polkadot.js.org/extension/)
2. Start node with RPC: `--rpc-port 9944 --rpc-cors all`
3. Start explorer/wallet
4. Connect wallet and use!

See [Explorer & Wallet Setup Guide](docs/EXPLORER_WALLET_SETUP.md) for details.

## 🧪 Testing

### Phase 1 Tests

```bash
./scripts/test-phase1-complete.sh
```

### Manual Testing

1. **Block Production**: Start node and verify blocks are produced
2. **Multi-Validator**: Start 2+ validators and verify connection
3. **Transaction Fees**: Query fee API via RPC
4. **Governance**: Create proposals via Polkadot.js Apps
5. **Smart Contracts**: Deploy test contracts

## 🔧 Configuration

### Staking Parameters

- **Sessions Per Era**: 6
- **Bonding Duration**: 672 eras (~28 days)
- **Min Inflation**: 2.5% (at 100% staked)
- **Max Inflation**: 10% (at 0% staked)
- **Ideal Stake**: 50% of total supply

### Governance

- **Democracy**: Public referenda
- **Council**: On-chain council (majority voting)
- **Technical Committee**: Fast-track proposals (2/3 majority)

## 🌐 RPC Endpoints

When running a node, RPC is available at:

- **HTTP**: `http://localhost:9944`
- **WebSocket**: `ws://localhost:9944`

Connect via:
- [Polkadot.js Apps](https://polkadot.js.org/apps) (set custom endpoint)
- `subxt` (Rust client)
- `@polkadot/api` (JavaScript client)

## 🚧 Development Status

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Core Architecture | ✅ Complete | 100% |
| Phase 2: Governance | ⚙️ Configured | 90% |
| Phase 3: Smart Contracts | ⚙️ Configured | 85% |
| Phase 4: Infrastructure | ✅ In Progress | 50% |
| Phase 5: QA & Docs | 📋 Planned | 0% |

**Overall Progress**: ~70% Complete

## 📝 License

GPL-3.0-or-later WITH Classpath-exception-2.0

## 🤝 Contributing

This is a production blockchain implementation. For contributions, please follow standard Substrate development practices.

## 📞 Support

For issues and questions, refer to the documentation in `docs/` directory.

---

**Built with Substrate** | **MyL1 Blockchain Team** | **2025**
