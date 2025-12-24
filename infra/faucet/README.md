# MyL1 Faucet

Faucet service for distributing testnet tokens on MyL1 Blockchain.

## Features

- ✅ Web UI for easy token requests
- ✅ Rate limiting (1 request per hour per IP/address)
- ✅ Cooldown period enforcement
- ✅ Balance checking and validation
- ✅ Automatic cleanup of request history
- ✅ Transaction signing and submission
- ✅ Real-time status updates

## Installation

```bash
cd infra/faucet
npm install
```

## Configuration

Create a `.env` file:

```bash
PORT=3003
WS_ENDPOINT=ws://127.0.0.1:9944
FAUCET_MNEMONIC="your twelve word mnemonic phrase here"
FAUCET_AMOUNT=1000000000000000000  # 1 MYL1 (in smallest unit)
FAUCET_COOLDOWN=3600000  # 1 hour in milliseconds
FAUCET_MAX_BALANCE=10000000000000000000000  # 10000 MYL1 max balance
```

### Getting a Faucet Account

1. Generate a new account using Polkadot.js Apps or CLI
2. Fund it with testnet tokens (for initial setup)
3. Use the mnemonic phrase in `FAUCET_MNEMONIC`

**⚠️ Security Warning:** Never commit the `.env` file with real mnemonics to version control!

## Usage

### Start the faucet

```bash
npm start
```

Or with auto-reload:

```bash
npm run dev
```

The faucet will be available at `http://localhost:3003`

### Web UI

Open `http://localhost:3003` in your browser to use the web interface.

### API Endpoints

#### Get Status

```
GET /api/status
```

Returns faucet availability and balance.

#### Request Tokens

```
POST /api/request
Content-Type: application/json

{
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
}
```

Request tokens for an address.

## Rate Limiting

- **1 request per hour** per IP address or account address
- Cooldown period enforced server-side
- Request history cleaned automatically

## Safety Features

1. **Balance Check**: Verifies faucet has sufficient balance before sending
2. **Recipient Limit**: Prevents sending to accounts with high balances
3. **Cooldown**: Prevents abuse with time-based restrictions
4. **Address Validation**: Validates address format before processing
5. **Transaction Signing**: Uses secure keyring for transaction signing

## Production Deployment

For production use:

1. Use environment variables for all sensitive data
2. Consider using Redis for request history (instead of in-memory Map)
3. Add monitoring and alerting
4. Set up automatic refilling of faucet account
5. Use HTTPS
6. Add CAPTCHA for additional protection

## Docker

See `../docker-compose.yml` for Docker setup.

## License

GPL-3.0-or-later

