# Next Steps After Installation

## ✅ Dependencies Installed

Your dependencies are now installed! The warnings you saw are normal for React Native projects.

## What's Next?

### 1. Initialize React Native Project Structure

You still need to create the `android/` and `ios/` directories. Run:

```bash
# Create React Native project structure
npx @react-native-community/cli init MyL1Wallet --version 0.72.6 --skip-install

# Copy the generated directories
cp -r MyL1Wallet/android .
cp -r MyL1Wallet/ios .
rm -rf MyL1Wallet
```

### 2. iOS Setup (macOS only)

If you're on macOS and want to build for iOS:

```bash
cd ios
pod install
cd ..
```

**Note:** On Linux, you'll see "pod: not found" - this is normal. iOS development requires macOS.

### 3. Android Setup

For Android development on Linux:

1. **Install Android Studio:**
   - Download from https://developer.android.com/studio
   - Install Android SDK (API 33 recommended)
   - Set up Android emulator or connect a physical device

2. **Set environment variables:**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Verify setup:**
   ```bash
   adb devices
   ```

### 4. Run the App

**Android:**
```bash
npm run android
```

**iOS (macOS only):**
```bash
npm run ios
```

**Start Metro Bundler:**
```bash
npm start
```

## Current Status

✅ **Dependencies:** Installed  
✅ **Source Code:** Ready in `src/` directory  
⏳ **Project Structure:** Need to initialize `android/` and `ios/` directories  
⏳ **Native Setup:** iOS pods (macOS) or Android SDK (Linux)

## Troubleshooting

### If you get "Command not found" errors:

Make sure you're in the mobile-wallet directory:
```bash
cd ~/layer1blockhain/mobile-wallet
```

### If Android build fails:

1. Check Android SDK is installed
2. Verify ANDROID_HOME is set
3. Try: `cd android && ./gradlew clean && cd ..`

### If you want to test without full setup:

You can test the JavaScript code by:
1. Using React Native Web (requires additional setup)
2. Or wait until you have Android/iOS environment ready

## Quick Test

Once you have the project structure initialized, you can test the app:

1. **Start MyL1 node:**
   ```bash
   cd ~/layer1blockhain
   ./target/release/myl1-node --chain dev --alice --rpc-port 9944 --rpc-cors all
   ```

2. **In another terminal, start Metro:**
   ```bash
   cd ~/layer1blockhain/mobile-wallet
   npm start
   ```

3. **In a third terminal, run the app:**
   ```bash
   npm run android  # or npm run ios on macOS
   ```

The app should connect to your local node and you can create/import a wallet!

