#!/bin/bash
set -euo pipefail

echo "==> Setting up MyL1 Mobile Wallet React Native Project"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the mobile-wallet directory"
    exit 1
fi

# Check if node_modules exists (project already initialized)
if [ -d "node_modules" ]; then
    echo "⚠️  node_modules already exists. Skipping npm install."
    echo "   If you want to reinstall, delete node_modules and run: npm install"
else
    echo "==> Installing dependencies..."
    npm install
fi

# Check if we need to initialize React Native project structure
if [ ! -d "android" ] && [ ! -d "ios" ]; then
    echo ""
    echo "==> React Native project structure not found."
    echo "    Initializing with @react-native-community/cli..."
    echo ""
    
    # Create a temporary directory for the new project
    TEMP_DIR=$(mktemp -d)
    PROJECT_NAME="MyL1Wallet"
    
    echo "==> Creating new React Native project in temp directory..."
    cd "$TEMP_DIR"
    npx @react-native-community/cli init "$PROJECT_NAME" --version 0.72.6 --skip-install
    
    echo ""
    echo "==> Copying React Native project structure..."
    cd "$OLDPWD"
    
    # Copy necessary directories
    if [ -d "$TEMP_DIR/$PROJECT_NAME/android" ]; then
        cp -r "$TEMP_DIR/$PROJECT_NAME/android" .
        echo "✅ Copied android/ directory"
    fi
    
    if [ -d "$TEMP_DIR/$PROJECT_NAME/ios" ]; then
        cp -r "$TEMP_DIR/$PROJECT_NAME/ios" .
        echo "✅ Copied ios/ directory"
    fi
    
    # Copy other necessary files
    if [ -f "$TEMP_DIR/$PROJECT_NAME/.gitignore" ]; then
        cp "$TEMP_DIR/$PROJECT_NAME/.gitignore" .gitignore.rn
        echo "✅ Copied .gitignore"
    fi
    
    # Cleanup
    rm -rf "$TEMP_DIR"
    
    echo ""
    echo "==> Updating iOS Podfile for our dependencies..."
    if [ -f "ios/Podfile" ]; then
        # Add necessary pods
        if ! grep -q "use_react_native" ios/Podfile; then
            echo "⚠️  Podfile may need manual updates. Please check react-native-vector-icons setup."
        fi
    fi
    
    echo ""
    echo "==> Installing iOS pods..."
    if [ -d "ios" ]; then
        cd ios
        pod install || echo "⚠️  Pod install failed. You may need to run 'pod install' manually in ios/ directory"
        cd ..
    fi
else
    echo "✅ React Native project structure already exists"
    
    # Install iOS pods if ios directory exists
    if [ -d "ios" ]; then
        echo ""
        echo "==> Installing/updating iOS pods..."
        cd ios
        pod install || echo "⚠️  Pod install had issues. You may need to run 'pod install' manually"
        cd ..
    fi
fi

echo ""
echo "==> Setup complete!"
echo ""
echo "Next steps:"
echo "1. For iOS (macOS only):"
echo "   cd ios && pod install && cd .."
echo "   npm run ios"
echo ""
echo "2. For Android:"
echo "   npm run android"
echo ""
echo "3. Start Metro bundler:"
echo "   npm start"
echo ""
echo "📱 Your mobile wallet source code is in src/ directory"
echo "📚 See README.md for detailed documentation"

