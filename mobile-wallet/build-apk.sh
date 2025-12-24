#!/bin/bash
set -euo pipefail

echo "==> Building MyL1 Wallet APK"
echo ""

# Check if we're in the right directory
if [ ! -d "android" ]; then
    echo "Error: android/ directory not found. Please run this from mobile-wallet directory."
    exit 1
fi

# Check and set JAVA_HOME if not set (prefer Java 17 for AGP 8.0+)
if [ -z "${JAVA_HOME:-}" ]; then
    echo "⚠️  JAVA_HOME not set. Trying to find Java..."
    
    # Prefer Java 17 (required for AGP 8.0+)
    if [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
        export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
        echo "✅ Found Java 17 at: $JAVA_HOME"
    elif [ -d "/usr/lib/jvm/default-java" ]; then
        export JAVA_HOME="/usr/lib/jvm/default-java"
        echo "✅ Found Java at: $JAVA_HOME"
    elif [ -d "/usr/lib/jvm/java-11-openjdk-amd64" ]; then
        export JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64"
        echo "⚠️  Found Java 11. Android Gradle Plugin 8.0+ requires Java 17."
        echo "   Please install Java 17: sudo apt install openjdk-17-jdk"
        echo "   Or the build will use gradle.properties setting if available."
    elif command -v java >/dev/null 2>&1; then
        # Try to find Java from java command
        JAVA_PATH=$(readlink -f $(which java))
        if [ -n "$JAVA_PATH" ]; then
            JAVA_HOME=$(dirname $(dirname "$JAVA_PATH"))
            export JAVA_HOME
            echo "✅ Found Java at: $JAVA_HOME"
        fi
    fi
    
    if [ -z "${JAVA_HOME:-}" ]; then
        echo "❌ Java not found. Please install Java JDK 17 (required for AGP 8.0+):"
        echo "   sudo apt update"
        echo "   sudo apt install openjdk-17-jdk"
        echo ""
        echo "   Or set JAVA_HOME manually:"
        echo "   export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
        exit 1
    else
        export PATH=$JAVA_HOME/bin:$PATH
    fi
else
    echo "✅ JAVA_HOME is set: $JAVA_HOME"
    # Verify it's Java 17 if AGP 8.0+
    JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 17 ]; then
        echo "⚠️  Warning: Java $JAVA_VERSION detected. AGP 8.0+ requires Java 17."
        echo "   gradle.properties will override if Java 17 is installed."
    fi
fi

# Check if Android SDK is available
if [ -z "${ANDROID_HOME:-}" ]; then
    echo "⚠️  ANDROID_HOME not set. Trying to find Android SDK..."
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
        export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
        echo "✅ Found Android SDK at $ANDROID_HOME"
    else
        echo "❌ Android SDK not found at $HOME/Android/Sdk"
        echo ""
        echo "Please install Android Studio and Android SDK:"
        echo "1. Download Android Studio: https://developer.android.com/studio"
        echo "2. Install Android Studio"
        echo "3. Open Android Studio → SDK Manager"
        echo "4. Install Android SDK (API 33 recommended)"
        echo "5. Set ANDROID_HOME:"
        echo "   export ANDROID_HOME=\$HOME/Android/Sdk"
        echo "   export PATH=\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools"
        echo ""
        echo "Or create local.properties file manually:"
        echo "   echo 'sdk.dir=\$HOME/Android/Sdk' > android/local.properties"
        exit 1
    fi
else
    echo "✅ ANDROID_HOME is set: $ANDROID_HOME"
fi

# Create or update local.properties
if [ -f "android/local.properties" ]; then
    # Update existing file if ANDROID_HOME is set
    if [ -n "${ANDROID_HOME:-}" ]; then
        sed -i "s|sdk.dir=.*|sdk.dir=$ANDROID_HOME|" android/local.properties
        echo "✅ Updated android/local.properties with ANDROID_HOME"
    fi
else
    if [ -n "${ANDROID_HOME:-}" ]; then
        echo ""
        echo "==> Creating local.properties file..."
        echo "sdk.dir=$ANDROID_HOME" > android/local.properties
        echo "✅ Created android/local.properties"
    else
        echo ""
        echo "⚠️  local.properties not found and ANDROID_HOME not set"
        echo "   Creating template file. Please update it with your SDK path:"
        echo "   sdk.dir=\$HOME/Android/Sdk" > android/local.properties
        echo ""
        echo "   Or set ANDROID_HOME and run again"
        exit 1
    fi
fi

echo "==> Cleaning previous builds..."
cd android
./gradlew clean

echo ""
echo "==> Building release APK..."
./gradlew assembleRelease

echo ""
echo "✅ APK build complete!"
echo ""
echo "📦 APK location:"
echo "   android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "📱 To install on device:"
echo "   adb install android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "🔐 For signed APK (production), see BUILD_SIGNED_APK.md"

cd ..

