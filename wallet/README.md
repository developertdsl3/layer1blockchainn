# MyL1 Web Wallet

Simple web wallet for MyL1 blockchain with Polkadot.js integration.

## Features

- ✅ Connect Polkadot.js extension
- ✅ View account balance
- ✅ Send MYL1 transfers
- ✅ Switch between accounts
- ✅ Real-time balance updates

## Installation

```bash
cd wallet
npm install
```

## Development

```bash
npm start
```

Opens at http://localhost:3001

## Build

```bash
npm run build
```

## Usage

1. Install [Polkadot.js Extension](https://polkadot.js.org/extension/)
2. Create or import account
3. Start MyL1 node:
   ```bash
   ./target/release/myl1-node --chain dev --alice --rpc-port 9944 --rpc-cors all
   ```
4. Start wallet:
   ```bash
   cd wallet
   npm start
   ```
5. Connect wallet and send transfers!

## Configuration

Default RPC: `ws://localhost:9944`

Change in UI or set:
```bash
REACT_APP_WS_ENDPOINT=ws://your-node:9944 npm start
```

