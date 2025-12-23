# MyL1 Blockchain Explorer

React-based blockchain explorer for MyL1 blockchain with wallet integration.

## Features

- ✅ Real-time block explorer
- ✅ Chain statistics
- ✅ Wallet integration (Polkadot.js extension)
- ✅ Account balance display
- ✅ Block details
- ✅ Custom RPC endpoint configuration

## Prerequisites

- Node.js 16+ and npm
- Polkadot.js browser extension (for wallet)
- Running MyL1 node (RPC endpoint)

## Installation

```bash
cd explorer
npm install
```

## Development

```bash
npm start
```

Opens at http://localhost:3000

## Build for Production

```bash
npm run build
```

## Configuration

Default RPC endpoint: `ws://localhost:9944`

You can change it in the UI or set environment variable:
```bash
REACT_APP_WS_ENDPOINT=ws://your-node:9944 npm start
```

## Wallet Integration

1. Install [Polkadot.js Extension](https://polkadot.js.org/extension/)
2. Create or import account
3. Click "Connect Wallet" in explorer
4. Select account to connect

## Usage

1. Start your MyL1 node:
   ```bash
   ./target/release/myl1-node --chain dev --alice --rpc-port 9944 --rpc-cors all
   ```

2. Start explorer:
   ```bash
   cd explorer
   npm start
   ```

3. Open browser: http://localhost:3000

4. Connect wallet and explore!

