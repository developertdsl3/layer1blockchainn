#!/bin/bash
set -euo pipefail

echo "==> Installing Android SDK Platform 34"

if [ -z "${ANDROID_HOME:-}" ]; then
    echo "❌ ANDROID_HOME not set"
    exit 1
fi

# Try to find sdkmanager
SDKMANAGER=""
if [ -f "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
    SDKMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"
elif [ -f "$ANDROID_HOME/tools/bin/sdkmanager" ]; then
    SDKMANAGER="$ANDROID_HOME/tools/bin/sdkmanager"
else
    echo "❌ sdkmanager not found. Please install via Android Studio:"
    echo "   1. Open Android Studio"
    echo "   2. Tools → SDK Manager"
    echo "   3. Install Android SDK Platform 34"
    echo "   4. Install Android SDK Build-Tools 34.0.0"
    exit 1
fi

echo "✅ Found sdkmanager at: $SDKMANAGER"
echo ""
echo "Installing Android SDK Platform 34 and Build-Tools 34.0.0..."

yes | $SDKMANAGER "platforms;android-34" "build-tools;34.0.0"

echo ""
echo "✅ Installation complete!"
echo ""
echo "Verify installation:"
ls -la $ANDROID_HOME/platforms/android-34






