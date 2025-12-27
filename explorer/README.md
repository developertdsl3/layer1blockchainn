# MyL1 Blockchain Explorer

Modern, Solscan-inspired blockchain explorer with 3D effects and real-time data visualization.

## Features

- ✅ **Modern 3D UI** - Solscan-inspired design with smooth animations
- ✅ **Real-time Updates** - Live block and transaction monitoring
- ✅ **Network Statistics** - Supply, Epoch, Network, and Staking panels
- ✅ **TPS Charts** - Real-time transaction per second visualization
- ✅ **Latest Transactions** - Real-time transaction feed
- ✅ **Latest Blocks** - Block explorer with 3D card effects
- ✅ **Dark Theme** - Beautiful dark mode with gradient accents
- ✅ **Wallet Integration** - Polkadot.js extension support
- ✅ **Responsive Design** - Works on desktop and mobile

## Installation

```bash
cd explorer
npm install
```

## Usage

### Start the Explorer

```bash
npm start
```

The explorer will open at: **http://localhost:3000**

### Connect to Node

Make sure your MyL1 node is running with RPC enabled:

```bash
./target/release/myl1-node \
    --chain local \
    --alice \
    --validator \
    --rpc-port 9933 \
    --unsafe-rpc-external \
    --name "MyL1-Alice"
```

The explorer connects to `ws://localhost:9933` by default.

## Features Overview

### Header
- **Logo**: MyL1Scan branding with 3D effects
- **Price Info**: MYL1 price and average fee
- **Navigation**: Analytics, DeFi, Leaderboard, Blockchain, Resources
- **Theme Toggle**: Switch between dark/light mode
- **Wallet Connect**: Connect Polkadot.js extension

### Stats Panels

1. **MYL1 Supply**
   - Total supply
   - Circulating supply
   - Non-circulating supply

2. **Current Epoch**
   - Epoch number
   - Progress bar
   - Slot range
   - Time remaining

3. **Network**
   - Total transactions
   - Block height
   - Slot height
   - TPS (Transactions Per Second)
   - True TPS

4. **Total Stake**
   - Total staked MYL1
   - Current stake
   - Delinquent stake
   - Active validators

### Latest Transactions
- Real-time transaction feed
- Signature, time, block, and action
- Copy signature to clipboard
- Hover effects

### TPS Chart
- Real-time TPS visualization
- Area chart with gradients
- Time range selector (30m, 2H, 6H)
- True TPS overlay

### Latest Blocks
- Grid of recent blocks
- Block number, hash, transactions
- 3D card effects on hover
- Click to view details

## Customization

### Change RPC Endpoint

Edit `src/App.js`:

```javascript
const [wsEndpoint, setWsEndpoint] = useState('ws://your-node:9933');
```

### Theme Colors

Edit `src/index.css` CSS variables:

```css
:root {
  --accent-primary: #6366f1;
  --accent-secondary: #8b5cf6;
  --accent-tertiary: #00d4ff;
}
```

## Build for Production

```bash
npm run build
```

The built files will be in the `build/` directory.

## Technologies

- **React** - UI framework
- **Framer Motion** - Animations and 3D effects
- **Recharts** - Data visualization
- **Polkadot.js API** - Blockchain connection
- **React Icons** - Icon library

## License

GPL-3.0-or-later
