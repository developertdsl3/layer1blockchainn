# MyL1 Mobile Wallet

A modern, secure React Native mobile wallet for the MyL1 Blockchain, available for both iOS and Android.

## Features

- ✅ **Modern UI/UX** - Beautiful, intuitive interface with gradient designs
- ✅ **Secure Key Management** - Keys stored in device keychain
- ✅ **Wallet Creation** - Generate new wallet with 12-word recovery phrase
- ✅ **Wallet Import** - Import existing wallet using recovery phrase
- ✅ **Send Transactions** - Send MYL1 tokens with memo support
- ✅ **Receive Tokens** - QR code generation for receiving payments
- ✅ **Transaction History** - View transaction history (ready for indexer integration)
- ✅ **Balance Display** - Real-time balance updates
- ✅ **Network Status** - Connection status indicator
- ✅ **Settings** - Manage wallet and network settings

## Screenshots

The wallet includes:
- Welcome screen with gradient design
- Secure wallet creation flow
- Modern home screen with balance display
- Send/Receive screens
- Transaction history
- Settings screen

## Prerequisites

- Node.js 16+ and npm/yarn
- React Native development environment set up
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and Android SDK

## Installation

### Quick Setup (Recommended)

```bash
cd mobile-wallet
./setup-project.sh
```

This will automatically:
- Install all dependencies
- Initialize React Native project structure (if needed)
- Install iOS pods (macOS only)
- Set up everything ready to run

### Manual Setup

See [QUICK_START.md](QUICK_START.md) for detailed manual setup instructions.

**Note:** The old `react-native init` command is deprecated. Use:
```bash
npx @react-native-community/cli init MyL1Wallet --version 0.72.6
```

Or use our setup script which handles everything automatically.

## Running the App

### iOS

```bash
npm run ios
# or
yarn ios
```

### Android

```bash
npm run android
# or
yarn android
```

### Start Metro Bundler

```bash
npm start
# or
yarn start
```

## Configuration

### RPC Endpoint

Default RPC endpoint: `ws://localhost:9944`

To change the endpoint:
1. Go to Settings screen
2. Update RPC endpoint (future feature)
3. Or modify `src/context/ApiContext.js` default endpoint

### Network Configuration

For local development:
- Ensure MyL1 node is running with RPC enabled
- Use `--rpc-port 9944 --rpc-cors all` flags

For testnet/mainnet:
- Update endpoint in `ApiContext.js` or Settings screen

## Project Structure

```
mobile-wallet/
├── src/
│   ├── context/
│   │   ├── ApiContext.js      # Blockchain API connection
│   │   └── WalletContext.js   # Wallet state management
│   └── screens/
│       ├── WelcomeScreen.js
│       ├── CreateWalletScreen.js
│       ├── ImportWalletScreen.js
│       ├── HomeScreen.js
│       ├── SendScreen.js
│       ├── ReceiveScreen.js
│       ├── TransactionHistoryScreen.js
│       └── SettingsScreen.js
├── App.js                     # Main app component
├── index.js                   # Entry point
└── package.json
```

## Security Features

- **Secure Storage**: Private keys stored in device keychain using `react-native-keychain`
- **Recovery Phrase**: 12-word mnemonic for wallet backup
- **No Key Exposure**: Keys never leave the device
- **Biometric Support**: Ready for biometric authentication (requires setup)

## Development

### Adding New Features

1. Create new screen in `src/screens/`
2. Add route in `App.js` navigation
3. Use `useWallet()` and `useApi()` hooks for blockchain interaction

### Styling

The app uses:
- React Native StyleSheet
- `react-native-linear-gradient` for gradients
- `react-native-vector-icons` for icons
- Modern color scheme (indigo/purple theme)

## Building for Production

### iOS

```bash
cd ios
xcodebuild -workspace MyL1Wallet.xcworkspace -scheme MyL1Wallet -configuration Release
```

### Android

```bash
cd android
./gradlew assembleRelease
```

## Troubleshooting

### Metro Bundler Issues

```bash
npm start -- --reset-cache
```

### iOS Build Issues

```bash
cd ios
pod deintegrate
pod install
```

### Android Build Issues

```bash
cd android
./gradlew clean
```

### Connection Issues

- Ensure MyL1 node is running
- Check RPC endpoint is correct
- Verify network connectivity
- Check firewall settings

## Dependencies

### Core
- `react-native`: 0.72.6
- `@polkadot/api`: ^12.0.0
- `@polkadot/keyring`: ^12.0.0

### Navigation
- `@react-navigation/native`: ^6.1.9
- `@react-navigation/stack`: ^6.3.20
- `@react-navigation/bottom-tabs`: ^6.5.11

### UI
- `react-native-vector-icons`: ^10.0.2
- `react-native-linear-gradient`: ^2.8.3
- `react-native-qrcode-svg`: ^6.2.0

### Security
- `react-native-keychain`: ^8.1.3
- `@react-native-async-storage/async-storage`: ^1.19.5

## Future Enhancements

- [ ] Biometric authentication
- [ ] Multi-account support
- [ ] Transaction history from indexer
- [ ] Push notifications
- [ ] DApp browser integration
- [ ] Staking interface
- [ ] Governance voting
- [ ] NFT support

## License

GPL-3.0-or-later WITH Classpath-exception-2.0

## Support

For issues and questions, refer to the main project documentation in `docs/` directory.

