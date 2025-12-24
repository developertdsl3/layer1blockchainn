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

export default function ImportWalletScreen({ navigation }) {
  const [mnemonic, setMnemonic] = useState('');
  const { importWallet, isLoading } = useWallet();

  const handleImport = async () => {
    const words = mnemonic.trim().split(/\s+/);
    
    if (words.length !== 12) {
      Alert.alert('Error', 'Please enter a valid 12-word recovery phrase');
      return;
    }

    const success = await importWallet(mnemonic.trim(), '');
    if (success) {
      Alert.alert('Success', 'Wallet imported successfully!', [
        { text: 'OK', onPress: () => navigation.replace('Main') },
      ]);
    } else {
      Alert.alert('Error', 'Failed to import wallet. Please check your recovery phrase.');
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
        <Text style={styles.headerTitle}>Import Wallet</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContainer}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.iconGradient}
            >
              <Icon name="lock-reset" size={64} color="#ffffff" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Enter Recovery Phrase</Text>
          <Text style={styles.description}>
            Enter your 12-word recovery phrase to restore your wallet.
            Make sure you're in a private place.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.mnemonicInput}
              multiline
              numberOfLines={4}
              placeholder="Enter your 12-word recovery phrase"
              placeholderTextColor="#9ca3af"
              value={mnemonic}
              onChangeText={setMnemonic}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={false}
            />
          </View>

          <TouchableOpacity
            style={styles.importButton}
            onPress={handleImport}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.importButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Icon name="download" size={24} color="#ffffff" />
                  <Text style={styles.importButtonText}>Import Wallet</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
    minHeight: 140,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  importButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  importButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  importButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
