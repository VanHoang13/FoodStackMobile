import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList, Wallet, WalletTransaction } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { WalletService } from '../services/walletService';

type WalletScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Wallet'>;

interface Props {
  navigation: WalletScreenNavigationProp;
}

const WalletScreen: React.FC<Props> = ({ navigation }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const walletData = await WalletService.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Error loading wallet:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin ví. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.abs(price)) + 'đ';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays <= 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return 'plus-circle';
      case 'DEBIT':
        return 'minus-circle';
      default:
        return 'circle';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return '#27AE60';
      case 'DEBIT':
        return '#E74C3C';
      default:
        return '#666';
    }
  };

  const handleTopUp = async () => {
    Alert.alert(
      'Nạp tiền',
      'Nhập số tiền muốn nạp:',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: '100,000đ',
          onPress: async () => {
            try {
              const updatedWallet = await WalletService.addAmount(100000, 'Nạp tiền vào ví');
              setWallet(updatedWallet);
              Alert.alert('Thành công', 'Đã nạp 100,000đ vào ví');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể nạp tiền. Vui lòng thử lại.');
            }
          }
        },
        {
          text: '500,000đ',
          onPress: async () => {
            try {
              const updatedWallet = await WalletService.addAmount(500000, 'Nạp tiền vào ví');
              setWallet(updatedWallet);
              Alert.alert('Thành công', 'Đã nạp 500,000đ vào ví');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể nạp tiền. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  const handleWithdraw = () => {
    Alert.alert(
      'Rút tiền',
      'Chức năng rút tiền sẽ được tích hợp với ngân hàng',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!wallet) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text>Không thể tải thông tin ví</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ví FoodStack</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="more-vertical" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <LinearGradient
          colors={['#E8622A', '#FF7A30']}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Icon name="wallet" size={24} color="#fff" />
            <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
          </View>
          
          <Text style={styles.balanceAmount}>{formatPrice(wallet.balance)}</Text>
          
          <View style={styles.balanceActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTopUp}>
              <Icon name="plus" size={16} color="#E8622A" />
              <Text style={styles.actionButtonText}>Nạp tiền</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleWithdraw}>
              <Icon name="minus" size={16} color="#E8622A" />
              <Text style={styles.actionButtonText}>Rút tiền</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Icon name="credit-card" size={20} color="#E8622A" />
            </View>
            <Text style={styles.quickActionText}>Liên kết thẻ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Icon name="smartphone" size={20} color="#E8622A" />
            </View>
            <Text style={styles.quickActionText}>QR Pay</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Icon name="gift" size={20} color="#E8622A" />
            </View>
            <Text style={styles.quickActionText}>Khuyến mãi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Icon name="settings" size={20} color="#E8622A" />
            </View>
            <Text style={styles.quickActionText}>Cài đặt</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {wallet.transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: getTransactionColor(transaction.type) + '20' }
                ]}>
                  <Icon 
                    name={getTransactionIcon(transaction.type)} 
                    size={16} 
                    color={getTransactionColor(transaction.type)} 
                  />
                </View>
                
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.created_at)}
                  </Text>
                </View>
              </View>
              
              <Text style={[
                styles.transactionAmount,
                { color: getTransactionColor(transaction.type) }
              ]}>
                {transaction.type === 'CREDIT' ? '+' : '-'}{formatPrice(transaction.amount)}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#E8622A',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    padding: 16,
  },

  // Balance Card
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    ...theme.shadows.md,
  },

  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },

  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },

  balanceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 20,
  },

  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8622A',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.sm,
  },

  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },

  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  // Transaction Section
  transactionSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  seeAllText: {
    fontSize: 14,
    color: '#E8622A',
    fontWeight: '600',
  },

  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  transactionInfo: {
    flex: 1,
  },

  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  transactionDate: {
    fontSize: 12,
    color: '#666',
  },

  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WalletScreen;