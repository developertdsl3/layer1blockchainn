const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

const app = express();
const PORT = process.env.PORT || 3002;
const WS_ENDPOINT = process.env.WS_ENDPOINT || 'ws://127.0.0.1:9944';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Initialize API
let api = null;
let isConnected = false;

async function initApi() {
  try {
    const provider = new WsProvider(WS_ENDPOINT);
    api = await ApiPromise.create({ provider });
    await api.isReady;
    isConnected = true;
    console.log(`✅ Connected to MyL1 node at ${WS_ENDPOINT}`);
  } catch (error) {
    console.error('❌ Failed to connect to node:', error.message);
    isConnected = false;
  }
}

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    name: 'MyL1 REST API',
    version: '1.0.0',
    status: 'ok',
    connected: isConnected,
    endpoints: {
      health: 'GET /health',
      chain: {
        info: 'GET /api/chain/info',
        block: 'GET /api/chain/block',
        blockByNumber: 'GET /api/chain/block/:number'
      },
      account: {
        balance: 'GET /api/account/:address/balance',
        info: 'GET /api/account/:address'
      },
      staking: {
        info: 'GET /api/staking/:address',
        validators: 'GET /api/staking/validators'
      },
      transaction: {
        feeEstimate: 'POST /api/transaction/fee'
      },
      runtime: {
        constants: 'GET /api/runtime/constants'
      },
      network: {
        stats: 'GET /api/network/stats'
      }
    },
    documentation: 'See docs/REST_API_FAUCET.md for details'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connected: isConnected,
    timestamp: new Date().toISOString()
  });
});

// API Routes

// Get chain info
app.get('/api/chain/info', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const [chain, nodeName, nodeVersion, properties] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version(),
      api.rpc.system.properties()
    ]);

    // Handle tokenDecimals - it might be an array or a single value
    let tokenDecimals = 18;
    if (properties.tokenDecimals) {
      if (Array.isArray(properties.tokenDecimals)) {
        tokenDecimals = properties.tokenDecimals[0]?.toNumber?.() || properties.tokenDecimals[0] || 18;
      } else {
        tokenDecimals = properties.tokenDecimals.toNumber?.() || properties.tokenDecimals || 18;
      }
    }

    res.json({
      chain: chain.toString(),
      nodeName: nodeName.toString(),
      nodeVersion: nodeVersion.toString(),
      tokenSymbol: properties.tokenSymbol?.toString() || 'MYL1',
      tokenDecimals: tokenDecimals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get latest block
app.get('/api/chain/block', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const hash = await api.rpc.chain.getBlockHash();
    const block = await api.rpc.chain.getBlock(hash);

    res.json({
      hash: hash.toString(),
      number: block.block.header.number.toNumber(),
      parentHash: block.block.header.parentHash.toString(),
      stateRoot: block.block.header.stateRoot.toString(),
      extrinsicsRoot: block.block.header.extrinsicsRoot.toString(),
      extrinsicsCount: block.block.extrinsics.length,
      timestamp: block.block.extrinsics.find(
        (ex) => ex.method.section === 'timestamp'
      )?.method?.args?.[0]?.toString() || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get block by number
app.get('/api/chain/block/:number', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const blockNumber = parseInt(req.params.number);
    const hash = await api.rpc.chain.getBlockHash(blockNumber);
    const block = await api.rpc.chain.getBlock(hash);

    res.json({
      hash: hash.toString(),
      number: block.block.header.number.toNumber(),
      parentHash: block.block.header.parentHash.toString(),
      stateRoot: block.block.header.stateRoot.toString(),
      extrinsicsRoot: block.block.header.extrinsicsRoot.toString(),
      extrinsicsCount: block.block.extrinsics.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get account balance
app.get('/api/account/:address/balance', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const address = req.params.address;
    const accountInfo = await api.query.system.account(address);

    const free = accountInfo.data.free.toString();
    const reserved = accountInfo.data.reserved.toString();
    const frozen = accountInfo.data.frozen?.toString() || '0';
    const total = (BigInt(free) + BigInt(reserved)).toString();

    res.json({
      address,
      free,
      reserved,
      frozen,
      total,
      decimals: 18,
      formatted: {
        free: (BigInt(free) / BigInt(10 ** 18)).toString(),
        reserved: (BigInt(reserved) / BigInt(10 ** 18)).toString(),
        total: (BigInt(total) / BigInt(10 ** 18)).toString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get account info
app.get('/api/account/:address', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const address = req.params.address;
    const [accountInfo, nonce] = await Promise.all([
      api.query.system.account(address),
      api.query.system.accountNonce(address)
    ]);

    const free = accountInfo.data.free.toString();
    const reserved = accountInfo.data.reserved.toString();
    const total = (BigInt(free) + BigInt(reserved)).toString();

    res.json({
      address,
      nonce: nonce.toString(),
      balance: {
        free,
        reserved,
        total,
        decimals: 18,
        formatted: {
          free: (BigInt(free) / BigInt(10 ** 18)).toString(),
          reserved: (BigInt(reserved) / BigInt(10 ** 18)).toString(),
          total: (BigInt(total) / BigInt(10 ** 18)).toString()
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get staking info for account
app.get('/api/staking/:address', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const address = req.params.address;
    const [ledger, exposure] = await Promise.all([
      api.query.staking.ledger(address).catch(() => null),
      api.query.staking.nominators(address).catch(() => null)
    ]);

    res.json({
      address,
      isValidator: ledger !== null,
      isNominator: exposure !== null,
      ledger: ledger ? {
        stash: ledger.stash.toString(),
        total: ledger.total.toString(),
        active: ledger.active.toString(),
        unlocking: ledger.unlocking.toJSON()
      } : null,
      nominations: exposure ? exposure.targets.map(t => t.toString()) : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get validators
app.get('/api/staking/validators', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const validators = await api.query.session.validators();
    const validatorInfo = await Promise.all(
      validators.map(async (validator) => {
        const [exposure, prefs] = await Promise.all([
          api.query.staking.erasStakers(api.consts.staking.activeEra, validator).catch(() => null),
          api.query.staking.validators(validator).catch(() => null)
        ]);

        return {
          address: validator.toString(),
          commission: prefs ? (prefs.commission.toNumber() / 1000000) : 0,
          totalStake: exposure ? exposure.total.toString() : '0',
          ownStake: exposure ? exposure.own.toString() : '0',
          nominatorCount: exposure ? exposure.others.length : 0
        };
      })
    );

    res.json({
      count: validators.length,
      validators: validatorInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction fee estimate
app.post('/api/transaction/fee', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required fields: from, to, amount' });
    }

    const transfer = api.tx.balances.transfer(to, amount);
    const paymentInfo = await transfer.paymentInfo(from);

    res.json({
      from,
      to,
      amount,
      fee: paymentInfo.partialFee.toString(),
      weight: paymentInfo.weight.toString(),
      formattedFee: (BigInt(paymentInfo.partialFee.toString()) / BigInt(10 ** 18)).toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get runtime constants
app.get('/api/runtime/constants', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    res.json({
      blockTime: api.consts.babe.expectedBlockTime?.toNumber() || 6000,
      epochDuration: api.consts.babe.epochDuration?.toNumber() || null,
      sessionsPerEra: api.consts.staking.sessionsPerEra?.toNumber() || 6,
      bondingDuration: api.consts.staking.bondingDuration?.toNumber() || 672,
      existentialDeposit: api.consts.balances.existentialDeposit?.toString() || '0',
      maxValidators: api.consts.staking.maxValidators?.toNumber() || 1000
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get network stats
app.get('/api/network/stats', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const [health, peers, syncState] = await Promise.all([
      api.rpc.system.health(),
      api.rpc.system.peers(),
      api.rpc.system.syncState()
    ]);

    res.json({
      health: {
        peers: health.peers.toNumber(),
        isSyncing: health.isSyncing.valueOf(),
        shouldHavePeers: health.shouldHavePeers.valueOf()
      },
      peers: peers.length,
      syncState: {
        currentBlock: syncState.currentBlock.toNumber(),
        highestBlock: syncState.highestBlock.toNumber(),
        startingBlock: syncState.startingBlock.toNumber()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /health',
      chainInfo: 'GET /api/chain/info',
      latestBlock: 'GET /api/chain/block',
      blockByNumber: 'GET /api/chain/block/:number',
      accountBalance: 'GET /api/account/:address/balance',
      accountInfo: 'GET /api/account/:address',
      stakingInfo: 'GET /api/staking/:address',
      validators: 'GET /api/staking/validators',
      feeEstimate: 'POST /api/transaction/fee',
      runtimeConstants: 'GET /api/runtime/constants',
      networkStats: 'GET /api/network/stats'
    },
    documentation: 'See docs/REST_API_FAUCET.md for full API reference'
  });
});

// Start server
async function start() {
  await initApi();
  
  app.listen(PORT, () => {
    console.log(`🚀 MyL1 REST API server running on http://localhost:${PORT}`);
    console.log(`📡 Connected to node: ${WS_ENDPOINT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  if (api) {
    await api.disconnect();
  }
  process.exit(0);
});

start().catch(console.error);

