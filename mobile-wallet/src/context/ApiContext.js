import React, { createContext, useState, useContext, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [api, setApi] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);

  // Live MyL1 blockchain endpoints
  const WS_ENDPOINT = 'ws://13.211.114.206:9944';
  const HTTP_ENDPOINT = 'http://13.211.114.206:9933';

  useEffect(() => {
    // Delay connection to ensure polyfills are loaded
    const timer = setTimeout(() => {
      connectToBlockchain();
      loadAccounts();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (api) {
        api.disconnect();
      }
    };
  }, []);

  const connectToBlockchain = async () => {
    try {
      setError(null);
      console.log('Connecting to MyL1 blockchain:', WS_ENDPOINT);

      const provider = new WsProvider(WS_ENDPOINT);
      const apiInstance = await ApiPromise.create({ provider });

      // Wait for the API to be ready
      await apiInstance.isReady;

      setApi(apiInstance);
      setIsConnected(true);

      console.log('Connected to MyL1 blockchain successfully!');
      console.log('Chain:', apiInstance.runtimeChain.toString());
      console.log('Node name:', apiInstance.runtimeVersion.specName.toString());

    } catch (err) {
      console.error('Failed to connect to MyL1 blockchain:', err);
      setError(err.message);
      setIsConnected(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const extensions = await web3Enable('MyL1 Mobile Wallet');
      if (extensions.length === 0) {
        console.log('No wallet extensions found');
        return;
      }

      const allAccounts = await web3Accounts();
      setAccounts(allAccounts);
      console.log('Loaded accounts:', allAccounts.length);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  const sendTransaction = async (from, to, amount) => {
    if (!api || !isConnected) {
      throw new Error('Not connected to blockchain');
    }

    try {
      // This is a simplified transaction sending
      // In a real app, you'd use the wallet extension to sign
      const transfer = api.tx.balances.transfer(to, amount);
      const hash = await transfer.signAndSend(from);

      return hash;
    } catch (err) {
      console.error('Transaction failed:', err);
      throw err;
    }
  };

  const getBalance = async (address) => {
    if (!api || !isConnected) {
      throw new Error('Not connected to blockchain');
    }

    try {
      const { data: { free } } = await api.query.system.account(address);
      return free.toString();
    } catch (err) {
      console.error('Failed to get balance:', err);
      throw err;
    }
  };

  const getChainInfo = async () => {
    if (!api || !isConnected) {
      return null;
    }

    try {
      const chain = await api.rpc.system.chain();
      const header = await api.rpc.chain.getHeader();
      const health = await api.rpc.system.health();

      return {
        chain: chain.toString(),
        blockNumber: header.number.toNumber(),
        peers: health.peers.toNumber(),
        isSyncing: health.isSyncing.toPrimitive(),
      };
    } catch (err) {
      console.error('Failed to get chain info:', err);
      return null;
    }
  };

  return (
    <ApiContext.Provider
      value={{
        api,
        isConnected,
        error,
        accounts,
        sendTransaction,
        getBalance,
        getChainInfo,
        reconnect: connectToBlockchain,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
};
