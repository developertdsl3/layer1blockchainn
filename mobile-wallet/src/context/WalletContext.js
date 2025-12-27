import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApi } from './ApiContext';
import { formatBalance } from '@polkadot/util';
import { Keyring } from '@polkadot/keyring';
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { api, isConnected, getBalance, accounts: apiAccounts } = useApi();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [balance, setBalance] = useState({
    free: '0',
    reserved: '0',
    total: '0',
    usd: '0',
  });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadWallet();
  }, [apiAccounts]);

  useEffect(() => {
    if (selectedAccount && api && isConnected) {
      loadBalance();
      loadTransactions();
    }
  }, [selectedAccount?.address, api, isConnected]);

  const loadWallet = async () => {
    try {
      // Load saved wallet data
      const walletData = await AsyncStorage.getItem('wallet');
      let savedAccounts = [];
      let savedSelectedAccount = null;

      if (walletData) {
        const parsed = JSON.parse(walletData);
        savedAccounts = parsed.accounts || [];
        savedSelectedAccount = parsed.selectedAccount;

        // Recreate keypairs from stored data
        if (savedAccounts.length > 0) {
          await cryptoWaitReady();
          const keyring = new Keyring({ type: 'sr25519' });

          savedAccounts = savedAccounts.map(account => {
            try {
              if (account.keypair) {
                // Keypair is already stored directly (new format)
                return account;
              } else if (account.mnemonic) {
                // Recreate from mnemonic (new format without derivation)
                const pair = keyring.addFromUri(account.mnemonic, { name: account.name });
                return {
                  ...account,
                  keypair: pair, // Store unlocked keypair
                };
              } else if (account.pair) {
                // Legacy: Recreate pair from encrypted JSON (old format)
                const pair = keyring.addFromJson(account.pair);
                try {
                  pair.unlock('');
                } catch (unlockError) {
                  console.warn('Could not unlock legacy keypair:', unlockError.message);
                }
                return {
                  ...account,
                  keypair: pair,
                };
              }
              return account;
            } catch (error) {
              console.error('Error recreating keypair:', error);
              return account;
            }
          });
        }
      }

      // Use API accounts if available, otherwise use saved accounts
      const activeAccounts = apiAccounts.length > 0 ? apiAccounts.map(acc => ({
        address: acc.address,
        name: acc.meta.name || `Account ${acc.address.slice(-8)}`,
        publicKey: acc.publicKey,
      })) : savedAccounts;

      if (activeAccounts.length > 0) {
        const selected = savedSelectedAccount || activeAccounts[0];
        setSelectedAccount(selected);
        setAccounts(activeAccounts);
      } else {
        // No accounts available
        setSelectedAccount(null);
        setAccounts([]);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      setSelectedAccount(null);
      setAccounts([]);
    }
  };

  const loadBalance = async () => {
    if (!selectedAccount || !api || !isConnected) return;

    try {
      // Use direct API call for better performance
      const accountInfo = await api.query.system.account(selectedAccount.address);
      const freeBalance = accountInfo.data.free.toBigInt();
      const reservedBalance = accountInfo.data.reserved.toBigInt();

      // Convert to readable format (18 decimals for MyL1)
      const freeFormatted = (freeBalance / BigInt(10 ** 18)).toString();
      const reservedFormatted = (reservedBalance / BigInt(10 ** 18)).toString();
      const totalFormatted = ((freeBalance + reservedBalance) / BigInt(10 ** 18)).toString();

      setBalance({
        free: freeFormatted,
        reserved: reservedFormatted,
        total: totalFormatted,
        usd: '0', // Would need price API for this
      });
    } catch (error) {
      console.error('Error loading balance:', error);
      setBalance({
        free: '0',
        reserved: '0',
        total: '0',
        usd: '0',
      });
    }
  };

  const loadTransactions = async () => {
    if (!selectedAccount) {
      console.log('No selected account, skipping transaction load');
      return;
    }

    try {
      console.log('Loading transactions for account:', selectedAccount.address);
      // Load recent transactions from local storage
      const savedTxns = await AsyncStorage.getItem(`transactions_${selectedAccount.address}`);
      console.log('Raw saved transactions:', savedTxns);

      if (savedTxns) {
        const parsedTxns = JSON.parse(savedTxns);
        console.log('Parsed transactions:', parsedTxns.length, 'transactions');
        setTransactions(parsedTxns);
      } else {
        console.log('No saved transactions found');
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const createWallet = async (providedMnemonic, password) => {
    try {
      setIsLoading(true);

      // Wait for crypto to be ready
      await cryptoWaitReady();

      // Generate mnemonic if not provided
      const mnemonic = providedMnemonic || mnemonicGenerate(12);

      // Create keyring
      const keyring = new Keyring({ type: 'sr25519' });

      // Add account from mnemonic (derive first account)
      const pair = keyring.addFromUri(mnemonic, { name: 'Main Account' });

      // Store the keypair in unlocked state for easier use
      const newAccount = {
        address: pair.address,
        name: 'Main Account',
        publicKey: u8aToHex(pair.publicKey),
        mnemonic: mnemonic,
        keypair: pair, // Store unlocked keypair directly
      };

      const walletData = {
        accounts: [newAccount],
        selectedAccount: newAccount,
        mnemonic: mnemonic,
      };

      await AsyncStorage.setItem('wallet', JSON.stringify(walletData));
      setAccounts([newAccount]);
      setSelectedAccount(newAccount);
      setIsLoading(false);
      return { success: true, mnemonic: mnemonic, address: pair.address };
    } catch (error) {
      console.error('Error creating wallet:', error);
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  const importWallet = async (mnemonic, password) => {
    return createWallet(mnemonic, password);
  };

  const unlockAccount = async (account, password) => {
    try {
      if (!account.pair) {
        throw new Error('No encrypted keypair found');
      }

      await cryptoWaitReady();
      const keyring = new Keyring({ type: 'sr25519' });
      const pair = keyring.addFromJson(account.pair);

      // Unlock the pair
      pair.unlock(password);

      return pair;
    } catch (error) {
      console.error('Error unlocking account:', error);
      throw error;
    }
  };

  const copyMnemonic = async (account) => {
    try {
      if (!account.mnemonic) {
        throw new Error('No mnemonic available');
      }
      // In a real app, you'd use Clipboard.setString here
      // For now, we'll just return the mnemonic
      return account.mnemonic;
    } catch (error) {
      console.error('Error copying mnemonic:', error);
      throw error;
    }
  };

  const sendTransaction = async (to, amount, callback) => {
    if (!selectedAccount || !api || !isConnected) {
      if (callback) callback({ success: false, error: 'Not connected to blockchain' });
      return;
    }

    if (!selectedAccount.keypair) {
      if (callback) callback({ success: false, error: 'No keypair available for signing' });
      return;
    }

    try {
      setIsLoading(true);

      // Convert amount to proper format (using 18 decimals as per MyL1)
      const amountInUnits = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, 18)));

      // Create transfer transaction (use transferAllowDeath for the deployed blockchain)
      const transfer = api.tx.balances.transferAllowDeath(to, amountInUnits);

      console.log('Sending transaction from:', selectedAccount.address, 'to:', to, 'amount:', amount, 'MYL1 (', amountInUnits.toString(), 'units)');

      // Validate sufficient balance
      const currentBalance = BigInt(Math.floor(parseFloat(balance.free) * Math.pow(10, 18)));
      console.log('Current balance:', currentBalance.toString(), 'units, Required:', amountInUnits.toString(), 'units');

      if (currentBalance < amountInUnits) {
        setIsLoading(false);
        if (callback) callback({ success: false, error: 'Insufficient balance. You have ' + balance.free + ' MYL1 but trying to send ' + amount + ' MYL1' });
        return;
      }

      try {
        console.log('Starting transaction process...');

        // Get nonce (like faucet does)
        console.log('Getting nonce for account:', selectedAccount.address);
        const nonce = await api.rpc.system.accountNextIndex(selectedAccount.address);
        console.log('Got nonce:', nonce.toString());

        // Sign transaction async (like faucet does)
        console.log('Signing transaction...');
        const signedTx = await transfer.signAsync(selectedAccount.keypair, { nonce });
        console.log('Transaction signed successfully');

        // Send the signed transaction
        console.log('Sending transaction...');
        const hash = await signedTx.send();
        console.log('Transaction sent! Hash:', hash.toString());

        // Create transaction record
        const newTx = {
          id: Date.now().toString(),
          type: 'sent',
          amount: amount.toString(),
          to: to,
          hash: hash.toString(),
          timestamp: Date.now(),
          status: 'completed',
        };

        console.log('Transaction record created:', newTx);

        // Update transactions state
        setTransactions(prevTxns => {
          const updatedTxns = [newTx, ...prevTxns];
          console.log('Updated transactions array:', updatedTxns.length, 'items');

          // Save to local storage
          AsyncStorage.setItem(`transactions_${selectedAccount.address}`, JSON.stringify(updatedTxns))
            .then(() => console.log('Transactions saved to storage'))
            .catch(err => console.error('Failed to save transactions:', err));

          return updatedTxns;
        });

        setIsLoading(false);
        if (callback) callback({ success: true, hash: hash.toString(), tx: newTx });

      } catch (error) {
        console.error('Transaction error:', error);
        setIsLoading(false);
        if (callback) callback({ success: false, error: 'Transaction failed: ' + error.message });
      }

    } catch (error) {
      console.error('Error sending transaction:', error);
      setIsLoading(false);
      if (callback) callback({ success: false, error: error.message });
    }
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
        unlockAccount,
        copyMnemonic,
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
