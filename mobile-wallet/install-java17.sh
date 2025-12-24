#!/bin/bash
set -euo pipefail

echo "==> Installing Java 17 JDK (Required for Android Gradle Plugin 8.0+)"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "Please run this script without sudo. It will prompt for password when needed."
    exit 1
fi

echo "Installing OpenJDK 17..."
sudo apt update
sudo apt install -y openjdk-17-jdk

echo ""
echo "==> Setting up JAVA_HOME..."

# Find Java 17 installation
JAVA_HOME_PATH="/usr/lib/jvm/java-17-openjdk-amd64"

if [ -d "$JAVA_HOME_PATH" ]; then
    echo "✅ Found Java 17 at: $JAVA_HOME_PATH"
    
    # Add to .bashrc
    if ! grep -q "JAVA_HOME.*java-17" ~/.bashrc; then
        # Remove old JAVA_HOME if exists
        sed -i '/JAVA_HOME.*java-11/d' ~/.bashrc
        sed -i '/JAVA_HOME.*java-17/d' ~/.bashrc
        
        echo "" >> ~/.bashrc
        echo "# Java 17 for Android development (AGP 8.0+)" >> ~/.bashrc
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
    echo "✅ Java 17 installed and configured!"
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
    echo "❌ Java 17 installation not found at expected path"
    echo "Please install manually:"
    echo "   sudo apt install openjdk-17-jdk"
    exit 1
fi






