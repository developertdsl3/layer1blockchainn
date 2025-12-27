# REST API Required for Explorer

The blockchain explorer requires the **MyL1 REST API** to be running to display real transaction data and calculate accurate TPS.

## Required REST API

**Service**: MyL1 REST API  
**Location**: `infra/rest-api/`  
**Default Port**: `3002`  
**Default WebSocket**: `ws://127.0.0.1:9944`

## Required Endpoint

The explorer uses this endpoint:

```
GET /api/chain/block/:number
```

**Example**: `http://localhost:3002/api/chain/block/12345`

**Response**:
```json
{
  "hash": "0x1234...",
  "number": 12345,
  "parentHash": "0x5678...",
  "stateRoot": "0x9abc...",
  "extrinsicsRoot": "0xdef0...",
  "extrinsicsCount": 5,
  "userTransactionCount": 3,
  "userTransactions": [
    {
      "extrinsicIndex": 1,
      "section": "balances",
      "method": "Transfer",
      "blockNumber": 12345
    },
    {
      "extrinsicIndex": 2,
      "section": "staking",
      "method": "Bond",
      "blockNumber": 12345
    }
  ]
}
```

## How to Start REST API

### Option 1: Using npm script

```bash
cd infra/rest-api
npm install
npm start
```

### Option 2: Using Docker Compose

```bash
cd infra
docker-compose up rest-api
```

### Option 3: Using the start script

```bash
./scripts/start-rest-api.sh
```

## Configuration

The REST API needs to connect to your MyL1 node. Configure in `infra/rest-api/.env`:

```bash
PORT=3002
WS_ENDPOINT=ws://127.0.0.1:9944
```

**Important**: Make sure your MyL1 node is running and accessible at the `WS_ENDPOINT` before starting the REST API.

## Verify REST API is Running

Check if the API is running:

```bash
curl http://localhost:3002/health
```

Should return:
```json
{
  "status": "ok",
  "connected": true
}
```

## What the Explorer Uses

1. **Block Data**: Gets block information including extrinsics count
2. **User Transactions**: Identifies real user transactions (excludes system calls like timestamp)
3. **TPS Calculation**: Calculates real TPS from actual transaction counts
4. **Transaction Display**: Shows only actual user transactions (transfers, staking, etc.)

## Troubleshooting

### Explorer shows "Could not fetch block data"

- **Check REST API is running**: `curl http://localhost:3002/health`
- **Check port**: Make sure REST API is on port 3002 (or update explorer code)
- **Check node connection**: REST API must be connected to your MyL1 node
- **Check CORS**: REST API has CORS enabled by default

### No transactions showing

- **Check if node has transactions**: Make sure your blockchain has actual user transactions
- **Check events**: The REST API queries events to identify user transactions
- **System calls are filtered**: Timestamp and other system extrinsics are excluded

## All Available REST API Endpoints

While the explorer only needs `/api/chain/block/:number`, the REST API provides:

- `GET /` - API info
- `GET /health` - Health check
- `GET /api/chain/info` - Chain information
- `GET /api/chain/block` - Latest block
- `GET /api/chain/block/:number` - **Block by number (used by explorer)**
- `GET /api/account/:address/balance` - Account balance
- `GET /api/account/:address` - Account info
- `GET /api/staking/:address` - Staking info
- `GET /api/staking/validators` - Validators list
- `POST /api/transaction/fee` - Fee estimation
- `GET /api/runtime/constants` - Runtime constants
- `GET /api/network/stats` - Network statistics

See `infra/rest-api/README.md` for full documentation.


