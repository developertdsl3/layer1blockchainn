# Faucet Setup Guide

## Quick Setup for Devnet

For local devnet, you can use Alice's well-known account:

```bash
cd infra/faucet
cat > .env << 'EOF'
PORT=3003
WS_ENDPOINT=ws://127.0.0.1:9944
FAUCET_MNEMONIC="bottom drive obey lake curtain smoke basket hold race lonely fit walk"
FAUCET_AMOUNT=1000000000000000000
FAUCET_COOLDOWN=3600000
FAUCET_MAX_BALANCE=10000000000000000000000
EOF
```

**Alice's Account:**
- Address: `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`
- This account is pre-funded in devnet mode

## Generate New Account (Production)

For production/testnet, generate a new account:

```bash
./scripts/setup-faucet-account.sh
```

Or manually:

```bash
# Install subkey if needed
cargo install --force subkey --git https://github.com/paritytech/substrate

# Generate new account
subkey generate --network substrate

# Copy the mnemonic and update .env file
```

## Fund the Faucet Account

### For Devnet (Alice)
Alice is already funded in devnet mode, so no action needed.

### For Testnet/Production
1. Get the faucet address from the generated account
2. Transfer tokens to the faucet address from a funded account
3. Verify balance using:
   ```bash
   curl http://localhost:3002/api/account/FAUCET_ADDRESS/balance
   ```

## Start Faucet

After configuring:

```bash
./scripts/start-faucet.sh
```

Or manually:

```bash
cd infra/faucet
npm start
```

## Verify Setup

1. Check faucet status:
   ```bash
   curl http://localhost:3003/api/status
   ```

2. Open web UI:
   ```
   http://localhost:3003
   ```

3. The status should show:
   - ✅ Faucet Available
   - Balance > 0 MYL1

## Troubleshooting

### "Faucet account not configured"
- Check `.env` file exists
- Verify `FAUCET_MNEMONIC` is set (not empty)
- Restart the faucet service

### "Faucet balance too low"
- Fund the faucet account with tokens
- Check balance: `curl http://localhost:3002/api/account/FAUCET_ADDRESS/balance`

### "Node not connected"
- Make sure the blockchain node is running
- Check `WS_ENDPOINT` in `.env` matches your node's WebSocket port
- Default: `ws://127.0.0.1:9944`

## Security Notes

⚠️ **Never commit `.env` file with real mnemonics to git!**

- Use `.gitignore` to exclude `.env` files
- For production, use environment variables or secret management
- Alice's account is only for local devnet testing

