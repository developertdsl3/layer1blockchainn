# Mobile Wallet Setup Guide

## Quick Setup

This mobile wallet is built with React Native. To get started, you have two options:

### Option 1: Use Existing React Native Project Structure

If you already have a React Native project initialized, simply copy the `src/` directory and `App.js` into your project.

### Option 2: Initialize New React Native Project

1. **Create React Native project:**
   ```bash
   npx react-native init MyL1Wallet --version 0.72.6
   cd MyL1Wallet
   ```

2. **Copy source files:**
   ```bash
   # Copy all source files from this directory
   cp -r ../mobile-wallet/src ./
   cp ../mobile-wallet/App.js ./
   cp ../mobile-wallet/package.json ./package.json
   ```

3. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **iOS Setup (macOS only):**
   ```bash
   cd ios
   pod install
   cd ..
   ```

5. **Run the app:**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## Required Native Modules

The following native modules require additional setup:

### react-native-keychain
- **iOS**: Already included in Podfile
- **Android**: No additional setup needed

### react-native-linear-gradient
- **iOS**: Requires pod install
- **Android**: No additional setup needed

### react-native-qrcode-svg
- **iOS**: Requires pod install
- **Android**: No additional setup needed

### react-native-vector-icons
- **iOS**: Add to Info.plist (see react-native-vector-icons docs)
- **Android**: Add to android/app/build.gradle (see react-native-vector-icons docs)

## Configuration

### Android Permissions

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS Permissions

Add to `ios/MyL1Wallet/Info.plist`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

## Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### iOS Build Issues
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
```

### Connection Issues
- Ensure MyL1 node is running
- Check RPC endpoint in `src/context/ApiContext.js`
- Verify network connectivity

## Development

### Running on Device

**iOS:**
1. Connect iPhone via USB
2. Trust computer on iPhone
3. Run: `npm run ios`

**Android:**
1. Enable USB debugging on Android device
2. Connect via USB
3. Run: `adb devices` to verify connection
4. Run: `npm run android`

### Debugging

- **iOS**: Use Xcode debugger or React Native Debugger
- **Android**: Use Chrome DevTools or React Native Debugger
- **Both**: Shake device to open developer menu

## Building for Production

### iOS
```bash
cd ios
xcodebuild -workspace MyL1Wallet.xcworkspace \
  -scheme MyL1Wallet \
  -configuration Release \
  -archivePath build/MyL1Wallet.xcarchive \
  archive
```

### Android
```bash
cd android
./gradlew assembleRelease
# APK will be in android/app/build/outputs/apk/release/
```

## Notes

- The wallet uses device keychain for secure storage
- Private keys never leave the device
- Recovery phrase is shown only during wallet creation
- Network endpoint can be changed in Settings (future feature)

