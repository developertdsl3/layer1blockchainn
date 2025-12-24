#!/bin/bash
set -euo pipefail

echo "==> Fixing React Native dependency versions for 0.72.6"
echo ""

cd "$(dirname "$0")"

echo "Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo ""
echo "Installing compatible versions..."
npm install

echo ""
echo "✅ Dependencies updated!"
echo ""
echo "Compatible versions installed:"
echo "  - react-native-screens: ^3.25.0"
echo "  - react-native-gesture-handler: ^2.12.1"
echo ""
echo "Now try building: npm run build:apk"






