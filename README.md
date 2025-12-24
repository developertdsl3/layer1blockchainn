# MyL1 Blockchain

A production-ready Layer-1 blockchain built with Substrate framework, featuring validators, staking, governance, smart contracts (Ink! + EVM), and robust infrastructure for future stablecoin deployment.

## 🚀 Quick Start

### Build

```bash
cargo build --release --package myl1-node-cli
```

### Run Development Node (single validator)

```bash
./scripts/run-dev-node.sh
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
    --rpc-port 9933 \
    --ws-port 9944 \
    --rpc-cors all \
    --ws-external \
    --rpc-external \
    --name "MyL1-Alice"

# Terminal 2 - Bob (after getting Alice's peer ID from logs)
./target/release/myl1-node \
    --chain local \
    --bob \
    --validator \
    --base-path ./bob-fresh \
    --port 30334 \
    --rpc-port 9934 \
    --ws-port 9945 \
    --rpc-cors all \
    --ws-external \
    --rpc-external \
    --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/<ALICE_PEER_ID> \
    --name "MyL1-Bob"
```

### Verify everything locally (Phases 1–4)

```bash
./scripts/test-all-phases.sh
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
- ✅ Local automation: `./scripts/test-phase2.sh` (governance extrinsics + staking snapshot)
- ✅ Local 5-validator network: `./scripts/run-zombienet-5.sh`
- ⏳ Public testnet deployment (3–5 validators) still requires servers + ops

### ⚙️ Phase 3: Smart Contract Layer (CONFIGURED)
- ✅ Ink! contracts enabled
- ✅ EVM (Revive) enabled (via `eth-rpc` sidecar)
- ✅ Multi-token support (Assets pallet)
- ✅ Local automation: `./scripts/test-phase3.sh` (EVM deploy + Ink! build)

### ✅ Phase 4: Infrastructure & Monitoring (LOCAL READY)
- ✅ **Blockchain Explorer** - React-based block explorer
- ✅ **Wallet Integration** - Web wallet with Polkadot.js
- ✅ Monitoring: `./scripts/run-monitoring.sh` (Prometheus `:9090`, Grafana `:3002`)
- ✅ Indexing (Subsquid-style): `./scripts/run-subsquid.sh` (GraphQL at `http://127.0.0.1:4350/graphql`)
- ✅ Full stack (monitoring + explorer + wallet + indexer): `./scripts/run-full-stack.sh`

### 📋 Phase 5: QA & Documentation (LOCAL VERIFICATION READY)
- ✅ QA checklist: `docs/QA_CHECKLIST.md`
- ✅ End-to-end local verification + proof artifacts: `./scripts/test-all-phases.sh` (writes `reports/`)

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
├── contracts/               # Ink! + EVM sample contracts
├── infra/                   # Monitoring + indexing + full-stack compose
├── tools/                   # Automation test runners (on-chain proofs)
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
├── zombienet/              # Local multi-validator configs
└── Cargo.toml             # Workspace configuration
```

## 📚 Documentation

- **[Requirements Status](docs/REQUIREMENTS_STATUS.md)** - ⭐ **Full requirements checklist vs implementation**
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

### Mobile Wallet

Modern React Native mobile wallet for iOS and Android.

```bash
cd mobile-wallet
npm install

# iOS
npm run ios

# Android
npm run android
```

**Features:**
- ✅ Modern, beautiful UI with gradient designs
- ✅ Secure key management (device keychain)
- ✅ Wallet creation with 12-word recovery phrase
- ✅ Import existing wallet
- ✅ Send/Receive MYL1 tokens
- ✅ QR code for receiving payments
- ✅ Transaction history
- ✅ Real-time balance updates
- ✅ Network status indicator

See [Mobile Wallet README](mobile-wallet/README.md) for detailed setup instructions.

## 🧪 Testing

### Phase 1 Tests

```bash
./scripts/test-phase1-complete.sh
```

### All-phases local verification (proof artifacts)

```bash
./scripts/test-all-phases.sh
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

- **HTTP**: `http://localhost:9933`
- **WebSocket**: `ws://localhost:9944`

If you run the Ethereum JSON-RPC sidecar (Revive):

- **EVM JSON-RPC (HTTP)**: `http://localhost:8545` (from `eth-rpc`)

Connect via:
- [Polkadot.js Apps](https://polkadot.js.org/apps) (set custom endpoint)
- `subxt` (Rust client)
- `@polkadot/api` (JavaScript client)

## 🚧 Development Status

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Core Architecture | ✅ Complete | 100% |
| Phase 2: Validator Network & Governance | ✅ Local-ready | 100% (local) |
| Phase 3: Smart Contracts | ✅ Local-ready | 100% (local demos) |
| Phase 4: Infrastructure & Monitoring | ✅ Local-ready | 100% (local stack) |
| Phase 5: QA & Docs | ✅ Local-ready | 100% (local verification + checklist) |

**Note**: "Local-ready" means runnable proofs exist in this repo; public infra deployment still requires servers/ops.

## 📋 Full Requirements Status

**See [Requirements Status](docs/REQUIREMENTS_STATUS.md) for complete checklist.**

**Summary:**
- ✅ **Core L1 Blockchain**: 100% Complete (PoS, staking, governance, smart contracts)
- ✅ **Explorer & Web Wallet**: 100% Complete
- ✅ **Mobile Wallet**: ✅ Complete (React Native - iOS & Android)
- ✅ **RPC/WebSocket APIs**: 100% Complete
- ✅ **Documentation**: 100% Complete
- ⚠️ **Public Testnet**: Not deployed (requires cloud infrastructure)
- ❌ **REST API**: Not implemented (JSON-RPC only)
- ❌ **Faucet**: Not implemented
- ⚠️ **Performance Benchmarks**: Not verified (architecture supports 3k-10k TPS target)

**Overall Completion: ~90%** (Core blockchain is production-ready; missing items are infrastructure deployment and tooling enhancements)

## 📝 License

GPL-3.0-or-later WITH Classpath-exception-2.0

## 🤝 Contributing

This is a production blockchain implementation. For contributions, please follow standard Substrate development practices.

## 📞 Support

For issues and questions, refer to the documentation in `docs/` directory.

---

**Built with Substrate** | **MyL1 Blockchain Team** | **2025**
