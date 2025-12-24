import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/keyring';
import './App.css';

function App() {
  const [api, setApi] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wsEndpoint, setWsEndpoint] = useState('ws://localhost:9944');
  
  // Transfer state
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferStatus, setTransferStatus] = useState('');

  // Initialize API
  useEffect(() => {
    let apiInstance = null;

    async function connect() {
      try {
        const provider = new WsProvider(wsEndpoint);
        apiInstance = await ApiPromise.create({ provider });
        setApi(apiInstance);
      } catch (err) {
        console.error('Connection error:', err);
        setError(`Failed to connect: ${err.message}`);
      }
    }

    connect();

    return () => {
      if (apiInstance) {
        apiInstance.disconnect();
      }
    };
  }, [wsEndpoint]);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      const extensions = await web3Enable('MyL1 Wallet');
      if (extensions.length === 0) {
        alert('Please install Polkadot.js extension');
        return;
      }

      const allAccounts = await web3Accounts();
      setAccounts(allAccounts);
      
      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Wallet error:', err);
      alert(`Failed: ${err.message}`);
      setLoading(false);
    }
  };

  // Get balance
  useEffect(() => {
    if (!api || !selectedAccount) return;

    let unsubscribe = null;
    (async () => {
      try {
        const accountId = selectedAccount.address;
        unsubscribe = await api.query.system.account(accountId, (accountData) => {
          setBalance({
            free: accountData.free.toHuman(),
            reserved: accountData.reserved.toHuman(),
            total: accountData.data.free.add(accountData.data.reserved).toHuman()
          });
        });
      } catch (err) {
        console.error('Balance error:', err);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [api, selectedAccount]);

  // Send transfer
  const sendTransfer = async () => {
    if (!api || !selectedAccount || !transferTo || !transferAmount) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      setTransferStatus('Preparing transaction...');

      const injector = await web3FromAddress(selectedAccount.address);
      const amount = parseFloat(transferAmount) * 1e18; // Convert to smallest unit

      const transfer = api.tx.balances.transferKeepAlive(transferTo, amount);
      
      setTransferStatus('Signing transaction...');
      const hash = await transfer.signAndSend(selectedAccount.address, { signer: injector.signer });

      setTransferStatus(`Transaction submitted: ${hash.toHex()}`);
      
      await hash;
      setTransferStatus('Transaction confirmed!');
      setTransferTo('');
      setTransferAmount('');
      
      setLoading(false);
    } catch (err) {
      console.error('Transfer error:', err);
      setTransferStatus(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>💰 MyL1 Wallet</h1>
        <div>
          {selectedAccount ? (
            <div className="account-info">
              <span>{selectedAccount.meta.name || 'Account'}</span>
              <button onClick={() => setSelectedAccount(null)}>Disconnect</button>
            </div>
          ) : (
            <button className="connect-btn" onClick={connectWallet} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      <div className="container">
        {error && <div className="error">{error}</div>}

        <div className="endpoint-config">
          <label>RPC Endpoint: </label>
          <input 
            type="text" 
            value={wsEndpoint}
            onChange={(e) => setWsEndpoint(e.target.value)}
            placeholder="ws://localhost:9944"
          />
        </div>

        {selectedAccount && (
          <>
            <div className="account-section">
              <h2>Account Details</h2>
              <div className="account-card">
                <div className="account-field">
                  <label>Address:</label>
                  <div className="address">{selectedAccount.address}</div>
                </div>
                {balance && (
                  <>
                    <div className="account-field">
                      <label>Free Balance:</label>
                      <div className="balance">{balance.free} MYL1</div>
                    </div>
                    <div className="account-field">
                      <label>Reserved:</label>
                      <div>{balance.reserved} MYL1</div>
                    </div>
                    <div className="account-field">
                      <label>Total:</label>
                      <div className="total-balance">{balance.total} MYL1</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {accounts.length > 1 && (
              <div className="account-selector">
                <label>Switch Account:</label>
                <select 
                  value={selectedAccount.address}
                  onChange={(e) => {
                    const acc = accounts.find(a => a.address === e.target.value);
                    setSelectedAccount(acc);
                  }}
                >
                  {accounts.map(acc => (
                    <option key={acc.address} value={acc.address}>
                      {acc.meta.name || acc.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="transfer-section">
              <h2>Send MYL1</h2>
              <div className="transfer-form">
                <div className="form-group">
                  <label>To Address:</label>
                  <input 
                    type="text" 
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                  />
                </div>
                <div className="form-group">
                  <label>Amount (MYL1):</label>
                  <input 
                    type="number" 
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.000000000000000001"
                  />
                </div>
                <button 
                  className="send-btn" 
                  onClick={sendTransfer}
                  disabled={loading || !transferTo || !transferAmount}
                >
                  {loading ? 'Processing...' : 'Send Transfer'}
                </button>
                {transferStatus && (
                  <div className={`status ${transferStatus.includes('Error') ? 'error' : 'success'}`}>
                    {transferStatus}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {!selectedAccount && (
          <div className="welcome">
            <h2>Welcome to MyL1 Wallet</h2>
            <p>Connect your Polkadot.js wallet to get started</p>
            <p>Make sure you have the Polkadot.js extension installed</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

