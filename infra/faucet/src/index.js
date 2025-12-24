const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

const app = express();
const PORT = process.env.PORT || 3003;
const WS_ENDPOINT = process.env.WS_ENDPOINT || 'ws://127.0.0.1:9944';

// Faucet configuration
const FAUCET_AMOUNT = process.env.FAUCET_AMOUNT || '1000000000000000000'; // 1 MYL1
const FAUCET_COOLDOWN = parseInt(process.env.FAUCET_COOLDOWN || '3600000'); // 1 hour in ms
const FAUCET_MNEMONIC = process.env.FAUCET_MNEMONIC || '';
const FAUCET_MAX_BALANCE = process.env.FAUCET_MAX_BALANCE || '10000000000000000000000'; // 10000 MYL1

// Store request history (in production, use Redis or database)
const requestHistory = new Map();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting - stricter for faucet
const faucetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // 1 request per hour per IP
  message: 'You have already requested tokens. Please wait before requesting again.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize API and keyring
let api = null;
let keyring = null;
let faucetAccount = null;
let isConnected = false;

async function initApi() {
  try {
    await cryptoWaitReady();
    
    // Initialize keyring
    keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
    
    // Load faucet account
    if (FAUCET_MNEMONIC) {
      // Check if mnemonic is the dev phrase - if so, use //Alice derivation
      const DEV_PHRASE = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk';
      if (FAUCET_MNEMONIC.trim() === DEV_PHRASE) {
        // Use Alice derivation for devnet
        faucetAccount = keyring.addFromUri(FAUCET_MNEMONIC + '//Alice');
        console.log(`✅ Faucet account loaded (Alice): ${faucetAccount.address}`);
      } else {
        // Use mnemonic directly for other accounts
        faucetAccount = keyring.addFromMnemonic(FAUCET_MNEMONIC);
        console.log(`✅ Faucet account loaded: ${faucetAccount.address}`);
      }
    } else {
      console.warn('⚠️  FAUCET_MNEMONIC not set. Faucet will not be able to send tokens.');
    }

    // Connect to node
    const provider = new WsProvider(WS_ENDPOINT);
    api = await ApiPromise.create({ provider });
    await api.isReady;
    isConnected = true;
    console.log(`✅ Connected to MyL1 node at ${WS_ENDPOINT}`);

    // Check faucet balance
    if (faucetAccount) {
      const balance = await api.query.system.account(faucetAccount.address);
      const free = balance.data.free.toString();
      console.log(`💰 Faucet balance: ${(BigInt(free) / BigInt(10 ** 18)).toString()} MYL1`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize:', error.message);
    isConnected = false;
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connected: isConnected,
    faucetReady: faucetAccount !== null,
    timestamp: new Date().toISOString()
  });
});

// Get faucet status
app.get('/api/status', async (req, res) => {
  try {
    if (!isConnected || !api || !faucetAccount) {
      return res.json({
        available: false,
        reason: !isConnected ? 'Node not connected' : 'Faucet account not configured'
      });
    }

    const balance = await api.query.system.account(faucetAccount.address);
    const free = balance.data.free.toString();
    const available = BigInt(free) > BigInt(FAUCET_AMOUNT);

    res.json({
      available,
      balance: free,
      formattedBalance: (BigInt(free) / BigInt(10 ** 18)).toString(),
      amount: FAUCET_AMOUNT,
      formattedAmount: (BigInt(FAUCET_AMOUNT) / BigInt(10 ** 18)).toString(),
      cooldown: FAUCET_COOLDOWN / 1000 / 60, // minutes
      address: faucetAccount.address
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request tokens
app.post('/api/request', faucetLimiter, async (req, res) => {
  try {
    if (!isConnected || !api) {
      return res.status(503).json({ error: 'Node not connected' });
    }

    if (!faucetAccount) {
      return res.status(503).json({ error: 'Faucet account not configured' });
    }

    const { address } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // Validate address format
    try {
      keyring.addFromAddress(address);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    // Check cooldown
    const lastRequest = requestHistory.get(address) || requestHistory.get(clientIp);
    if (lastRequest) {
      const timeSince = Date.now() - lastRequest.timestamp;
      if (timeSince < FAUCET_COOLDOWN) {
        const remaining = Math.ceil((FAUCET_COOLDOWN - timeSince) / 1000 / 60);
        return res.status(429).json({
          error: 'Cooldown active',
          remainingMinutes: remaining,
          nextRequest: new Date(lastRequest.timestamp + FAUCET_COOLDOWN).toISOString()
        });
      }
    }

    // Check faucet balance
    const balance = await api.query.system.account(faucetAccount.address);
    const free = balance.data.free.toString();
    
    if (BigInt(free) < BigInt(FAUCET_AMOUNT)) {
      return res.status(503).json({
        error: 'Faucet balance too low',
        balance: free,
        required: FAUCET_AMOUNT
      });
    }

    // Check recipient balance (prevent abuse)
    const recipientBalance = await api.query.system.account(address);
    const recipientFree = recipientBalance.data.free.toString();
    
    if (BigInt(recipientFree) > BigInt(FAUCET_MAX_BALANCE)) {
      return res.status(400).json({
        error: 'Recipient balance too high',
        balance: recipientFree,
        maxAllowed: FAUCET_MAX_BALANCE
      });
    }

    // Create and sign transaction
    const transfer = api.tx.balances.transfer(address, FAUCET_AMOUNT);
    const nonce = await api.rpc.system.accountNextIndex(faucetAccount.address);
    
    const signedTx = await transfer.signAsync(faucetAccount, { nonce });
    
    // Submit transaction
    const hash = await signedTx.send();
    
    console.log(`💧 Sent ${(BigInt(FAUCET_AMOUNT) / BigInt(10 ** 18)).toString()} MYL1 to ${address} (tx: ${hash})`);

    // Record request
    requestHistory.set(address, { timestamp: Date.now(), txHash: hash.toString() });
    requestHistory.set(clientIp, { timestamp: Date.now(), txHash: hash.toString() });

    res.json({
      success: true,
      address,
      amount: FAUCET_AMOUNT,
      formattedAmount: (BigInt(FAUCET_AMOUNT) / BigInt(10 ** 18)).toString(),
      txHash: hash.toString(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Faucet error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clean up old request history (run every hour)
cron.schedule('0 * * * *', () => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, value] of requestHistory.entries()) {
    if (now - value.timestamp > FAUCET_COOLDOWN * 2) {
      requestHistory.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} old request records`);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
async function start() {
  await initApi();
  
  app.listen(PORT, () => {
    console.log(`🚰 MyL1 Faucet running on http://localhost:${PORT}`);
    console.log(`📡 Connected to node: ${WS_ENDPOINT}`);
    console.log(`💧 Amount per request: ${(BigInt(FAUCET_AMOUNT) / BigInt(10 ** 18)).toString()} MYL1`);
    console.log(`⏱️  Cooldown: ${FAUCET_COOLDOWN / 1000 / 60} minutes`);
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

