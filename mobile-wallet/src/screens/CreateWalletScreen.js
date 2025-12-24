import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useWallet } from '../context/WalletContext';
import { mnemonicGenerate } from '@polkadot/util-crypto';

export default function CreateWalletScreen({ navigation }) {
  const [mnemonic, setMnemonic] = useState('');
  const [confirmMnemonic, setConfirmMnemonic] = useState('');
  const [step, setStep] = useState(1); // 1: generate, 2: confirm
  const { createWallet, isLoading } = useWallet();

  const generateMnemonic = () => {
    const newMnemonic = mnemonicGenerate(12);
    setMnemonic(newMnemonic);
    setStep(2);
  };

  const handleConfirm = async () => {
    if (mnemonic !== confirmMnemonic) {
      Alert.alert('Error', 'Mnemonic phrases do not match');
      return;
    }

    if (mnemonic.split(' ').length !== 12) {
      Alert.alert('Error', 'Invalid mnemonic phrase');
      return;
    }

    const success = await createWallet(mnemonic, '');
    if (success) {
      Alert.alert('Success', 'Wallet created successfully!', [
        { text: 'OK', onPress: () => navigation.replace('Main') },
      ]);
    } else {
      Alert.alert('Error', 'Failed to create wallet');
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
        <Text style={styles.headerTitle}>Create Wallet</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 ? (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#f093fb', '#4facfe']}
                style={styles.iconGradient}
              >
                <Icon name="security" size={64} color="#ffffff" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Secure Your Wallet</Text>
            <Text style={styles.description}>
              We'll generate a 12-word recovery phrase. Write it down and keep it safe.
              You'll need it to restore your wallet.
            </Text>

            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateMnemonic}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.generateButtonGradient}
              >
                <Icon name="refresh" size={24} color="#ffffff" />
                <Text style={styles.generateButtonText}>Generate Recovery Phrase</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.iconGradient}
              >
                <Icon name="verified" size={64} color="#ffffff" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Write Down Your Recovery Phrase</Text>
            <Text style={styles.description}>
              Write these 12 words in order and keep them safe. Never share them with anyone.
            </Text>

            <View style={styles.mnemonicContainer}>
              {mnemonic.split(' ').map((word, index) => (
                <View key={index} style={styles.mnemonicWord}>
                  <LinearGradient
                    colors={['#f3f4f6', '#e5e7eb']}
                    style={styles.mnemonicWordGradient}
                  >
                    <Text style={styles.mnemonicNumber}>{index + 1}</Text>
                    <Text style={styles.mnemonicText}>{word}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>

            <Text style={styles.confirmTitle}>Confirm Your Recovery Phrase</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.mnemonicInput}
                multiline
                numberOfLines={3}
                placeholder="Enter your 12-word recovery phrase"
                placeholderTextColor="#9ca3af"
                value={confirmMnemonic}
                onChangeText={setConfirmMnemonic}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.confirmButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Icon name="check-circle" size={24} color="#ffffff" />
                    <Text style={styles.confirmButtonText}>Confirm & Create Wallet</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
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
    justifyContent: 'space-between',
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
    padding: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    width: '100%',
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  mnemonicContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  mnemonicWord: {
    width: '48%',
    marginBottom: 12,
  },
  mnemonicWordGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  mnemonicNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
    fontWeight: 'bold',
    minWidth: 20,
  },
  mnemonicText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  mnemonicInput: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
