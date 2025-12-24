# Peer Connection Guide

## Why No Peers in Dev Mode?

When running `--chain dev`, you're running a **single-node network**. This is **normal and expected** - there are no other nodes to connect to.

**Dev mode (`--chain dev`):**
- ✅ Single node, isolated network
- ✅ Perfect for development and testing
- ✅ No peers needed - node produces blocks by itself
- ✅ Fast startup, no network discovery needed

## Options to Get Peers

### Option 1: Run Multi-Node Local Network (Recommended for Testing)

Run multiple nodes on your machine and connect them:

#### Terminal 1 - Alice (First Node)
```bash
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
```

**Note the peer ID from the logs:**
```
Local node identity is: 12D3KooWJW4GfKPZbZEPf3ijLTpWEk8sjvMNRdo1AvX5644AfxgE
```

#### Terminal 2 - Bob (Second Node)
```bash
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
    --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/12D3KooWJW4GfKPZbZEPf3ijLTpWEk8sjvMNRdo1AvX5644AfxgE \
    --name "MyL1-Bob"
```

Replace `12D3KooWJW4GfKPZbZEPf3ijLTpWEk8sjvMNRdo1AvX5644AfxgE` with Alice's actual peer ID from Terminal 1.

**Result:** Both nodes will connect and you'll see peers in the logs.

### Option 2: Use Zombienet (Automated Multi-Node)

Use the automated multi-validator setup:

```bash
./scripts/run-zombienet-5.sh
```

This runs 5 validators automatically and they connect to each other.

### Option 3: Connect to Public Testnet (If Available)

If a public testnet exists, you can connect using bootnodes:

```bash
./target/release/myl1-node \
    --chain testnet \
    --bootnodes /ip4/PUBLIC_IP/tcp/30333/p2p/PEER_ID \
    --name "MyL1-Node"
```

## Understanding the Logs

### Dev Mode (Single Node)
```
💤 Idle (0 peers), best: #184, finalized #180
```
- **0 peers** = Normal (single-node network)
- Node is working correctly
- Blocks are being produced

### Multi-Node Network
```
💤 Idle (1 peers), best: #184, finalized #180
```
- **1+ peers** = Connected to other nodes
- Network is operational

## When Do You Need Peers?

**You DON'T need peers for:**
- ✅ Development and testing
- ✅ Running REST API / Faucet
- ✅ Testing transactions
- ✅ Smart contract development
- ✅ Local blockchain explorer

**You DO need peers for:**
- 🔗 Testing multi-validator consensus
- 🔗 Testing network resilience
- 🔗 Testing peer discovery
- 🔗 Production deployment

## Quick Scripts

### Run 2-Node Network

Create `scripts/run-2-nodes.sh`:

```bash
#!/bin/bash
# Terminal 1
./target/release/myl1-node \
    --chain local \
    --alice \
    --validator \
    --base-path ./alice-fresh \
    --port 30333 \
    --rpc-port 9933 \
    --ws-port 9944 \
    --rpc-cors all \
    --name "MyL1-Alice"
```

Then in Terminal 2, get Alice's peer ID and run Bob.

## Troubleshooting

### "Still 0 peers after connecting nodes"

1. **Check firewall**: Make sure ports 30333-30334 are open
2. **Verify bootnode format**: Should be `/ip4/127.0.0.1/tcp/30333/p2p/PEER_ID`
3. **Check peer ID**: Must match exactly from the first node's logs
4. **Same chain**: Both nodes must use `--chain local` (not `--chain dev`)

### "Connection refused"

- Make sure the first node is running before starting the second
- Check that ports are not already in use
- Verify IP address (use `127.0.0.1` for localhost)

## Summary

- **Dev mode (`--chain dev`)**: Single node, 0 peers = ✅ Normal
- **Local network (`--chain local`)**: Multi-node, need bootnodes to connect
- **For development**: Dev mode is perfect, no peers needed
- **For testing consensus**: Use multi-node setup

Your current setup is working correctly! The "0 peers" message is expected for dev mode.

