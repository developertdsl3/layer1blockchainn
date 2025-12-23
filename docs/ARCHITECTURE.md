# MyL1 Blockchain Architecture

## Overview

MyL1 is a production-ready Layer-1 blockchain built on Substrate framework, designed for high-performance smart contract execution and future stablecoin deployment.

## Core Components

### 1. Consensus Layer

#### BABE (Blind Assignment for Blockchain Extension)
- **Purpose**: Block production
- **Pallet**: `pallet_babe` (index 2)
- **Type**: Slot-based block production
- **Configuration**: Primary and secondary slots enabled

#### GRANDPA (GHOST-based Recursive ANcestor Deriving Prefix Agreement)
- **Purpose**: Finality gadget
- **Pallet**: `pallet_grandpa` (index 18)
- **Type**: Byzantine fault tolerant finality
- **Configuration**: Standard GRANDPA setup

### 2. Staking System

#### NPoS (Nominated Proof of Stake)
- **Staking Pallet**: `pallet_staking` (index 11)
- **Election Provider**: `pallet_election_provider_multi_phase` (index 10)
- **Session Management**: `pallet_session` (index 12)
- **Features**:
  - Validator nomination
  - Staking rewards
  - Slashing support
  - Era-based rewards

### 3. Governance

#### Democracy
- **Pallet**: `pallet_democracy` (index 13)
- **Purpose**: Public referenda
- **Features**: Direct voting, delegation

#### Council
- **Pallet**: `pallet_collective` Instance1 (index 14)
- **Purpose**: On-chain council governance
- **Features**: Proposal voting, execution

#### Technical Committee
- **Pallet**: `pallet_collective` Instance2 (index 15)
- **Purpose**: Technical governance
- **Features**: Fast-track proposals, emergency actions

### 4. Smart Contracts

#### Ink! Contracts
- **Pallet**: `pallet_contracts` (index 21)
- **Purpose**: WebAssembly-based smart contracts
- **VM**: Wasmtime/PolkaVM
- **Features**: Contract deployment, execution, storage

#### EVM Compatibility (Revive)
- **Pallet**: `pallet_revive` (index 80)
- **Purpose**: Ethereum Virtual Machine compatibility
- **Features**: 
  - EVM bytecode execution
  - Ethereum account mapping
  - ERC20 token support

### 5. Transaction Fees

#### Transaction Payment
- **Pallet**: `pallet_transaction_payment` (index 7)
- **Purpose**: Gas/fee calculation
- **Model**: Weight-based fees
- **Currency**: Native MYL1 token

### 6. Token System

#### Native Token
- **Symbol**: MYL1
- **Decimals**: 18
- **Pallet**: `pallet_balances` (index 6)
- **Purpose**: Native chain currency

#### Multi-Token Support
- **Assets Pallet**: `pallet_assets` (index 39)
- **Purpose**: Fungible token support
- **Features**: Mint, burn, transfer
- **Ready for**: Stablecoin deployment

## Runtime Configuration

### Block Parameters
- **Block Time**: ~6 seconds (BABE slots)
- **Finality**: GRANDPA (variable, typically 1-2 blocks)
- **Block Weight**: 2x WEIGHT_REF_TIME_PER_SECOND
- **Block Length**: 5MB max

### Staking Parameters
- **Minimum Stake**: Configurable
- **Validator Count**: Dynamic (NPoS)
- **Era Duration**: Configurable
- **Reward Distribution**: Per era

### Governance Parameters
- **Proposal Deposit**: Configurable
- **Voting Period**: Configurable
- **Enactment Delay**: Configurable

## Network Architecture

### Node Types
1. **Validator Nodes**: Produce blocks, participate in consensus
2. **Full Nodes**: Sync chain, provide RPC
3. **Archive Nodes**: Full history, for explorers

### P2P Network
- **Protocol**: libp2p
- **Discovery**: Kademlia DHT, mDNS
- **Transport**: TCP, WebSocket

## Performance Targets

- **TPS**: 3,000-10,000 (target)
- **Finality**: 1-2 seconds
- **Block Time**: ~6 seconds
- **Gas Costs**: Low (optimized for payments)

## Security Features

- **Slashing**: Validator misbehavior penalties
- **Session Keys**: Rotatable validator keys
- **Governance**: On-chain upgrades
- **Audit Ready**: Clean code structure

## Future Enhancements

- Stablecoin pallet integration
- Oracle integration for price feeds
- Cross-chain bridge support
- Layer 2 scaling solutions

