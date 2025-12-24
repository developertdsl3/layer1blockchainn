#!/bin/bash
# Script to check build status

echo "=== Build Status Checker ==="
echo ""

# Check if binary exists
if [ -f "target/release/myl1-node" ]; then
    echo "✅ BUILD SUCCESSFUL!"
    echo ""
    echo "Binary location: target/release/myl1-node"
    ls -lh target/release/myl1-node
    echo ""
    echo "You can now:"
    echo "  1. Run tests: ./scripts/test-phase1.sh"
    echo "  2. Start node: ./scripts/run-dev-node.sh"
else
    echo "⏳ Build not complete yet"
    echo ""
    
    # Check if build is running
    if ps aux | grep -E "cargo|rustc" | grep -v grep > /dev/null; then
        echo "🔄 Build is currently running..."
        echo "   Check progress with: tail -f target/release/.cargo-lock 2>/dev/null || echo 'Building...'"
    else
        echo "⚠️  No build process detected"
        echo "   Start build with: cargo build --release --package myl1-node-cli"
    fi
    
    echo ""
    echo "To monitor build progress:"
    echo "  watch -n 5 'ls -lh target/release/myl1-node 2>/dev/null || echo Building...'"
fi

echo ""
echo "=== Quick Build Check ==="
echo "Run this command to check:"
echo "  ls -lh target/release/myl1-node 2>/dev/null && echo '✅ Built!' || echo '⏳ Not built yet'"

