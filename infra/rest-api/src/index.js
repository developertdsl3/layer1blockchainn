const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

const app = express();
const PORT = process.env.PORT || 3002;
const WS_ENDPOINT = process.env.WS_ENDPOINT || 'ws://127.0.0.1:9933';

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

// Get account balance
app.get('/api/account/:address', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const address = req.params.address;
    console.log(`Getting balance for: ${address}`);

    const account = await api.query.system.account(address);
    const balance = account.data;

    res.json({
      address,
      free: balance.free?.toString() || '0',
      reserved: balance.reserved?.toString() || '0',
      miscFrozen: balance.miscFrozen?.toString() || '0',
      feeFrozen: balance.feeFrozen?.toString() || '0',
      total: balance.free && balance.reserved ? balance.free.add(balance.reserved).toString() : '0'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction details by hash
app.get('/api/transaction/:hash', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const txHash = req.params.hash;
    console.log(`Looking up transaction: ${txHash}`);

    // Try to get the transaction status
    try {
      const status = await api.rpc.chain.getTransactionStatus(txHash);
      console.log('Transaction status:', status.toJSON());

      if (status.isInBlock) {
        const blockHash = status.asInBlock;
        console.log('Found in block:', blockHash.toString());

        // Get the block header
        const header = await api.rpc.chain.getHeader(blockHash);
        const blockNumber = header.number.toNumber();

        // Get events for this block
        const events = await api.query.system.events.at(blockHash);

        console.log(`Events in block ${blockNumber}:`);
        events.forEach((record, index) => {
          console.log(`  [${index}] ${record.event.section}.${record.event.method}`);
        });

        return res.json({
          hash: txHash,
          status: 'in_block',
          blockHash: blockHash.toString(),
          blockNumber: blockNumber,
          events: events.map((record, index) => ({
            index,
            section: record.event.section,
            method: record.event.method,
            data: record.event.data.map(d => d?.toString())
          }))
        });
      }
    } catch (statusError) {
      console.log('Status lookup failed:', statusError.message);
    }

    res.status(404).json({ error: 'Transaction not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent transactions across all blocks
app.get('/api/chain/transactions/recent', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const header = await api.rpc.chain.getHeader();
    const currentBlock = header.number.toNumber();
    const startBlock = Math.max(1, currentBlock - 100); // Last 100 blocks

    console.log(`Getting recent transactions from blocks ${startBlock} to ${currentBlock}`);

    const allTransactions = [];

    // Get transactions from recent blocks
    for (let blockNum = currentBlock; blockNum >= startBlock && allTransactions.length < 200; blockNum--) {
      try {
        const blockResponse = await fetch(`http://localhost:3002/api/chain/block/${blockNum}`);
        if (blockResponse.ok) {
          const blockData = await blockResponse.json();
          if (blockData.userTransactions && blockData.userTransactions.length > 0) {
            // Add block number and timestamp to each transaction
            const blockTxs = blockData.userTransactions.map(tx => ({
              ...tx,
              block: blockNum,
              time: new Date().toISOString() // Approximate timestamp
            }));
            allTransactions.push(...blockTxs);
          }
        }
      } catch (err) {
        // Skip blocks that fail to load
        continue;
      }
    }

    // Return most recent transactions
    res.json(allTransactions.slice(0, 100));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current block height
app.get('/api/chain/current', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const header = await api.rpc.chain.getHeader();
    res.json({
      number: header.number.toNumber(),
      hash: header.hash.toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// Get latest block (avoids extrinsic version 5 decoding errors)
app.get('/api/chain/block', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const hash = await api.rpc.chain.getBlockHash();
    
    // Use getHeader() instead of getBlock() to avoid extrinsic version 5 decoding errors
    const header = await api.rpc.chain.getHeader(hash);
    
    // Count extrinsics using events (avoids decoding)
    let extrinsicsCount = 0;
    let timestamp = null;
    
    try {
      const events = await api.query.system.events.at(hash);
      const extrinsicIndices = new Set();
      
      events.forEach((record) => {
        const { event, phase } = record;
        if (phase.isApplyExtrinsic) {
          extrinsicIndices.add(phase.asApplyExtrinsic.toNumber());
        }
        // Try to get timestamp from events
        if (event.section === 'timestamp' && event.method === 'Set') {
          timestamp = event.data[0]?.toString() || null;
        }
      });
      extrinsicsCount = extrinsicIndices.size || 0;
    } catch (eventsError) {
      // If events query fails, estimate
      extrinsicsCount = 1; // At least timestamp
    }

    res.json({
      hash: hash.toString(),
      number: header.number.toNumber(),
      parentHash: header.parentHash.toString(),
      stateRoot: header.stateRoot.toString(),
      extrinsicsRoot: header.extrinsicsRoot.toString(),
      extrinsicsCount: extrinsicsCount,
      timestamp: timestamp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get block by number (avoids extrinsic version 5 decoding errors)
app.get('/api/chain/block/:number', async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    const blockNumber = parseInt(req.params.number);
    const hash = await api.rpc.chain.getBlockHash(blockNumber);
    
    // Get block header (doesn't require decoding extrinsics)
    const header = await api.rpc.chain.getHeader(hash);
    
    // Count user transactions using events (avoids extrinsic version 5 decoding)
    let totalExtrinsics = 0;
    let userTransactionCount = 0;
    const userTransactions = [];
    
    try {
      // Get events for this block (this works without decoding extrinsics)
      const events = await api.query.system.events.at(hash);


      // Count total extrinsics from events
      const extrinsicIndices = new Set();
      events.forEach((record) => {
        const { phase } = record;
        if (phase.isApplyExtrinsic) {
          extrinsicIndices.add(phase.asApplyExtrinsic.toNumber());
        }
      });
      totalExtrinsics = extrinsicIndices.size || 0;
      
      // Group events by extrinsic index to combine related information
      const extrinsicEvents = new Map();
      const blockLevelEvents = [];

      events.forEach((record) => {
        const { event, phase } = record;

        if (phase.isApplyExtrinsic) {
          const extrinsicIndex = phase.asApplyExtrinsic.toNumber();

          // Skip first extrinsic (usually timestamp - system call)
          if (extrinsicIndex === 0) return;

          if (!extrinsicEvents.has(extrinsicIndex)) {
            extrinsicEvents.set(extrinsicIndex, []);
          }
          extrinsicEvents.get(extrinsicIndex).push(record);
        } else {
          // Block-level events (not tied to specific extrinsics)
          blockLevelEvents.push(record);
        }
      });

      // Process each extrinsic's events to extract transaction details
      for (const [extrinsicIndex, records] of extrinsicEvents) {
        let transactionData = {
          extrinsicIndex,
          blockNumber,
          section: null,
          method: null,
          from: null,
          to: null,
          amount: null,
          fee: null
        };


        // Process all events for this extrinsic
        for (const record of records) {
          const { event } = record;
          const section = event.section;

          // Skip system and timestamp events
          if (section === 'system' || section === 'timestamp') continue;

          // Set main transaction info - prioritize Transfer events
          if (!transactionData.section || (section === 'balances' && event.method === 'Transfer')) {
            transactionData.section = section;
            transactionData.method = event.method;
          }

          // Extract data based on event type
          const eventData = event.data;
          if (section === 'balances') {
            if (event.method === 'Transfer' && eventData && eventData.length >= 3) {
              // balances.Transfer(from, to, amount)
              transactionData.from = eventData[0]?.toString();
              transactionData.to = eventData[1]?.toString();
              transactionData.amount = eventData[2]?.toString();
            } else if (event.method === 'Withdraw' && eventData && eventData.length >= 2 && !transactionData.from) {
              // balances.Withdraw(who, amount) - only use if we haven't found a Transfer event
              transactionData.from = eventData[0]?.toString();
              transactionData.amount = eventData[1]?.toString();
            } else if (event.method === 'Deposit' && eventData && eventData.length >= 2 && !transactionData.to) {
              // balances.Deposit(who, amount) - only use if we haven't found a Transfer event
              transactionData.to = eventData[0]?.toString();
              transactionData.amount = eventData[1]?.toString();
            }
          } else if (section === 'transactionPayment' && event.method === 'TransactionFeePaid') {
            // transactionPayment.TransactionFeePaid(who, actualFee, tip)
            if (eventData && eventData.length >= 2) {
              transactionData.fee = eventData[1]?.toString(); // actualFee
            }
          }
        }

        // Only add if we have meaningful transaction data
        if (transactionData.section) {
          userTransactionCount++;
          userTransactions.push(transactionData);
        }
      }

      // Also process block-level events (events not tied to specific extrinsics)
      blockLevelEvents.forEach(record => {
        const { event } = record;
        const section = event.section;

          if (section !== 'system' && section !== 'timestamp') {
          let transactionData = {
            extrinsicIndex: -1, // Block-level event
            blockNumber,
            section: event.section,
            method: event.method,
            from: null,
            to: null,
            amount: null,
            fee: null
          };

          // Extract data based on event type
          const eventData = event.data;
          if (section === 'balances') {
            if (event.method === 'Transfer' && eventData && eventData.length >= 3) {
              // balances.Transfer(from, to, amount)
              transactionData.from = eventData[0]?.toString();
              transactionData.to = eventData[1]?.toString();
              transactionData.amount = eventData[2]?.toString();
            } else if (event.method === 'Withdraw' && eventData && eventData.length >= 2) {
              // balances.Withdraw(who, amount) - treat as transaction from this account
              transactionData.from = eventData[0]?.toString();
              transactionData.amount = eventData[1]?.toString();
            } else if (event.method === 'Deposit' && eventData && eventData.length >= 2) {
              // balances.Deposit(who, amount) - treat as transaction to this account
              transactionData.to = eventData[0]?.toString();
              transactionData.amount = eventData[1]?.toString();
            }
          } else if (section === 'treasury' && event.method === 'UpdatedInactive') {
            // treasury.UpdatedInactive - this might be related to fee processing
            // For now, treat it as a system transaction
            transactionData.section = 'treasury';
            transactionData.method = 'UpdatedInactive';
          }

          if (transactionData.section) {
            userTransactionCount++;
            userTransactions.push(transactionData);
          }
        }
      });
    } catch (eventsError) {
      // If events query fails, we can't determine transaction count
      console.log('Events query failed:', eventsError.message);
      // Estimate: assume at least timestamp extrinsic
      totalExtrinsics = 1;
      userTransactionCount = 0;
    }

    res.json({
      hash: hash.toString(),
      number: header.number.toNumber(),
      parentHash: header.parentHash.toString(),
      stateRoot: header.stateRoot.toString(),
      extrinsicsRoot: header.extrinsicsRoot.toString(),
      extrinsicsCount: totalExtrinsics,
      userTransactionCount: userTransactionCount,
      userTransactions: userTransactions
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

