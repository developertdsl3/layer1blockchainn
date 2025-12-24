#!/bin/bash
set -euo pipefail

echo "==> Cleaning Android build cache"
echo ""

cd android

echo "Cleaning Gradle cache..."
./gradlew clean

echo ""
echo "Removing build directories..."
rm -rf .gradle
rm -rf build
rm -rf app/build

echo ""
echo "✅ Clean complete!"
echo ""
echo "You can now rebuild:"
echo "  npm run build:apk"

cd ..






