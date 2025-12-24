#!/bin/bash
set -euo pipefail

echo "==> Fixing React Native Navigation Library Compatibility"
echo ""

cd "$(dirname "$0")"

echo "Step 1: Removing old dependencies..."
rm -rf node_modules package-lock.json

echo ""
echo "Step 2: Installing compatible versions for React Native 0.72.6..."
npm install

echo ""
echo "Step 3: Installing specific compatible versions..."
npm install react-native-screens@3.25.0 react-native-gesture-handler@2.12.1 --save

echo ""
echo "Step 4: Cleaning Android build..."
cd android
./gradlew clean
cd ..

echo ""
echo "✅ Compatibility fix complete!"
echo ""
echo "Now try building:"
echo "  npm run build:apk"






