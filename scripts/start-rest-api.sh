#!/bin/bash
# Script to start REST API server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REST_API_DIR="$PROJECT_ROOT/infra/rest-api"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Starting MyL1 REST API Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$REST_API_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from defaults..."
    cat > .env << EOF
PORT=3002
WS_ENDPOINT=ws://127.0.0.1:9944
EOF
    echo "✅ Created .env file. Edit it if needed."
fi

echo "🚀 Starting REST API server..."
echo "📡 WebSocket endpoint: $(grep WS_ENDPOINT .env | cut -d '=' -f2)"
echo "🌐 API will be available at: http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm start

