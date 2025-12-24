# Explorer & Wallet Setup Guide

## Overview

This guide covers setting up and using the MyL1 Blockchain Explorer and Web Wallet.

## Prerequisites

1. **Node.js 16+** and npm installed
2. **Polkadot.js Extension** installed in browser
3. **MyL1 Node** running with RPC enabled

## Quick Start

### 1. Start MyL1 Node

```bash
# Terminal 1 - Start node
./target/release/myl1-node \
    --chain dev \
    --alice \
    --rpc-port 9944 \
    --rpc-cors all \
    --name "MyL1-Node"
```

### 2. Start Explorer

```bash
# Terminal 2 - Start explorer
./scripts/start-explorer.sh

# Or manually:
cd explorer
npm install  # First time only
npm start
```

Explorer opens at: **http://localhost:3000**

### 3. Start Wallet

```bash
# Terminal 3 - Start wallet
./scripts/start-wallet.sh

# Or manually:
cd wallet
npm install  # First time only
PORT=3001 npm start
```

Wallet opens at: **http://localhost:3001**

## Features

### Explorer Features

- ✅ Real-time block explorer
- ✅ Chain statistics (block number, finalized block, total issuance)
- ✅ Latest blocks with details
- ✅ Wallet integration
- ✅ Account balance display
- ✅ Custom RPC endpoint configuration

### Wallet Features

- ✅ Connect Polkadot.js extension
- ✅ View account balances (free, reserved, total)
- ✅ Send MYL1 transfers
- ✅ Switch between multiple accounts
- ✅ Real-time balance updates
- ✅ Transaction status tracking

## Installation Details

### Explorer Installation

```bash
cd explorer
npm install
```

Dependencies:
- `@polkadot/api` - Polkadot.js API
- `@polkadot/extension-dapp` - Wallet extension integration
- `react` - UI framework

### Wallet Installation

```bash
cd wallet
npm install
```

Same dependencies as explorer.

## Configuration

### RPC Endpoint

Both explorer and wallet default to: `ws://localhost:9944`

You can change it:
1. In the UI (explorer has endpoint input)
2. Via environment variable:
   ```bash
   REACT_APP_WS_ENDPOINT=ws://your-node:9944 npm start
   ```

### Node RPC Configuration

Make sure your node has RPC enabled:

```bash
./target/release/myl1-node \
    --chain dev \
    --alice \
    --rpc-port 9944 \
    --rpc-cors all \        # Allow CORS for web apps
    --rpc-external          # Allow external connections (dev only)
```

## Wallet Extension Setup

1. **Install Extension**
   - Chrome: [Polkadot.js Extension](https://chrome.google.com/webstore/detail/polkadotjs-extension/mopnmbcafieddcagagdcbnhejhlodfdd)
   - Firefox: [Polkadot.js Extension](https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/)

2. **Create Account**
   - Open extension
   - Click "+" to create new account
   - Save seed phrase securely
   - Name your account

3. **Connect in Apps**
   - Open explorer or wallet
   - Click "Connect Wallet"
   - Authorize connection
   - Select account

## Usage Examples

### View Blocks in Explorer

1. Open http://localhost:3000
2. See real-time blocks appearing
3. View block details (number, hash, extrinsics)

### Send Transfer via Wallet

1. Open http://localhost:3001
2. Connect wallet
3. Enter recipient address
4. Enter amount (in MYL1)
5. Click "Send Transfer"
6. Confirm in extension
7. Wait for confirmation

### Check Account Balance

1. Connect wallet in either app
2. Balance displays automatically
3. Updates in real-time

## Troubleshooting

### "Failed to connect" Error

- Check node is running
- Verify RPC port (default 9944)
- Check `--rpc-cors all` flag
- Try `--rpc-external` for dev

### "No wallet extension found"

- Install Polkadot.js extension
- Refresh browser
- Check extension is enabled

### "Transaction failed"

- Check account has sufficient balance
- Verify recipient address is valid
- Check node is producing blocks

### Port Already in Use

Explorer uses 3000, wallet uses 3001. If busy:
```bash
# Change explorer port
PORT=3002 npm start

# Change wallet port  
PORT=3003 npm start
```

## Production Deployment

### Build for Production

```bash
# Explorer
cd explorer
npm run build
# Output in explorer/build/

# Wallet
cd wallet
npm run build
# Output in wallet/build/
```

### Deploy

Serve the `build/` directory with any web server:
- Nginx
- Apache
- Node.js (serve package)
- Cloud hosting (Vercel, Netlify, etc.)

### Environment Variables

Set production RPC endpoint:
```bash
REACT_APP_WS_ENDPOINT=wss://your-production-node:9944
```

## Security Notes

- ⚠️ Never share your seed phrase
- ⚠️ Use `--rpc-external` only in development
- ⚠️ Use HTTPS in production
- ⚠️ Verify node RPC endpoint before connecting
- ⚠️ Keep Polkadot.js extension updated

## Next Steps

- Integrate with backend API (Subsquid)
- Add transaction history
- Add staking interface
- Add governance voting
- Add contract interaction UI

