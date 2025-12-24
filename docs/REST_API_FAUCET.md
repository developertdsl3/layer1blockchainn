# REST API & Faucet Services

This document describes the REST API and Faucet services for MyL1 Blockchain.

## Overview

### REST API
- **Port**: 3002
- **Purpose**: RESTful wrapper for JSON-RPC endpoints
- **Features**: Account queries, block info, staking data, fee estimation

### Faucet
- **Port**: 3003
- **Purpose**: Testnet token distribution
- **Features**: Web UI, rate limiting, cooldown enforcement

## Quick Start

### REST API

```bash
# Start REST API
./scripts/start-rest-api.sh

# Or manually
cd infra/rest-api
npm install
npm start
```

API available at: `http://localhost:3002`

### Faucet

```bash
# Start Faucet
./scripts/start-faucet.sh

# Or manually
cd infra/faucet
npm install
# Edit .env and set FAUCET_MNEMONIC
npm start
```

Faucet UI available at: `http://localhost:3003`

## REST API Endpoints

### Health Check

```
GET /health
```

Returns API health status.

**Response:**
```json
{
  "status": "ok",
  "connected": true,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Chain Information

```
GET /api/chain/info
```

Get blockchain information.

**Response:**
```json
{
  "chain": "MyL1",
  "nodeName": "myl1-node",
  "nodeVersion": "0.1.0",
  "tokenSymbol": "MYL1",
  "tokenDecimals": 18
}
```

### Latest Block

```
GET /api/chain/block
```

Get the latest block information.

**Response:**
```json
{
  "hash": "0x1234...",
  "number": 12345,
  "parentHash": "0x5678...",
  "stateRoot": "0x9abc...",
  "extrinsicsRoot": "0xdef0...",
  "extrinsicsCount": 3,
  "timestamp": "1234567890"
}
```

### Block by Number

```
GET /api/chain/block/:number
```

Get block information by block number.

### Account Balance

```
GET /api/account/:address/balance
```

Get account balance.

**Response:**
```json
{
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "free": "1000000000000000000000",
  "reserved": "0",
  "frozen": "0",
  "total": "1000000000000000000000",
  "decimals": 18,
  "formatted": {
    "free": "1000",
    "reserved": "0",
    "total": "1000"
  }
}
```

### Account Info

```
GET /api/account/:address
```

Get full account information including nonce.

### Staking Info

```
GET /api/staking/:address
```

Get staking information for an account.

**Response:**
```json
{
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "isValidator": true,
  "isNominator": false,
  "ledger": {
    "stash": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    "total": "1000000000000000000000",
    "active": "1000000000000000000000",
    "unlocking": []
  },
  "nominations": []
}
```

### Validators List

```
GET /api/staking/validators
```

Get list of all active validators.

**Response:**
```json
{
  "count": 5,
  "validators": [
    {
      "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      "commission": 0.05,
      "totalStake": "1000000000000000000000",
      "ownStake": "500000000000000000000",
      "nominatorCount": 10
    }
  ]
}
```

### Transaction Fee Estimate

```
POST /api/transaction/fee
Content-Type: application/json

{
  "from": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "to": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  "amount": "1000000000000000000"
}
```

Estimate transaction fee for a transfer.

**Response:**
```json
{
  "from": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "to": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  "amount": "1000000000000000000",
  "fee": "100000000000000",
  "weight": "1000000",
  "formattedFee": "0.0001"
}
```

### Runtime Constants

```
GET /api/runtime/constants
```

Get runtime constants.

**Response:**
```json
{
  "blockTime": 6000,
  "epochDuration": 600,
  "sessionsPerEra": 6,
  "bondingDuration": 672,
  "existentialDeposit": "100000000000000000",
  "maxValidators": 1000
}
```

### Network Stats

```
GET /api/network/stats
```

Get network statistics.

**Response:**
```json
{
  "health": {
    "peers": 5,
    "isSyncing": false,
    "shouldHavePeers": true
  },
  "peers": 5,
  "syncState": {
    "currentBlock": 12345,
    "highestBlock": 12345,
    "startingBlock": 0
  }
}
```

## Faucet API

### Get Status

```
GET /api/status
```

Get faucet availability and balance.

**Response:**
```json
{
  "available": true,
  "balance": "10000000000000000000000",
  "formattedBalance": "10000",
  "amount": "1000000000000000000",
  "formattedAmount": "1",
  "cooldown": 60,
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
}
```

### Request Tokens

```
POST /api/request
Content-Type: application/json

{
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
}
```

Request tokens for an address.

**Response:**
```json
{
  "success": true,
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "amount": "1000000000000000000",
  "formattedAmount": "1",
  "txHash": "0x1234...",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Configuration

### REST API

Create `infra/rest-api/.env`:

```bash
PORT=3002
WS_ENDPOINT=ws://127.0.0.1:9944
```

### Faucet

Create `infra/faucet/.env`:

```bash
PORT=3003
WS_ENDPOINT=ws://127.0.0.1:9944
FAUCET_MNEMONIC="your twelve word mnemonic phrase here"
FAUCET_AMOUNT=1000000000000000000  # 1 MYL1
FAUCET_COOLDOWN=3600000  # 1 hour in milliseconds
FAUCET_MAX_BALANCE=10000000000000000000000  # 10000 MYL1 max
```

## Docker Deployment

### Standalone

```bash
cd infra/rest-api-faucet
docker-compose up -d
```

### Full Stack

```bash
cd infra/full-stack
docker-compose up -d
```

This includes:
- Prometheus & Grafana (monitoring)
- Subsquid (indexer)
- Explorer & Wallet
- REST API
- Faucet

## Rate Limiting

### REST API
- 100 requests per minute per IP address
- Applies to all `/api/` endpoints

### Faucet
- 1 request per hour per IP address or account address
- Cooldown enforced server-side

## Security Notes

1. **Faucet Mnemonic**: Never commit the `.env` file with real mnemonics
2. **Rate Limiting**: Both services have rate limiting enabled
3. **CORS**: Configure CORS appropriately for production
4. **HTTPS**: Use HTTPS in production
5. **Environment Variables**: Use environment variables for all sensitive data

## Production Deployment

For production:

1. Use environment variables for configuration
2. Set up HTTPS (nginx reverse proxy)
3. Use Redis for faucet request history (instead of in-memory)
4. Add monitoring and alerting
5. Set up automatic refilling of faucet account
6. Add CAPTCHA to faucet (optional)

## License

GPL-3.0-or-later

