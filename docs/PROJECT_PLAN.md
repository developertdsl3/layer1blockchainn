# L1 Blockchain Development Plan (Stage 1)

## Overview
Build a production-ready L1 blockchain with validators, staking, governance, gas model, smart contracts (Ink! + EVM), and infrastructure for stablecoin deployment.

## Current Status
✅ **Phase 1 - In Progress**
- Project setup: Using Substrate framework
- Chain spec: Customized with MYL1 token
- Consensus: BABE + GRANDPA (already configured)
- Staking: NPoS pallet included
- Transaction fees: TransactionPayment pallet configured

## Phase 1 – Core Architecture & Setup ✅

### Completed:
- [x] Project setup (Rust + Substrate environment)
- [x] Chain spec defined (network name: MyL1, token: MYL1, decimals: 18)
- [x] Consensus implemented (BABE + GRANDPA)
- [x] NPoS staking pallet included
- [x] Transaction fees configured

### In Progress:
- [ ] Rebrand runtime and remove obvious SDK references
- [ ] Customize genesis configuration
- [ ] Initial testing on local single-node devnet

### Deliverables:
- [ ] Running local node
- [ ] Documentation for setup and build
- [ ] GitHub repo initialized

## Phase 2 – Validator Network & Governance

### Tasks:
- [ ] Multi-validator setup on testnet
- [ ] Enable on-chain governance (democracy, council, technical committee)
- [ ] Configure inflation and staking reward logic
- [ ] Integrate validator onboarding and slashing parameters

## Phase 3 – Smart Contract Layer

### Tasks:
- [ ] Add smart contract support (Ink! and EVM-compatible runtime)
- [ ] Implement multi-token support
- [ ] Performance tuning for 3,000–10,000 TPS target

## Phase 4 – Infrastructure & Monitoring

### Tasks:
- [ ] Deploy RPC nodes (public & private)
- [ ] Implement monitoring with Prometheus + Grafana
- [ ] Setup daily snapshots & backup system
- [ ] Integrate explorer (React + Subsquid backend)
- [ ] Add wallet connection (Polkadot.js + Web wallet API)

## Phase 5 – QA, Documentation & Launch Prep

### Tasks:
- [ ] Full integration testing
- [ ] Runtime and staking unit tests
- [ ] Governance upgrade simulation
- [ ] Write detailed documentation

## Technical Stack

### Runtime Pallets Included:
- **System**: Core blockchain functionality
- **BABE**: Block production consensus
- **GRANDPA**: Finality consensus
- **Staking**: NPoS validator staking
- **Democracy**: Public referenda
- **Council**: On-chain council
- **TechnicalCommittee**: Technical governance
- **Contracts**: Ink! smart contracts
- **Revive**: EVM compatibility
- **TransactionPayment**: Gas/fee model
- **Balances**: Native token management

### Network Configuration:
- **Chain Name**: MyL1
- **Token Symbol**: MYL1
- **Decimals**: 18
- **Consensus**: BABE (block production) + GRANDPA (finality)

## Next Steps

1. **Rebrand Runtime**: Update package names and descriptions
2. **Customize Genesis**: Configure initial validators and balances
3. **Test Locally**: Run single-node devnet
4. **Documentation**: Create setup and build guides

