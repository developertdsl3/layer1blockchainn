#!/bin/bash

# Build MyL1 Mobile Wallet APK with Live Blockchain

echo "🚀 BUILDING MYL1 MOBILE WALLET APK"
echo "=================================="
echo ""
echo "✅ Configuration Updated:"
echo "   WebSocket: ws://13.211.114.206:9944"
echo "   HTTP RPC:  http://13.211.114.206:9933"
echo ""

cd /home/anupam/layer1blockhain/mobile-wallet

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Creating JavaScript bundle..."
mkdir -p android/app/src/main/assets
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

echo ""
echo "🔧 Setting up Android build..."
cd android
chmod +x gradlew
./gradlew clean

echo ""
echo "🏗️  Building APK..."
./gradlew assembleDebug

echo ""
echo "📱 APK Build Complete!"
echo ""
echo "📂 APK Location:"
echo "   /home/anupam/layer1blockhain/mobile-wallet/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📲 Transfer to your Android device and install!"
echo ""
echo "🔍 Features:"
echo "   ✅ Real MyL1 blockchain connection"
echo "   ✅ Send & receive MYL1 tokens"
echo "   ✅ Live balance updates"
echo "   ✅ Transaction history"
echo "   ✅ QR code scanning"
echo ""

# Check if APK was built successfully
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ APK built successfully!"
    echo "📏 APK Size: $(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)"
else
    echo "❌ APK build failed"
    exit 1
fi

