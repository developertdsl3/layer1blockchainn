import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import './index.css';

function App() {
  const [api, setApi] = useState(null);
  const [chainInfo, setChainInfo] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsEndpoint, setWsEndpoint] = useState('ws://localhost:9944');

  // Initialize API connection
  useEffect(() => {
    let unsubscribe = null;
    let apiInstance = null;

    async function connect() {
      try {
        setLoading(true);
        setError(null);

        const provider = new WsProvider(wsEndpoint);
        apiInstance = await ApiPromise.create({ provider });
        setApi(apiInstance);

        // Get chain info
        const [chain, nodeName, nodeVersion] = await Promise.all([
          apiInstance.rpc.system.chain(),
          apiInstance.rpc.system.name(),
          apiInstance.rpc.system.version()
        ]);

        setChainInfo({
          chain: chain.toString(),
          nodeName: nodeName.toString(),
          nodeVersion: nodeVersion.toString()
        });

        // Subscribe to new blocks
        unsubscribe = await apiInstance.rpc.chain.subscribeNewHeads(async (header) => {
          const blockNumber = header.number.toNumber();
          const blockHash = header.hash.toString();
          
          // Get block details
          const signedBlock = await apiInstance.rpc.chain.getBlock(blockHash);
          const extrinsics = signedBlock.block.extrinsics.length;
          
          setBlocks(prev => {
            const newBlock = {
              number: blockNumber,
              hash: blockHash,
              extrinsics,
              timestamp: new Date().toLocaleTimeString()
            };
            return [newBlock, ...prev].slice(0, 20); // Keep last 20 blocks
          });
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

  // Connect wallet
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

  // Get account balance
  const [balance, setBalance] = useState(null);
  useEffect(() => {
    if (!api || !selectedAccount) return;

    let unsubscribe = null;
    (async () => {
      try {
        const accountId = selectedAccount.address;
        const { data: accountData } = await api.query.system.account(accountId);
        setBalance(accountData.free.toHuman());
        
        unsubscribe = await api.query.system.account(accountId, (accountData) => {
          setBalance(accountData.free.toHuman());
        });
      } catch (err) {
        console.error('Balance fetch error:', err);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [api, selectedAccount]);

  // Get chain stats
  const [stats, setStats] = useState({
    blockNumber: 0,
    finalizedBlock: 0,
    totalIssuance: '0'
  });

  useEffect(() => {
    if (!api) return;

    let unsubscribe = null;
    (async () => {
      try {
        const [header, finalizedHeader, totalIssuance] = await Promise.all([
          api.rpc.chain.getHeader(),
          api.rpc.chain.getFinalizedHead().then(h => api.rpc.chain.getHeader(h)),
          api.query.balances.totalIssuance()
        ]);

        setStats({
          blockNumber: header.number.toNumber(),
          finalizedBlock: finalizedHeader.number.toNumber(),
          totalIssuance: totalIssuance.toHuman()
        });

        unsubscribe = await api.rpc.chain.subscribeNewHeads((header) => {
          setStats(prev => ({
            ...prev,
            blockNumber: header.number.toNumber()
          }));
        });
      } catch (err) {
        console.error('Stats error:', err);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [api]);

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <div className="logo">🔗 MyL1 Blockchain Explorer</div>
          <div>
            {selectedAccount ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span>{selectedAccount.meta.name || 'Account'}</span>
                {balance && <span>{balance} MYL1</span>}
                <button 
                  className="wallet-button connected"
                  onClick={() => setSelectedAccount(null)}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button className="wallet-button" onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container">
        {error && <div className="error">{error}</div>}

        {chainInfo && (
          <div style={{ margin: '20px 0', padding: '15px', background: 'white', borderRadius: '10px' }}>
            <strong>Chain:</strong> {chainInfo.chain} | 
            <strong> Node:</strong> {chainInfo.nodeName} | 
            <strong> Version:</strong> {chainInfo.nodeVersion}
            <div style={{ marginTop: '10px' }}>
              <label>RPC Endpoint: </label>
              <input 
                type="text" 
                value={wsEndpoint}
                onChange={(e) => setWsEndpoint(e.target.value)}
                style={{ padding: '5px', width: '300px', marginLeft: '10px' }}
                placeholder="ws://localhost:9944"
              />
            </div>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Current Block</div>
            <div className="stat-value">{stats.blockNumber.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Finalized Block</div>
            <div className="stat-value">{stats.finalizedBlock.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Issuance</div>
            <div className="stat-value">{stats.totalIssuance}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Connected Accounts</div>
            <div className="stat-value">{accounts.length}</div>
          </div>
        </div>

        <div className="blocks-table">
          <div className="table-header">Latest Blocks</div>
          {loading ? (
            <div className="loading">Connecting to node...</div>
          ) : blocks.length === 0 ? (
            <div className="loading">Waiting for blocks...</div>
          ) : (
            <>
              <div className="table-row" style={{ fontWeight: 'bold', background: '#f8f9fa' }}>
                <div>Block #</div>
                <div>Hash</div>
                <div>Extrinsics</div>
                <div>Time</div>
              </div>
              {blocks.map((block) => (
                <div key={block.hash} className="table-row">
                  <div>{block.number.toLocaleString()}</div>
                  <div className="hash">{block.hash}</div>
                  <div>{block.extrinsics}</div>
                  <div>{block.timestamp}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

