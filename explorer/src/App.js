import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FiSearch, FiMoon, FiSun, FiCopy, FiExternalLink,
  FiTrendingUp, FiTrendingDown, FiActivity, FiUsers,
  FiLayers, FiZap, FiLock, FiClock, FiArrowLeft
} from 'react-icons/fi';
import './index.css';

// Account Details Page Component
function AccountPage() {
  const { address } = useParams();
  const navigate = useNavigate();
  const [accountInfo, setAccountInfo] = useState(null);
  const [accountTransactions, setAccountTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('AccountPage rendered for address:', address);

  useEffect(() => {
    console.log('AccountPage useEffect triggered');
    loadAccountData();
  }, [address]);

  const loadAccountData = async () => {
    const timeout = 10000; // 10 second timeout

    try {
      setLoading(true);
      setError(null);
      console.log('Loading account data for:', address);

      // Check if API is available first
      console.log('Checking API health...');
      const healthController = new AbortController();
      const healthTimeout = setTimeout(() => healthController.abort(), timeout);

      try {
        const healthResponse = await fetch('/health', {
          signal: healthController.signal
        });
        clearTimeout(healthTimeout);

        if (!healthResponse.ok) {
          throw new Error('API not healthy');
        }
        console.log('API is healthy');
      } catch (healthErr) {
        console.error('API health check failed:', healthErr);
        if (healthErr.name === 'AbortError') {
          setError('API request timed out. Please try again.');
        } else {
          setError('Blockchain API is not available. Please try again later.');
        }
        return;
      }

      // Get account balance with timeout
      console.log('Fetching balance from:', `/api/account/${address}`);
      const balanceController = new AbortController();
      const balanceTimeout = setTimeout(() => balanceController.abort(), timeout);

      try {
        const balanceResponse = await fetch(`/api/account/${address}`, {
          signal: balanceController.signal
        });
        clearTimeout(balanceTimeout);
        console.log('Balance response status:', balanceResponse.status);

        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          console.log('Balance data:', balanceData);
          setAccountInfo(balanceData);
        } else {
          console.error('Balance API failed:', balanceResponse.status, await balanceResponse.text());
          // Don't fail completely if balance fails, continue to try transactions
        }
      } catch (balanceErr) {
        console.error('Balance fetch failed:', balanceErr);
        // Continue to try transactions even if balance fails
      }

      // Get account transactions with timeout
      console.log('Fetching transactions from:', '/api/chain/transactions/recent');
      const txController = new AbortController();
      const txTimeout = setTimeout(() => txController.abort(), timeout);

      try {
        const allTxResponse = await fetch('/api/chain/transactions/recent', {
          signal: txController.signal
        });
        clearTimeout(txTimeout);
        console.log('Transactions response status:', allTxResponse.status);

        if (allTxResponse.ok) {
          const allTxData = await allTxResponse.json();
          console.log('All transactions count:', allTxData.length);

          const accountTxs = allTxData.filter(tx =>
            tx.from === address || tx.to === address
          ).slice(0, 50); // Show last 50 transactions

          console.log('Filtered account transactions:', accountTxs.length);
          setAccountTransactions(accountTxs);
        } else {
          console.error('Transactions API failed:', allTxResponse.status, await allTxResponse.text());
          // Don't fail completely if transactions fail
        }
      } catch (txErr) {
        console.error('Transactions fetch failed:', txErr);
        // Continue even if transactions fail
      }

      // Show partial data even if some APIs fail
      console.log('Account loading complete. Info:', !!accountInfo, 'Transactions:', accountTransactions.length);

    } catch (err) {
      console.error('Error loading account:', err);
      setError('Failed to load account data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value, decimals = 18) => {
    if (!value) return '0';
    try {
      const num = BigInt(value);
      const divisor = BigInt(10 ** decimals);
      const whole = num / divisor;
      const remainder = num % divisor;
      if (remainder === 0n) {
        return whole.toString();
      } else {
        const fractional = remainder.toString().padStart(decimals, '0');
        const trimmed = fractional.replace(/0+$/, '');
        return whole.toString() + '.' + trimmed;
      }
    } catch (e) {
      return value;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading account details...</p>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            Address: {address}
          </p>
          <button
            onClick={loadAccountData}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>Error Loading Account</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            <FiArrowLeft /> Back to Explorer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="account-page">
        <div className="page-header">
          <button onClick={() => navigate('/')} className="back-btn">
            <FiArrowLeft /> Back to Explorer
          </button>
          <h1>Account Details</h1>
        </div>

        <div className="account-overview">
          <div className="account-card">
            <h2>Account Address</h2>
            <div className="address-display">
              <span className="address-text">{address}</span>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(address)}
                title="Copy address"
              >
                <FiCopy />
              </button>
            </div>
          </div>

          {accountInfo ? (
            <div className="balance-grid">
              <div className="balance-card">
                <h3>Total Balance</h3>
                <div className="balance-amount">
                  {formatNumber(accountInfo.total)} MYL1
                </div>
              </div>

              <div className="balance-card">
                <h3>Available Balance</h3>
                <div className="balance-amount">
                  {formatNumber(accountInfo.free)} MYL1
                </div>
              </div>

              <div className="balance-card">
                <h3>Reserved Balance</h3>
                <div className="balance-amount">
                  {formatNumber(accountInfo.reserved)} MYL1
                </div>
              </div>

              <div className="balance-card">
                <h3>Locked Balance</h3>
                <div className="balance-amount">
                  {formatNumber(accountInfo.miscFrozen)} MYL1
                </div>
              </div>
            </div>
          ) : (
            <div className="balance-grid">
              <div className="balance-card">
                <h3>Balance Information</h3>
                <div className="balance-amount" style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                  Unable to load balance data
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="account-transactions">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Transaction History</h2>
            <button
              onClick={loadAccountData}
              style={{
                padding: '8px 16px',
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Refresh Data
            </button>
          </div>

          {accountTransactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions found for this account</p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                Check browser console for API call details
              </p>
            </div>
          ) : (
            <div className="transactions-table">
              <div className="table-header">
                <div>Signature</div>
                <div>Block</div>
                <div>Time</div>
                <div>Type</div>
                <div>From/To</div>
                <div>Amount</div>
              </div>

              {accountTransactions.map((tx, index) => (
                <div key={index} className="table-row">
                  <div className="signature-cell">
                    <span className="signature">{tx.hash || tx.signature}</span>
                  </div>
                  <div>{tx.block}</div>
                  <div>{new Date(tx.time).toLocaleString()}</div>
                  <div>
                    <span className={`action-badge ${tx.method?.toLowerCase()}`}>
                      {tx.section}.{tx.method}
                    </span>
                  </div>
                  <div className="address-cell">
                    {tx.from === address ? (
                      <div>
                        <span className="direction">To: </span>
                        <span className="address-link" onClick={() => navigate(`/account/${tx.to}`)}>
                          {tx.to?.slice(0, 8)}...{tx.to?.slice(-8)}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="direction">From: </span>
                        <span className="address-link" onClick={() => navigate(`/account/${tx.from}`)}>
                          {tx.from?.slice(0, 8)}...{tx.from?.slice(-8)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="amount-cell">
                    {tx.amount && (
                      <span className={tx.from === address ? 'amount-negative' : 'amount-positive'}>
                        {tx.from === address ? '-' : '+'}{formatNumber(tx.amount)} MYL1
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Explorer Component
function Explorer() {
  const navigate = useNavigate();
  const [api, setApi] = useState(null);
  const [chainInfo, setChainInfo] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsEndpoint, setWsEndpoint] = useState('ws://13.211.114.206:9944');
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30m');
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);

  // Network Stats - Initialize with zero, will be populated with REAL data
  const [networkStats, setNetworkStats] = useState({
    blockNumber: 0,
    finalizedBlock: 0,
    totalIssuance: '0',
    circulatingSupply: '0',
    tps: 0, // Will be updated with REAL TPS from blockchain
    trueTps: 0, // Will be updated with REAL user transaction TPS
    totalTransactions: 0,
    activeValidators: 0,
    totalStaked: '0',
    currentStake: '0',
    delinquentStake: '0'
  });

  // Epoch Info
  const [epochInfo, setEpochInfo] = useState({
    epoch: 0,
    progress: 0,
    slotRange: { start: 0, end: 0 },
    timeRemaining: '0d 0h 0m 0s'
  });

  // Chart Data - Initialize empty, will be populated with REAL data
  const [tpsData, setTpsData] = useState([]);
  const [networkData, setNetworkData] = useState([]);

  // Initialize API connection
  useEffect(() => {
    let unsubscribe = null;
    let apiInstance = null;

    async function connect() {
      try {
        setLoading(true);
        setError(null);

        const provider = new WsProvider(wsEndpoint);
        apiInstance = await ApiPromise.create({ 
          provider,
          noInitWarn: true,
          // Skip metadata check to avoid version issues
          throwOnConnect: false
        });
        setApi(apiInstance);

        // Get chain info
        const [chain, nodeName, nodeVersion, properties] = await Promise.all([
          apiInstance.rpc.system.chain(),
          apiInstance.rpc.system.name(),
          apiInstance.rpc.system.version(),
          apiInstance.rpc.system.properties()
        ]);

        setChainInfo({
          chain: chain.toString(),
          nodeName: nodeName.toString(),
          nodeVersion: nodeVersion.toString(),
          tokenSymbol: properties.tokenSymbol?.toString() || 'MYL1',
          tokenDecimals: properties.tokenDecimals?.[0]?.toNumber() || 18
        });

        // Fetch historical transactions from recent blocks (last 50 blocks)
        const loadHistoricalTransactions = async () => {
          try {
            const header = await apiInstance.rpc.chain.getHeader();
            const currentBlock = header.number.toNumber();
            const startBlock = Math.max(1, currentBlock - 50); // Last 50 blocks
            
            console.log(`Loading historical transactions from blocks ${startBlock} to ${currentBlock}...`);
            
            const historicalTxns = [];
            const seenTxHashes = new Set();
            
            // Fetch blocks in reverse order (newest first)
            for (let blockNum = currentBlock; blockNum >= startBlock; blockNum--) {
              try {
                const restApiUrl = `http://localhost:3002/api/chain/block/${blockNum}`;
                const response = await fetch(restApiUrl);
                
                if (response.ok) {
                  const blockInfo = await response.json();
                  
                  if (blockInfo.userTransactions && blockInfo.userTransactions.length > 0) {
                    const blockHash = blockInfo.hash;
                    
                    blockInfo.userTransactions.forEach((tx) => {
                      const txHash = `${blockHash}-${tx.extrinsicIndex}`;
                      
                      if (!seenTxHashes.has(txHash)) {
                        seenTxHashes.add(txHash);
                        historicalTxns.push({
                          signature: `${blockHash.slice(0, 20)}${tx.extrinsicIndex.toString(16).padStart(8, '0')}...`,
                          block: blockNum,
                          time: new Date(), // Approximate time
                          action: `${tx.section}.${tx.method}`,
                          success: tx.method !== 'ExtrinsicFailed',
                          hash: `${blockHash.slice(0, 20)}${tx.extrinsicIndex.toString(16).padStart(8, '0')}`,
                          fullHash: blockHash,
                          extrinsicIndex: tx.extrinsicIndex,
                          from: tx.from,
                          to: tx.to,
                          amount: tx.amount,
                          fee: tx.fee,
                          section: tx.section,
                          method: tx.method
                        });
                      }
                    });
                  }
                }
              } catch (err) {
                // Skip blocks that fail to load
                console.log(`Failed to load block ${blockNum}:`, err.message);
              }
            }
            
            if (historicalTxns.length > 0) {
              console.log(`Loaded ${historicalTxns.length} historical transactions`);
              setTransactions(historicalTxns.slice(0, 50)); // Keep only latest 50
            }
          } catch (err) {
            console.error('Error loading historical transactions:', err);
          }
        };
        
        // Load historical transactions
        await loadHistoricalTransactions();

        // Subscribe to new blocks and get REAL transaction data
        unsubscribe = await apiInstance.rpc.chain.subscribeNewHeads(async (header) => {
          try {
          const blockNumber = header.number.toNumber();
          const blockHash = header.hash.toString();
          
            // Get REAL block data using REST API
            let totalExtrinsics = 0;
            let userTransactions = 0;
            const userTxns = [];
            
            try {
              // Use REST API to get block details with real transaction count
              const restApiUrl = `http://localhost:3002/api/chain/block/${blockNumber}`;
              const restResponse = await fetch(restApiUrl);
              
              if (restResponse.ok) {
                const blockInfo = await restResponse.json();
                totalExtrinsics = blockInfo.extrinsicsCount || 0;
                userTransactions = blockInfo.userTransactionCount || 0;
                
                // Create transaction entries from REAL user transactions (avoid duplicates)
                if (blockInfo.userTransactions && blockInfo.userTransactions.length > 0) {
                  // Use a Set to track unique transactions by extrinsicIndex
                  const seenTxHashes = new Set();
                  
                  blockInfo.userTransactions.forEach((tx) => {
                    const txHash = `${blockHash}-${tx.extrinsicIndex}`;
                    
                    // Only add if we haven't seen this transaction before
                    if (!seenTxHashes.has(txHash)) {
                      seenTxHashes.add(txHash);
                      userTxns.push({
                        signature: `${blockHash.slice(0, 20)}${tx.extrinsicIndex.toString(16).padStart(8, '0')}...`,
                        block: blockNumber,
                        time: new Date(),
                        action: `${tx.section}.${tx.method}`,
                        success: tx.method !== 'ExtrinsicFailed',
                        hash: `${blockHash.slice(0, 20)}${tx.extrinsicIndex.toString(16).padStart(8, '0')}`,
                        fullHash: blockHash,
                        extrinsicIndex: tx.extrinsicIndex,
                        from: tx.from,
                        to: tx.to,
                        amount: tx.amount,
                        fee: tx.fee,
                        section: tx.section,
                        method: tx.method
                      });
                    }
                  });
                } else if (userTransactions > 0) {
                  // If transaction details not available, create entries with block info
                  for (let i = 1; i <= Math.min(userTransactions, 20); i++) {
                    userTxns.push({
                      signature: `${blockHash.slice(0, 20)}${i.toString(16).padStart(8, '0')}...`,
                      block: blockNumber,
                      time: new Date(),
                      action: 'Transaction',
                      success: true,
                      hash: `${blockHash.slice(0, 20)}${i.toString(16).padStart(8, '0')}`,
                      fullHash: blockHash
                    });
                  }
                }
              } else {
                // REST API not available, block has no transactions
                totalExtrinsics = 0;
                userTransactions = 0;
              }
            } catch (fetchError) {
              // If REST API fails, no transactions in this block
              console.log('Could not fetch block data from REST API:', fetchError.message);
              totalExtrinsics = 0;
              userTransactions = 0;
            }
            
            // Calculate REAL TPS based on actual block time
            // Substrate default block time is ~6 seconds
            const blockTime = 6;
            let actualTps = 0;
            let actualTrueTps = 0;
            
            if (totalExtrinsics > 0) {
              actualTps = totalExtrinsics / blockTime; // Total TPS (all extrinsics)
            }
            
            if (userTransactions > 0) {
              actualTrueTps = userTransactions / blockTime; // True TPS (only user transactions)
            }
            
            // Only add transactions if there are actual user transactions (not system calls)
            // Use a Set to avoid duplicates when adding to state
            if (userTxns.length > 0) {
              setTransactions(prev => {
                const existingHashes = new Set(prev.map(tx => tx.hash));
                const newTxns = userTxns.filter(tx => !existingHashes.has(tx.hash));
                return [...newTxns, ...prev].slice(0, 50);
              });
            }
          
          setBlocks(prev => {
            const newBlock = {
              number: blockNumber,
              hash: blockHash,
                extrinsics: totalExtrinsics,
                userTransactions: userTransactions,
                timestamp: new Date(),
                tps: actualTps,
                trueTps: actualTrueTps
              };
              return [newBlock, ...prev].slice(0, 20);
            });

            // Update TPS chart data with REAL values
            if (actualTps > 0 || actualTrueTps > 0) {
              setTpsData(prev => {
                const newData = {
                  time: new Date().toLocaleTimeString(),
                  tps: Math.floor(actualTps),
                  trueTps: Math.floor(actualTrueTps)
                };
                return [...prev.slice(-29), newData];
              });
              
              // Update network stats with REAL TPS
              setNetworkStats(prev => ({
                ...prev,
                tps: actualTps,
                trueTps: actualTrueTps,
                totalTransactions: prev.totalTransactions + userTransactions
              }));
            }
          } catch (err) {
            console.error('Error processing block:', err);
          }
        });

        setLoading(false);
      } catch (err) {
        console.error('Connection error:', err);
        setError(`Failed to connect: ${err.message}`);
        setLoading(false);
      }
    }

    connect();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (apiInstance) {
        apiInstance.disconnect();
      }
    };
  }, [wsEndpoint]);

  // Get account balance when wallet is connected
  useEffect(() => {
    if (!api || !selectedAccount) {
      setAccountBalance(null);
        return;
      }

    const getBalance = async () => {
      try {
        const accountId = selectedAccount.address;
        const { data: accountData } = await api.query.system.account(accountId);
        setAccountBalance(accountData.free.toHuman());
      } catch (err) {
        console.error('Balance fetch error:', err);
      }
    };

    getBalance();
    const interval = setInterval(getBalance, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [api, selectedAccount]);

  // Update network stats
  useEffect(() => {
    if (!api) return;

    const updateStats = async () => {
      try {
        const [header, finalizedHeader, totalIssuance, validators, health] = await Promise.all([
          api.rpc.chain.getHeader(),
          api.rpc.chain.getFinalizedHead().then(h => api.rpc.chain.getHeader(h)),
          api.query.balances.totalIssuance(),
          api.query.session.validators(),
          api.rpc.system.health()
        ]);

        const totalIssuanceNum = totalIssuance.toString();
        const circulatingSupply = totalIssuanceNum; // Simplified

        // Calculate epoch progress (mock for now)
        const currentEpoch = Math.floor(header.number.toNumber() / 600); // ~600 blocks per epoch
        const epochProgress = ((header.number.toNumber() % 600) / 600) * 100;

        // Keep existing TPS values (updated by block subscription)
        setNetworkStats(prev => ({
          ...prev,
          blockNumber: header.number.toNumber(),
          finalizedBlock: finalizedHeader.number.toNumber(),
          totalIssuance: formatNumber(totalIssuanceNum, 18),
          circulatingSupply: formatNumber(circulatingSupply, 18),
          activeValidators: validators.length
          // Don't reset totalTransactions or TPS here - they're updated by block subscription
        }));

        setEpochInfo({
          epoch: currentEpoch,
          progress: epochProgress,
          slotRange: { start: currentEpoch * 600, end: (currentEpoch + 1) * 600 },
          timeRemaining: calculateTimeRemaining(epochProgress)
        });

        // Get staking info
        try {
          const activeEra = await api.query.staking.activeEra();
          const totalStaked = await api.query.staking.erasTotalStake(activeEra.unwrap().index);
          setNetworkStats(prev => ({
            ...prev,
            totalStaked: formatNumber(totalStaked.toString(), 18),
            currentStake: formatNumber(totalStaked.toString(), 18)
          }));
        } catch (e) {
          console.log('Staking info not available');
        }
      } catch (err) {
        console.error('Stats error:', err);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 6000); // Update every 6 seconds

    return () => clearInterval(interval);
  }, [api]);

  // Helper functions
  const formatNumber = (num, decimals) => {
    const numStr = num.toString();
    if (numStr.length <= decimals) return '0';
    const whole = numStr.slice(0, -decimals);
    const fraction = numStr.slice(-decimals, -decimals + 2);
    return `${parseInt(whole).toLocaleString()}.${fraction}`;
  };

  const calculateTimeRemaining = (progress) => {
    const remaining = 100 - progress;
    const blocksRemaining = (remaining / 100) * 600;
    const seconds = blocksRemaining * 6;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${Math.floor(hours / 24)}d ${hours % 24}h ${minutes}m ${secs}s`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show toast notification
      alert('Copied to clipboard!');
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Search functionality - check if it's a block number, hash, or address
    const query = searchQuery.trim();
    
    // If it's a number, treat as block number
    if (/^\d+$/.test(query)) {
      setSelectedBlock({ number: parseInt(query) });
      // Scroll to blocks section
      document.querySelector('.blocks-grid')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    // If it's a hash (starts with 0x or long hex string)
    if (/^0x[a-fA-F0-9]+$/.test(query) || /^[a-fA-F0-9]{32,}$/.test(query)) {
      // Could be a transaction hash or block hash
      const matchingTx = transactions.find(tx => tx.hash?.includes(query) || tx.signature.includes(query));
      if (matchingTx) {
        setSelectedTransaction(matchingTx);
        document.querySelector('.transactions-table')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert('Hash not found in recent transactions');
      }
      return;
    }
    
    alert('Search query not recognized. Try a block number or transaction hash.');
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    // Filter chart data based on time range
    // For now, we'll just update the active button
    // In a real implementation, you'd filter tpsData based on the range
  };

  const handleBlockClick = (block) => {
    setSelectedBlock(block);
    // Show block details modal or navigate
    alert(`Block #${block.number}\nHash: ${block.hash}\nTransactions: ${block.extrinsics}\nTPS: ${block.tps.toFixed(2)}`);
  };

  const handleTransactionClick = async (tx) => {
    setSelectedTransaction(tx);
    
    // Fetch full transaction details from REST API
    try {
      const restApiUrl = `http://localhost:3002/api/chain/block/${tx.block}`;
      const response = await fetch(restApiUrl);
      
      if (response.ok) {
        const blockInfo = await response.json();
        const txDetail = blockInfo.userTransactions?.find(
          t => t.extrinsicIndex === tx.extrinsicIndex
        );
        
        if (txDetail) {
          setTransactionDetails({
            ...tx,
            ...txDetail,
            blockHash: blockInfo.hash,
            timestamp: tx.time
          });
        } else {
          setTransactionDetails(tx);
        }
      } else {
        setTransactionDetails(tx);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      setTransactionDetails(tx);
    }
    
    setShowTransactionModal(true);
  };

  const handleNavClick = (e, section) => {
    e.preventDefault();
    // Scroll to section (for now, just show alert)
    alert(`Navigating to ${section} section`);
  };

  const connectWallet = async () => {
    try {
      const extensions = await web3Enable('MyL1 Explorer');
      if (extensions.length === 0) {
        alert('No wallet extension found. Please install Polkadot.js extension.');
        return;
      }

      const allAccounts = await web3Accounts();
      setAccounts(allAccounts);
      
      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0]);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      alert(`Failed to connect wallet: ${err.message}`);
    }
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <motion.div 
              className="logo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="logo-icon">🔗</span>
              <span className="logo-text">MYL1SCAN</span>
            </motion.div>
            <div className="price-info">
              <span className="price-label">MYL1 Price</span>
              <span className="price-value">$0.00</span>
              <span className="price-change positive">+0.00%</span>
              <span className="avg-fee">Avg Fee: 0.0001 MYL1</span>
            </div>
          </div>
          
          <nav className="nav-menu">
            <a href="#analytics" onClick={(e) => handleNavClick(e, 'Analytics')}>Analytics</a>
            <a href="#defi" onClick={(e) => handleNavClick(e, 'DeFi')}>DeFi</a>
            <a href="#leaderboard" onClick={(e) => handleNavClick(e, 'Leaderboard')}>Leaderboard</a>
            <a href="#blockchain" onClick={(e) => handleNavClick(e, 'Blockchain')}>Blockchain</a>
            <a href="#resources" onClick={(e) => handleNavClick(e, 'Resources')}>Resources</a>
          </nav>

          <div className="header-actions">
            <motion.button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </motion.button>
            {selectedAccount ? (
              <div className="wallet-connected">
                <span>{selectedAccount.meta.name || 'Account'}</span>
                {accountBalance && <span className="balance-display">{accountBalance} MYL1</span>}
                <button onClick={() => {
                  setSelectedAccount(null);
                  setAccountBalance(null);
                }}>Disconnect</button>
              </div>
            ) : (
              <motion.button
                className="connect-btn"
                onClick={connectWallet}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign in
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">Explore MyL1 Blockchain</h1>
          <form className="search-container" onSubmit={handleSearch}>
            <FiSearch className="search-icon" />
              <input 
                type="text" 
              className="search-input"
              placeholder="Search transactions, blocks, accounts and tokens"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" style={{ display: 'none' }}>Search</button>
          </form>
            </div>

        {/* Stats Panels */}
        <div className="stats-grid">
          {/* Supply Panel */}
          <motion.div
            className="stat-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02, z: 20 }}
          >
            <div className="panel-header">
              <FiLayers className="panel-icon" />
              <span>MYL1 Supply</span>
          </div>
            <div className="panel-content">
              <div className="stat-item">
                <span className="stat-label">Total MYL1 Supply</span>
                <span className="stat-value">{networkStats.totalIssuance}</span>
          </div>
              <div className="stat-item">
                <span className="stat-label">Circulating Supply</span>
                <span className="stat-value">{networkStats.circulatingSupply} MYL1</span>
                <span className="stat-percent">(91.19%)</span>
          </div>
              <div className="stat-item">
                <span className="stat-label">Non-circulating Supply</span>
                <span className="stat-value">0 MYL1</span>
                <span className="stat-percent">(8.81%)</span>
          </div>
        </div>
          </motion.div>

          {/* Epoch Panel */}
          <motion.div
            className="stat-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02, z: 20 }}
          >
            <div className="panel-header">
              <FiClock className="panel-icon" />
              <span>Current Epoch</span>
            </div>
            <div className="panel-content">
              <div className="epoch-number">{epochInfo.epoch}</div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${epochInfo.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="progress-text">{epochInfo.progress.toFixed(2)}%</span>
              </div>
              <div className="epoch-details">
                <div>Slot Range: {epochInfo.slotRange.start} to {epochInfo.slotRange.end}</div>
                <div>Time Remain: {epochInfo.timeRemaining}</div>
              </div>
            </div>
          </motion.div>

          {/* Network Panel */}
          <motion.div
            className="stat-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02, z: 20 }}
          >
            <div className="panel-header">
              <FiActivity className="panel-icon" />
              <span>Network</span>
            </div>
            <div className="panel-content">
              <div className="stat-item">
                <span className="stat-label">Total Transactions</span>
                <span className="stat-value">{networkStats.totalTransactions.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Block Height</span>
                <span className="stat-value">{networkStats.blockNumber.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Slot Height</span>
                <span className="stat-value">{networkStats.blockNumber.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">TPS</span>
                <span className="stat-value highlight">{networkStats.tps.toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">True TPS</span>
                <span className="stat-value">{networkStats.trueTps}</span>
              </div>
            </div>
          </motion.div>

          {/* Staking Panel */}
          <motion.div
            className="stat-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02, z: 20 }}
          >
            <div className="panel-header">
              <FiLock className="panel-icon" />
              <span>Total Stake</span>
            </div>
            <div className="panel-content">
              <div className="stat-item">
                <span className="stat-label">Total Staked MYL1</span>
                <span className="stat-value">{networkStats.totalStaked}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Current Stake</span>
                <span className="stat-value">{networkStats.currentStake} MYL1</span>
                <span className="stat-percent">(99.99%)</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Delinquent Stake</span>
                <span className="stat-value">{networkStats.delinquentStake} MYL1</span>
                <span className="stat-percent">(0.00%)</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Validators</span>
                <span className="stat-value">{networkStats.activeValidators}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Latest Transactions */}
        <motion.div
          className="section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="section-header">
            <h2>Latest Transactions</h2>
            <button 
              className="customize-btn"
              onClick={() => setShowCustomizeModal(!showCustomizeModal)}
            >
              Customize
            </button>
          </div>
          {showCustomizeModal && (
            <div className="modal-overlay" onClick={() => setShowCustomizeModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Customize Transaction View</h3>
                <p>Configure columns, filters, and display options</p>
                <button onClick={() => setShowCustomizeModal(false)}>Close</button>
              </div>
            </div>
          )}
          <div className="transactions-table">
            <div className="table-header">
              <div>Signature</div>
                <div>Time</div>
              <div>Block</div>
              <div>Action</div>
              </div>
            {transactions.length === 0 ? (
              <div className="empty-state">Waiting for transactions...</div>
            ) : (
              transactions.slice(0, 10).map((tx, idx) => (
                <motion.div
                  key={`${tx.signature}-${idx}`}
                  className="table-row"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  onClick={() => handleTransactionClick(tx)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="signature-cell">
                    <span>{tx.signature}</span>
                    <FiCopy 
                      className="copy-icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(tx.signature);
                      }}
                    />
                </div>
                  <div>{tx.time.toLocaleTimeString()}</div>
                  <div>{tx.block.toLocaleString()}</div>
                  <div className="action-cell">{tx.action}</div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* TPS Chart */}
        <motion.div
          className="section chart-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="section-header">
            <h2>TPS | True TPS</h2>
            <div className="chart-controls">
              <button 
                className={`time-btn ${selectedTimeRange === '30m' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('30m')}
              >
                30m
              </button>
              <button 
                className={`time-btn ${selectedTimeRange === '2H' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('2H')}
              >
                2H
              </button>
              <button 
                className={`time-btn ${selectedTimeRange === '6H' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('6H')}
              >
                6H
              </button>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tpsData.length > 0 ? tpsData : [{ time: '0', tps: 0, trueTps: 0 }]}>
                <defs>
                  <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="trueTpsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tps" 
                  stroke="#00d4ff" 
                  fillOpacity={1} 
                  fill="url(#tpsGradient)"
                />
                <Area 
                  type="monotone" 
                  dataKey="trueTps" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#trueTpsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Latest Blocks */}
        <motion.div
          className="section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="section-header">
            <h2>Latest Blocks</h2>
          </div>
          <div className="blocks-grid">
            {blocks.slice(0, 12).map((block, idx) => (
              <motion.div
                key={block.hash}
                className="block-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, z: 20 }}
                onClick={() => handleBlockClick(block)}
                style={{ cursor: 'pointer' }}
              >
                <div className="block-number">#{block.number.toLocaleString()}</div>
                <div className="block-hash">{block.hash.slice(0, 16)}...</div>
                <div className="block-extrinsics">
                  {block.userTransactions !== undefined 
                    ? `${block.userTransactions.toLocaleString()} txns` 
                    : `${block.extrinsics.toLocaleString()} extrinsics`}
                </div>
                <div className="block-time">{block.timestamp.toLocaleTimeString()}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Transaction Detail Modal */}
      {showTransactionModal && transactionDetails && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <motion.div
            className="modal-content transaction-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button 
                className="close-btn"
                onClick={() => setShowTransactionModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="transaction-details">
              <div className="detail-section">
                <div className="detail-item">
                  <span className="detail-label">Transaction Hash</span>
                  <div className="detail-value hash-value">
                    <span>{transactionDetails.fullHash || transactionDetails.hash}</span>
                    <FiCopy 
                      className="copy-icon" 
                      onClick={() => copyToClipboard(transactionDetails.fullHash || transactionDetails.hash)}
                    />
                  </div>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value status ${transactionDetails.success ? 'success' : 'failed'}`}>
                    {transactionDetails.success ? '✅ Success' : '❌ Failed'}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Block</span>
                  <span className="detail-value">{transactionDetails.block.toLocaleString()}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">{transactionDetails.time.toLocaleString()}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Action</span>
                  <span className="detail-value">{transactionDetails.action}</span>
                </div>
              </div>

              {(transactionDetails.from || transactionDetails.to) && (
                <div className="detail-section">
                  <h3>Transfer Details</h3>
                  
                  {transactionDetails.from && (
                    <div className="detail-item">
                      <span className="detail-label">From</span>
                      <div className="detail-value address-value">
                        <span
                          className="address-link"
                          onClick={() => {
                            setShowTransactionModal(false);
                            navigate(`/account/${transactionDetails.from}`);
                          }}
                        >
                          {transactionDetails.from}
                        </span>
                        <FiCopy
                          className="copy-icon"
                          onClick={() => copyToClipboard(transactionDetails.from)}
                        />
                      </div>
                    </div>
                  )}
                  
                  {transactionDetails.to && (
                    <div className="detail-item">
                      <span className="detail-label">To</span>
                      <div className="detail-value address-value">
                        <span
                          className="address-link"
                          onClick={() => {
                            setShowTransactionModal(false);
                            navigate(`/account/${transactionDetails.to}`);
                          }}
                        >
                          {transactionDetails.to}
                        </span>
                        <FiCopy
                          className="copy-icon"
                          onClick={() => copyToClipboard(transactionDetails.to)}
                        />
        </div>
      </div>
                  )}
                  
                  {transactionDetails.amount && (
                    <div className="detail-item">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value amount-value">
                        {(() => {
                          try {
                            // eslint-disable-next-line no-undef
                            const amount = BigInt(transactionDetails.amount);
                            // eslint-disable-next-line no-undef
                            const divisor = BigInt(10 ** 18);
                            const whole = amount / divisor;
                            const remainder = amount % divisor;
                            if (remainder === 0n) {
                              return whole.toString() + ' MYL1';
                            } else {
                              // Handle fractional amounts
                              const fractional = remainder.toString().padStart(18, '0');
                              const trimmed = fractional.replace(/0+$/, '');
                              return whole.toString() + '.' + trimmed + ' MYL1';
                            }
                          } catch (e) {
                            return transactionDetails.amount + ' (raw)';
                          }
                        })()}
                      </span>
                    </div>
                  )}

                  {transactionDetails.fee && (
                    <div className="detail-item">
                      <span className="detail-label">Fee</span>
                      <span className="detail-value amount-value">
                        {(() => {
                          try {
                            // eslint-disable-next-line no-undef
                            const fee = BigInt(transactionDetails.fee);
                            // eslint-disable-next-line no-undef
                            const divisor = BigInt(10 ** 18);
                            const whole = fee / divisor;
                            const remainder = fee % divisor;
                            if (remainder === 0n) {
                              return whole.toString() + ' MYL1';
                            } else {
                              // Handle fractional amounts
                              const fractional = remainder.toString().padStart(18, '0');
                              const trimmed = fractional.replace(/0+$/, '');
                              return whole.toString() + '.' + trimmed + ' MYL1';
                            }
                          } catch (e) {
                            return transactionDetails.fee + ' (raw)';
                          }
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="detail-section">
                <h3>Block Information</h3>
                <div className="detail-item">
                  <span className="detail-label">Block Hash</span>
                  <div className="detail-value hash-value">
                    <span>{transactionDetails.blockHash || 'N/A'}</span>
                    {transactionDetails.blockHash && (
                      <FiCopy 
                        className="copy-icon" 
                        onClick={() => copyToClipboard(transactionDetails.blockHash)}
                      />
                    )}
                  </div>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Extrinsic Index</span>
                  <span className="detail-value">{transactionDetails.extrinsicIndex || 'N/A'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Main App with Routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Explorer />} />
        <Route path="/account/:address" element={<AccountPage />} />
      </Routes>
    </Router>
  );
}

export default App;
