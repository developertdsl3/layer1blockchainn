# Phase 2 - Validator Network & Governance

## Status: CONFIGURED (Ready for Testing)

### ✅ Current Configuration

#### Governance Pallets (Already Active)

1. **Democracy** (Index 13)
   - Public referenda
   - Direct voting
   - Delegation support
   - Voting period: Configurable
   - Minimum deposit: Configurable

2. **Council** (Index 14)
   - On-chain council governance
   - Proposal voting
   - Execution authority
   - Majority voting (1/2)

3. **Technical Committee** (Index 15)
   - Technical governance
   - Fast-track proposals (2/3)
   - Emergency actions (unanimous)
   - Veto power

#### Staking Configuration

**Current Parameters:**
- **Sessions Per Era**: 6 sessions
- **Bonding Duration**: 672 eras (~28 days)
- **Slash Defer Duration**: 168 eras (~7 days)
- **Max Validators**: 1000
- **Max Nominators**: 64 per validator
- **Max Nominations**: 16 per nominator

**Inflation Model:**
- **Min Inflation**: 2.5% (when 100% staked)
- **Max Inflation**: 10% (when 0% staked)
- **Ideal Stake**: 50% of total supply
- **Falloff**: 5% per 10% deviation

**Reward Distribution:**
- Rewards minted from void (inflationary)
- Per-era distribution
- Validator + nominator split

### 📋 Tasks

#### ✅ Multi-Validator Setup
- ✅ Runtime supports multiple validators
- ✅ NPoS election system active
- ✅ Session management configured

#### ⚙️ Governance Configuration
- ✅ Democracy pallet active
- ✅ Council pallet active
- ✅ Technical Committee active
- ⏳ Need to test proposals

#### ⚙️ Staking Rewards
- ✅ Inflation curve configured
- ✅ Reward distribution active
- ⏳ Need to verify reward calculations

#### ⚙️ Validator Onboarding
- ✅ Validator registration supported
- ✅ Session keys rotation supported
- ⏳ Need to configure minimum stake (if desired)

#### ⚙️ Slashing Parameters
- ✅ Slashing configured
- ✅ Slash goes to Treasury
- ✅ Council can cancel slashes (3/4 majority)
- ⏳ Need to test slashing scenarios

### 🧪 Testing Checklist

- [ ] Create governance proposal
- [ ] Vote on proposal
- [ ] Execute proposal
- [ ] Test council proposal
- [ ] Test technical committee fast-track
- [ ] Verify staking rewards distribution
- [ ] Test validator onboarding
- [ ] Test validator removal
- [ ] Test slashing (simulated)

### 🚀 Quick Start

#### Start Multi-Validator Network

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

# Terminal 2 - Bob (after getting Alice's peer ID)
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

# Terminal 3 - Charlie
./target/release/myl1-node \
    --chain local \
    --charlie \
    --validator \
    --base-path ./charlie-fresh \
    --port 30335 \
    --rpc-port 9946 \
    --unsafe-rpc-external \
    --unsafe-force-node-key-generation \
    --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/<ALICE_PEER_ID> \
    --name "MyL1-Charlie"
```

#### Test Governance

```bash
# Connect to node via Polkadot.js Apps
# URL: ws://localhost:9944

# Or use subxt/substrate-api-client
# Create proposal, vote, execute
```

### 📊 Current Staking Parameters Summary

| Parameter | Value | Description |
|-----------|-------|-------------|
| Sessions/Era | 6 | Number of sessions per era |
| Bonding Duration | 672 eras | ~28 days at 6s/block |
| Min Inflation | 2.5% | When 100% staked |
| Max Inflation | 10% | When 0% staked |
| Ideal Stake | 50% | Target staking ratio |
| Max Validators | 1000 | Maximum validator set size |
| Max Nominations | 16 | Per nominator |

### ➡️ Next Steps

1. Test governance proposals
2. Verify reward distribution
3. Test validator onboarding
4. Configure custom parameters (if needed)
5. Move to Phase 3: Smart Contracts

