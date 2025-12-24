#!/bin/bash
# Script to setup faucet account for devnet

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FAUCET_DIR="$PROJECT_ROOT/infra/faucet"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "MyL1 Faucet Account Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$FAUCET_DIR"

# Check if subkey is available
if ! command -v subkey &> /dev/null; then
    echo "⚠️  subkey not found. Installing via cargo..."
    echo "   This may take a few minutes..."
    cargo install --force subkey --git https://github.com/paritytech/substrate --tag polkadot-v1.0.0 2>&1 | grep -E "(Compiling|Finished|error)" || true
fi

if ! command -v subkey &> /dev/null; then
    echo "❌ Failed to install subkey. Please install manually:"
    echo "   cargo install --force subkey --git https://github.com/paritytech/substrate"
    echo ""
    echo "Alternatively, you can use one of the well-known dev accounts:"
    echo "   Alice: bottom drive obey lake curtain smoke basket hold race lonely fit walk"
    echo ""
    read -p "Use Alice's account for faucet? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ALICE_MNEMONIC="bottom drive obey lake curtain smoke basket hold race lonely fit walk"
        if [ -f ".env" ]; then
            # Update existing .env
            if grep -q "FAUCET_MNEMONIC=" .env; then
                sed -i "s|FAUCET_MNEMONIC=.*|FAUCET_MNEMONIC=\"$ALICE_MNEMONIC\"|" .env
            else
                echo "FAUCET_MNEMONIC=\"$ALICE_MNEMONIC\"" >> .env
            fi
        else
            cat > .env << EOF
PORT=3003
WS_ENDPOINT=ws://127.0.0.1:9944
FAUCET_MNEMONIC="$ALICE_MNEMONIC"
FAUCET_AMOUNT=1000000000000000000
FAUCET_COOLDOWN=3600000
FAUCET_MAX_BALANCE=10000000000000000000000
EOF
        fi
        echo "✅ Configured Alice's account as faucet"
        echo "📝 Address: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        echo ""
        echo "⚠️  Note: Alice is a well-known dev account. For production, generate a new account."
        exit 0
    else
        exit 1
    fi
fi

echo "🔑 Generating new faucet account..."
echo ""

# Generate new account
ACCOUNT_INFO=$(subkey generate --network substrate 2>&1)

# Extract mnemonic (between backticks)
MNEMONIC=$(echo "$ACCOUNT_INFO" | grep -oP 'Secret phrase `\K[^`]+' || echo "")

if [ -z "$MNEMONIC" ]; then
    # Try alternative format
    MNEMONIC=$(echo "$ACCOUNT_INFO" | grep "Secret phrase" | sed "s/.*Secret phrase \`\(.*\)\`.*/\1/" || echo "")
fi

if [ -z "$MNEMONIC" ]; then
    echo "❌ Failed to extract mnemonic from subkey output"
    echo "Output was:"
    echo "$ACCOUNT_INFO"
    exit 1
fi

# Extract address
ADDRESS=$(echo "$ACCOUNT_INFO" | grep -oP 'SS58 Address:\s+\K[^\s]+' | head -1 || echo "")

if [ -z "$ADDRESS" ]; then
    # Try to derive address from mnemonic
    ADDRESS=$(subkey inspect "$MNEMONIC" --network substrate 2>&1 | grep -oP 'SS58 Address:\s+\K[^\s]+' | head -1 || echo "")
fi

echo "✅ Generated new faucet account:"
echo "   Address: $ADDRESS"
echo "   Mnemonic: $MNEMONIC"
echo ""

# Update .env file
if [ -f ".env" ]; then
    if grep -q "FAUCET_MNEMONIC=" .env; then
        sed -i "s|FAUCET_MNEMONIC=.*|FAUCET_MNEMONIC=\"$MNEMONIC\"|" .env
        echo "✅ Updated .env file with new mnemonic"
    else
        echo "FAUCET_MNEMONIC=\"$MNEMONIC\"" >> .env
        echo "✅ Added mnemonic to .env file"
    fi
else
    cat > .env << EOF
PORT=3003
WS_ENDPOINT=ws://127.0.0.1:9944
FAUCET_MNEMONIC="$MNEMONIC"
FAUCET_AMOUNT=1000000000000000000
FAUCET_COOLDOWN=3600000
FAUCET_MAX_BALANCE=10000000000000000000000
EOF
    echo "✅ Created .env file with new mnemonic"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Fund the faucet account with testnet tokens:"
echo "   Address: $ADDRESS"
echo ""
echo "2. For devnet, you can transfer from Alice:"
echo "   Alice: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
echo ""
echo "3. Restart the faucet service:"
echo "   ./scripts/start-faucet.sh"
echo ""
echo "⚠️  SECURITY: Keep the mnemonic safe and never commit it to git!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

