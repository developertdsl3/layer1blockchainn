import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useWallet } from '../context/WalletContext';

export default function TransactionHistoryScreen({ navigation }) {
  const { transactions } = useWallet();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity style={styles.transactionCard} activeOpacity={0.7}>
      <View
        style={[
          styles.transactionIcon,
          {
            backgroundColor: item.type === 'sent' ? '#fee2e2' : '#d1fae5',
          },
        ]}
      >
        <Icon
          name={item.type === 'sent' ? 'arrow-upward' : 'arrow-downward'}
          size={24}
          color={item.type === 'sent' ? '#ef4444' : '#10b981'}
        />
      </View>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionType}>
          {item.type === 'sent' ? 'Sent' : 'Received'}
        </Text>
        <Text style={styles.transactionAddress} numberOfLines={1}>
          {item.type === 'sent'
            ? `To: ${item.to.substring(0, 12)}...`
            : `From: ${item.from.substring(0, 12)}...`}
        </Text>
        <Text style={styles.transactionHash} numberOfLines={1}>
          {item.hash}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.transactionAmountText,
            { color: item.type === 'sent' ? '#ef4444' : '#10b981' },
          ]}
        >
          {item.type === 'sent' ? '-' : '+'}
          {item.amount} MYL1
        </Text>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.status === 'completed' ? '#10b981' : '#f59e0b' },
            ]}
          />
          <Text style={styles.transactionStatus}>{item.status}</Text>
        </View>
        <Text style={styles.transactionDate}>{formatDate(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#f3f4f6', '#e5e7eb']}
        style={styles.emptyIconContainer}
      >
        <Icon name="history" size={64} color="#9ca3af" />
      </LinearGradient>
      <Text style={styles.emptyText}>No transactions yet</Text>
      <Text style={styles.emptySubtext}>
        Your transaction history will appear here
      </Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>Transaction History</Text>
      </LinearGradient>

      <FlatList
        data={transactions || []}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={
          !transactions || transactions.length === 0
            ? styles.emptyList
            : styles.list
        }
        showsVerticalScrollIndicator={false}
      />
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
  list: {
    padding: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  transactionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionContent: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  transactionAddress: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  transactionHash: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  transactionStatus: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
});
