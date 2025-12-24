# REST API Endpoints Reference

## Base URL
```
http://localhost:3002
```

## Available Endpoints

### Root & Health

#### GET /
Get API information and list of available endpoints.

**Response:**
```json
{
  "name": "MyL1 REST API",
  "version": "1.0.0",
  "status": "ok",
  "connected": true,
  "endpoints": { ... }
}
```

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "connected": true,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Chain Endpoints

#### GET /api/chain/info
Get blockchain information.

**Example:**
```bash
curl http://localhost:3002/api/chain/info
```

#### GET /api/chain/block
Get the latest block.

**Example:**
```bash
curl http://localhost:3002/api/chain/block
```

#### GET /api/chain/block/:number
Get block by block number.

**Example:**
```bash
curl http://localhost:3002/api/chain/block/12345
```

### Account Endpoints

#### GET /api/account/:address/balance
Get account balance.

**Example:**
```bash
curl http://localhost:3002/api/account/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY/balance
```

#### GET /api/account/:address
Get full account information.

**Example:**
```bash
curl http://localhost:3002/api/account/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
```

### Staking Endpoints

#### GET /api/staking/:address
Get staking information for an account.

**Example:**
```bash
curl http://localhost:3002/api/staking/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
```

#### GET /api/staking/validators
Get list of all validators.

**Example:**
```bash
curl http://localhost:3002/api/staking/validators
```

### Transaction Endpoints

#### POST /api/transaction/fee
Estimate transaction fee.

**Request:**
```json
{
  "from": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "to": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  "amount": "1000000000000000000"
}
```

**Example:**
```bash
curl -X POST http://localhost:3002/api/transaction/fee \
  -H "Content-Type: application/json" \
  -d '{
    "from": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    "to": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    "amount": "1000000000000000000"
  }'
```

### Runtime Endpoints

#### GET /api/runtime/constants
Get runtime constants.

**Example:**
```bash
curl http://localhost:3002/api/runtime/constants
```

### Network Endpoints

#### GET /api/network/stats
Get network statistics.

**Example:**
```bash
curl http://localhost:3002/api/network/stats
```

## Common Errors

### 404 Not Found
If you get `{"error":"Not found"}`, you're accessing an endpoint that doesn't exist.

**Solution:**
- Check the endpoint URL is correct
- Visit `GET /` to see all available endpoints
- Check the 404 response for available endpoints list

### 503 Service Unavailable
If you get `{"error":"Node not connected"}`, the API cannot connect to the blockchain node.

**Solution:**
- Make sure the node is running
- Check `WS_ENDPOINT` in `.env` file
- Verify the node is accessible at the WebSocket endpoint

### 500 Internal Server Error
If you get a 500 error, there's an issue processing the request.

**Solution:**
- Check the API server logs
- Verify the node is synced and operational
- Check request parameters are valid

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Applies to**: All `/api/` endpoints
- **Headers**: Rate limit info is included in response headers

## Testing

Test the API is working:

```bash
# Health check
curl http://localhost:3002/health

# Get API info
curl http://localhost:3002/

# Get chain info
curl http://localhost:3002/api/chain/info
```

