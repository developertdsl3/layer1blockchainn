import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useWallet } from '../context/WalletContext';

export default function ReceiveScreen({ navigation }) {
  const { selectedAccount } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (selectedAccount) {
      try {
        await Clipboard.setString(selectedAccount.address);
        setCopied(true);
        Alert.alert('Copied!', 'Address copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        Alert.alert('Error', 'Failed to copy address');
      }
    }
  };

  const shareAddress = async () => {
    if (selectedAccount) {
      try {
        await Share.share({
          message: `My MyL1 Wallet Address:\n${selectedAccount.address}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  if (!selectedAccount) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="error-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyText}>No account selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receive MYL1</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* QR Code Card */}
        <View style={styles.qrContainer}>
          <LinearGradient
            colors={['#ffffff', '#f9fafb']}
            style={styles.qrCard}
          >
            <View style={styles.qrInner}>
              <QRCode
                value={selectedAccount.address}
                size={280}
                backgroundColor="transparent"
                color="#1f2937"
              />
            </View>
            <View style={styles.qrDecorations}>
              <View style={[styles.qrCorner, styles.qrCornerTopLeft]} />
              <View style={[styles.qrCorner, styles.qrCornerTopRight]} />
              <View style={[styles.qrCorner, styles.qrCornerBottomLeft]} />
              <View style={[styles.qrCorner, styles.qrCornerBottomRight]} />
            </View>
          </LinearGradient>
        </View>

        {/* Address Card */}
        <View style={styles.addressCard}>
          <Text style={styles.label}>Your Wallet Address</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText} numberOfLines={1}>
              {selectedAccount.address}
            </Text>
            <TouchableOpacity onPress={copyAddress} style={styles.copyButton}>
              <Icon
                name={copied ? 'check-circle' : 'content-copy'}
                size={20}
                color={copied ? '#10b981' : '#667eea'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, copied && styles.actionButtonActive]}
            onPress={copyAddress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={copied ? ['#10b981', '#059669'] : ['#667eea', '#764ba2']}
              style={styles.actionButtonGradient}
            >
              <Icon
                name={copied ? 'check-circle' : 'content-copy'}
                size={24}
                color="#ffffff"
              />
              <Text style={styles.actionButtonText}>
                {copied ? 'Copied!' : 'Copy Address'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={shareAddress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.actionButtonGradient}
            >
              <Icon name="share" size={24} color="#ffffff" />
              <Text style={styles.actionButtonText}>Share</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Icon name="info" size={24} color="#667eea" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Receiving MYL1</Text>
            <Text style={styles.infoText}>
              Share this address to receive MYL1 tokens. Make sure the sender is using the MyL1 network.
            </Text>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrCard: {
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
  },
  qrInner: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
  },
  qrDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  qrCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#667eea',
    borderWidth: 4,
  },
  qrCornerTopLeft: {
    top: 24,
    left: 24,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  qrCornerTopRight: {
    top: 24,
    right: 24,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  qrCornerBottomLeft: {
    bottom: 24,
    left: 24,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  qrCornerBottomRight: {
    bottom: 24,
    right: 24,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  copyButton: {
    marginLeft: 12,
    padding: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonActive: {
    shadowColor: '#10b981',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
