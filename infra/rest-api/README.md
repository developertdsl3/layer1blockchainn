# MyL1 REST API

REST API wrapper for MyL1 Blockchain JSON-RPC endpoints.

## Features

- ✅ RESTful endpoints for blockchain data
- ✅ Account balance queries
- ✅ Block information
- ✅ Staking information
- ✅ Transaction fee estimation
- ✅ Network statistics
- ✅ Rate limiting
- ✅ CORS enabled
- ✅ Health checks

## Installation

```bash
cd infra/rest-api
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
PORT=3002
WS_ENDPOINT=ws://127.0.0.1:9944
```

## Usage

### Start the API server

```bash
npm start
```

Or with auto-reload:

```bash
npm run dev
```

The API will be available at `http://localhost:3002`

## API Endpoints

### Health Check

```
GET /health
```

Returns API health status.

### Chain Info

```
GET /api/chain/info
```

Get blockchain information (chain name, token symbol, decimals).

### Latest Block

```
GET /api/chain/block
```

Get the latest block information.

### Block by Number

```
GET /api/chain/block/:number
```

Get block information by block number.

### Account Balance

```
GET /api/account/:address/balance
```

Get account balance (free, reserved, total).

### Account Info

```
GET /api/account/:address
```

Get full account information including nonce and balance.

### Staking Info

```
GET /api/staking/:address
```

Get staking information for an account (validator/nominator status).

### Validators List

```
GET /api/staking/validators
```

Get list of all active validators.

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

### Runtime Constants

```
GET /api/runtime/constants
```

Get runtime constants (block time, staking parameters, etc.).

### Network Stats

```
GET /api/network/stats
```

Get network statistics (peers, sync status, health).

## Example Responses

### Account Balance

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

### Latest Block

```json
{
  "hash": "0x1234...",
  "number": 12345,
  "parentHash": "0x5678...",
  "stateRoot": "0x9abc...",
  "extrinsicsRoot": "0xdef0...",
  "extrinsicsCount": 3
}
```

## Rate Limiting

- 100 requests per minute per IP address
- Applies to all `/api/` endpoints

## Docker

See `../docker-compose.yml` for Docker setup.

## License

GPL-3.0-or-later

