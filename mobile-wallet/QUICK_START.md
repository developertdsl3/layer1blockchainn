# Quick Start Guide

## Option 1: Use Setup Script (Recommended)

```bash
cd mobile-wallet
./setup-project.sh
```

This script will:
1. Install all npm dependencies
2. Initialize React Native project structure if needed
3. Install iOS pods (if on macOS)
4. Set up everything automatically

## Option 2: Manual Setup

### Step 1: Initialize React Native Project

Use the new CLI (the old `react-native init` is deprecated):

```bash
cd mobile-wallet

# Create React Native project in a temp location
npx @react-native-community/cli init MyL1Wallet --version 0.72.6 --skip-install

# Copy the generated android/ and ios/ directories to mobile-wallet/
cp -r MyL1Wallet/android .
cp -r MyL1Wallet/ios .
rm -rf MyL1Wallet
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### Step 4: Run the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Start Metro Bundler separately:**
```bash
npm start
```

## Troubleshooting

### If setup script fails:

1. **Manual React Native init:**
   ```bash
   npx @react-native-community/cli init MyL1Wallet --version 0.72.6
   # Then copy android/ and ios/ to mobile-wallet/
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **iOS pods:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

### Common Issues

**Metro bundler cache:**
```bash
npm start -- --reset-cache
```

**iOS build issues:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

**Android build issues:**
```bash
cd android
./gradlew clean
cd ..
```

## Verify Setup

After setup, you should have:
- ✅ `node_modules/` directory
- ✅ `android/` directory (for Android)
- ✅ `ios/` directory (for iOS, macOS only)
- ✅ `src/` directory with all wallet screens
- ✅ `App.js` with navigation setup

## Next Steps

1. Make sure your MyL1 node is running:
   ```bash
   ./target/release/myl1-node --chain dev --alice --rpc-port 9944 --rpc-cors all
   ```

2. Run the mobile wallet:
   ```bash
   npm run ios    # or npm run android
   ```

3. Create or import a wallet in the app!

