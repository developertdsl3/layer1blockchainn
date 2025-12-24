#!/bin/bash
# Script to start Faucet service

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FAUCET_DIR="$PROJECT_ROOT/infra/faucet"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Starting MyL1 Faucet Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$FAUCET_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from defaults..."
    cat > .env << EOF
PORT=3003
WS_ENDPOINT=ws://127.0.0.1:9944
FAUCET_MNEMONIC=
FAUCET_AMOUNT=1000000000000000000
FAUCET_COOLDOWN=3600000
FAUCET_MAX_BALANCE=10000000000000000000000
EOF
    echo "✅ Created .env file."
    echo "⚠️  IMPORTANT: Set FAUCET_MNEMONIC in .env file before using!"
    echo ""
fi

# Check if FAUCET_MNEMONIC is set
if grep -q "FAUCET_MNEMONIC=$" .env || ! grep -q "FAUCET_MNEMONIC=" .env; then
    echo "⚠️  WARNING: FAUCET_MNEMONIC is not set in .env file!"
    echo "   The faucet will not be able to send tokens."
    echo "   Please set FAUCET_MNEMONIC in .env file."
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🚀 Starting Faucet service..."
echo "📡 WebSocket endpoint: $(grep WS_ENDPOINT .env | cut -d '=' -f2)"
echo "🌐 Faucet UI will be available at: http://localhost:3003"
echo ""
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm start

