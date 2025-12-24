/**
 * MyL1 Mobile Wallet
 * Modern React Native wallet for MyL1 Blockchain
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import CreateWalletScreen from './src/screens/CreateWalletScreen';
import ImportWalletScreen from './src/screens/ImportWalletScreen';
import HomeScreen from './src/screens/HomeScreen';
import SendScreen from './src/screens/SendScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen';

// Context
import { WalletProvider } from './src/context/WalletContext';
import { ApiProvider } from './src/context/ApiContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Send') {
            iconName = 'send';
          } else if (route.name === 'Receive') {
            iconName = 'qr-code';
          } else if (route.name === 'History') {
            iconName = 'history';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'MyL1 Wallet' }}
      />
      <Tab.Screen 
        name="Send" 
        component={SendScreen}
        options={{ title: 'Send MYL1' }}
      />
      <Tab.Screen 
        name="Receive" 
        component={ReceiveScreen}
        options={{ title: 'Receive' }}
      />
      <Tab.Screen 
        name="History" 
        component={TransactionHistoryScreen}
        options={{ title: 'Transactions' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isWalletCreated, setIsWalletCreated] = useState(null);

  useEffect(() => {
    checkWalletExists();
  }, []);

  const checkWalletExists = async () => {
    try {
      const walletData = await AsyncStorage.getItem('wallet');
      setIsWalletCreated(!!walletData);
    } catch (error) {
      console.error('Error checking wallet:', error);
      setIsWalletCreated(false);
    }
  };

  if (isWalletCreated === null) {
    return null; // Loading state
  }

  return (
    <ApiProvider>
      <WalletProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            {!isWalletCreated ? (
              <>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
                <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
              </>
            ) : (
              <Stack.Screen name="Main" component={MainTabs} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </WalletProvider>
    </ApiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});

