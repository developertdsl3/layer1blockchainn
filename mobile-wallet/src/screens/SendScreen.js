import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useWallet } from '../context/WalletContext';

export default function SendScreen({ navigation }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const { sendTransaction, balance, isLoading } = useWallet();

  const handleSend = async () => {
    if (!recipient || !amount) {
      Alert.alert('Error', 'Please enter recipient address and amount');
      return;
    }

    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} MYL1 to ${recipient.substring(0, 10)}...${recipient.substring(recipient.length - 8)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await sendTransaction(recipient, amount, (result) => {
                if (result.success) {
                  Alert.alert('Success', `Transaction sent! Hash: ${result.hash}`, [
                    { text: 'OK', onPress: () => navigation.goBack() },
                  ]);
                  setRecipient('');
                  setAmount('');
                  setMemo('');
                }
              });
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to send transaction');
            }
          },
        },
      ]
    );
  };

  const setMaxAmount = () => {
    if (balance && balance.free) {
      setAmount(balance.free.replace(/,/g, ''));
    }
  };

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
        <Text style={styles.headerTitle}>Send MYL1</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={['#f093fb', '#4facfe']}
              style={styles.balanceGradient}
            >
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                {balance?.free || '0.00'} MYL1
              </Text>
            </LinearGradient>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Recipient Address</Text>
              <View style={styles.inputContainer}>
                <Icon name="person" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter recipient address"
                  placeholderTextColor="#9ca3af"
                  value={recipient}
                  onChangeText={setRecipient}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.amountHeader}>
                <Text style={styles.label}>Amount (MYL1)</Text>
                <TouchableOpacity onPress={setMaxAmount}>
                  <View style={styles.maxButton}>
                    <Text style={styles.maxButtonText}>MAX</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Icon name="attach-money" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Memo (Optional)</Text>
              <View style={styles.inputContainer}>
                <Icon name="note" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.memoInput]}
                  placeholder="Add a note"
                  placeholderTextColor="#9ca3af"
                  value={memo}
                  onChangeText={setMemo}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.feeInfo}>
              <Icon name="info" size={18} color="#667eea" />
              <Text style={styles.feeText}>Network fee will be deducted automatically</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.sendButtonGradient}
            >
              {isLoading ? (
                <Text style={styles.sendButtonText}>Processing...</Text>
              ) : (
                <>
                  <Icon name="send" size={24} color="#ffffff" />
                  <Text style={styles.sendButtonText}>Send Transaction</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maxButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 16,
  },
  memoInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  feeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  feeText: {
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sendButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
