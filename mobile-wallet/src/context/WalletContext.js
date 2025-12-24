import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WalletContext = createContext();

// Mock data for UI preview
const MOCK_BALANCE = {
  free: '12,458.75',
  reserved: '0.00',
  total: '12,458.75',
  usd: '18,687.50',
};

const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'sent',
    amount: '250.00',
    to: '5FHneW46xGXgs5mUyUYEh3ZQ36UpbjcEHDWjbZZxSjv9G7H6',
    hash: '0x1234...5678',
    timestamp: Date.now() - 3600000,
    status: 'completed',
  },
  {
    id: '2',
    type: 'received',
    amount: '1,500.00',
    from: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    hash: '0xabcd...efgh',
    timestamp: Date.now() - 86400000,
    status: 'completed',
  },
  {
    id: '3',
    type: 'sent',
    amount: '50.00',
    to: '5FHneW46xGXgs5mUyUYEh3ZQ36UpbjcEHDWjbZZxSjv9G7H6',
    hash: '0x9876...5432',
    timestamp: Date.now() - 172800000,
    status: 'completed',
  },
];

export const WalletProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [balance, setBalance] = useState(MOCK_BALANCE);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const walletData = await AsyncStorage.getItem('wallet');
      if (walletData) {
        const parsed = JSON.parse(walletData);
        setAccounts(parsed.accounts || []);
        if (parsed.selectedAccount) {
          setSelectedAccount(parsed.selectedAccount);
        } else {
          // Create mock account if none exists
          const mockAccount = {
            address: '5FHneW46xGXgs5mUyUYEh3ZQ36UpbjcEHDWjbZZxSjv9G7H6',
            name: 'Main Account',
            publicKey: '0x1234567890abcdef',
          };
          setSelectedAccount(mockAccount);
          setAccounts([mockAccount]);
        }
      } else {
        // Create mock account for UI preview
        const mockAccount = {
          address: '5FHneW46xGXgs5mUyUYEh3ZQ36UpbjcEHDWjbZZxSjv9G7H6',
          name: 'Main Account',
          publicKey: '0x1234567890abcdef',
        };
        setSelectedAccount(mockAccount);
        setAccounts([mockAccount]);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      // Create mock account on error
      const mockAccount = {
        address: '5FHneW46xGXgs5mUyUYEh3ZQ36UpbjcEHDWjbZZxSjv9G7H6',
        name: 'Main Account',
        publicKey: '0x1234567890abcdef',
      };
      setSelectedAccount(mockAccount);
      setAccounts([mockAccount]);
    }
  };

  const createWallet = async (mnemonic, password) => {
    try {
      setIsLoading(true);
      
      // Mock wallet creation
      const newAccount = {
        address: '5FHneW46xGXgs5mUyUYEh3ZQ36UpbjcEHDWjbZZxSjv9G7H6',
        name: 'Main Account',
        publicKey: '0x1234567890abcdef',
      };

      const walletData = {
        accounts: [newAccount],
        selectedAccount: newAccount,
      };

      await AsyncStorage.setItem('wallet', JSON.stringify(walletData));
      setAccounts([newAccount]);
      setSelectedAccount(newAccount);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error creating wallet:', error);
      setIsLoading(false);
      return false;
    }
  };

  const importWallet = async (mnemonic, password) => {
    return createWallet(mnemonic, password);
  };

  const sendTransaction = async (to, amount, callback) => {
    // Mock transaction - just simulate success
    setIsLoading(true);
    setTimeout(() => {
      const newTx = {
        id: Date.now().toString(),
        type: 'sent',
        amount: amount.toString(),
        to: to,
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        timestamp: Date.now(),
        status: 'completed',
      };
      setTransactions([newTx, ...transactions]);
      setIsLoading(false);
      if (callback) callback({ success: true, hash: newTx.hash });
    }, 2000);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('wallet');
    setAccounts([]);
    setSelectedAccount(null);
    setBalance(null);
    setTransactions([]);
  };

  return (
    <WalletContext.Provider
      value={{
        accounts,
        selectedAccount,
        balance,
        transactions,
        isLoading,
        createWallet,
        importWallet,
        sendTransaction,
        logout,
        setSelectedAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
