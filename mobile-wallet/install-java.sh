#!/bin/bash
set -euo pipefail

echo "==> Installing Java JDK for Android Build"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "Please run this script without sudo. It will prompt for password when needed."
    exit 1
fi

echo "Installing OpenJDK 11 (recommended for Android)..."
sudo apt update
sudo apt install -y openjdk-11-jdk

echo ""
echo "==> Setting up JAVA_HOME..."

# Find Java installation
JAVA_HOME_PATH="/usr/lib/jvm/java-11-openjdk-amd64"

if [ -d "$JAVA_HOME_PATH" ]; then
    echo "✅ Found Java at: $JAVA_HOME_PATH"
    
    # Add to .bashrc
    if ! grep -q "JAVA_HOME" ~/.bashrc; then
        echo "" >> ~/.bashrc
        echo "# Java for Android development" >> ~/.bashrc
        echo "export JAVA_HOME=$JAVA_HOME_PATH" >> ~/.bashrc
        echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> ~/.bashrc
        echo "✅ Added JAVA_HOME to ~/.bashrc"
    else
        echo "⚠️  JAVA_HOME already in ~/.bashrc"
    fi
    
    # Set for current session
    export JAVA_HOME=$JAVA_HOME_PATH
    export PATH=$JAVA_HOME/bin:$PATH
    
    echo ""
    echo "✅ Java installed and configured!"
    echo ""
    echo "Verifying installation:"
    java -version
    echo ""
    echo "JAVA_HOME: $JAVA_HOME"
    echo ""
    echo "⚠️  Note: You may need to restart your terminal or run:"
    echo "   source ~/.bashrc"
    echo ""
    echo "Then you can build the APK:"
    echo "   npm run build:apk"
else
    echo "❌ Java installation not found at expected path"
    echo "Please install manually:"
    echo "   sudo apt install openjdk-11-jdk"
    exit 1
fi

