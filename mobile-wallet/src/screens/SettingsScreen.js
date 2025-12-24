import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useWallet } from '../context/WalletContext';
import { useApi } from '../context/ApiContext';

export default function SettingsScreen({ navigation }) {
  const { selectedAccount, logout } = useWallet();
  const { isConnected } = useApi();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to import your wallet again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          },
        },
      ]
    );
  };

  const handleExportWallet = () => {
    Alert.alert(
      'Export Wallet',
      'This will show your recovery phrase. Make sure you are in a private place.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            Alert.alert('Export', 'Wallet export functionality requires secure keychain access.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Settings</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          {selectedAccount && (
            <View style={styles.accountCard}>
              <LinearGradient
                colors={['#f093fb', '#4facfe']}
                style={styles.accountGradient}
              >
                <View style={styles.accountIcon}>
                  <Icon name="account-circle" size={32} color="#ffffff" />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{selectedAccount.name}</Text>
                  <Text style={styles.accountAddress} numberOfLines={1}>
                    {selectedAccount.address}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleExportWallet}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#dbeafe' }]}>
                <Icon name="download" size={24} color="#667eea" />
              </View>
              <Text style={styles.settingTitle}>Export Wallet</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#d1fae5' }]}>
                <Icon name="fingerprint" size={24} color="#10b981" />
              </View>
              <Text style={styles.settingTitle}>Biometric Authentication</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#d1d5db', true: '#10b981' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#fee2e2' }]}>
                <Icon name="lock" size={24} color="#ef4444" />
              </View>
              <Text style={styles.settingTitle}>Change Password</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </View>
        </View>

        {/* Network Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#dbeafe' }]}>
                <Icon name="cloud" size={24} color="#667eea" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Connection Status</Text>
                <Text style={styles.settingSubtitle}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            </View>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? '#10b981' : '#ef4444' },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#fef3c7' }]}>
                <Icon name="notifications" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.settingTitle}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#d1d5db', true: '#f59e0b' }}
              thumbColor="#ffffff"
            />
          </View>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#e0e7ff' }]}>
                <Icon name="language" size={24} color="#6366f1" />
              </View>
              <Text style={styles.settingTitle}>Language</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>English</Text>
              <Icon name="chevron-right" size={24} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#e0e7ff' }]}>
                <Icon name="info" size={24} color="#6366f1" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Version</Text>
                <Text style={styles.settingSubtitle}>1.0.0</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#dbeafe' }]}>
                <Icon name="help" size={24} color="#667eea" />
              </View>
              <Text style={styles.settingTitle}>Help & Support</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#fee2e2', '#fecaca']}
            style={styles.logoutGradient}
          >
            <Icon name="logout" size={24} color="#ef4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  accountCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  accountGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  accountIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  accountAddress: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  statusIndicator: {
    marginLeft: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginLeft: 8,
  },
});
