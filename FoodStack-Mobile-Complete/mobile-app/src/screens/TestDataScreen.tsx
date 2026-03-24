import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { WalletService } from '../services/walletService';
import { LoyaltyService } from '../services/loyaltyService';

type TestDataScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TestData'>;

interface Props {
  navigation: TestDataScreenNavigationProp;
}

const TestDataScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const resetWallet = async () => {
    try {
      setLoading(true);
      await WalletService.resetWallet();
      Alert.alert('Thành công', 'Đã reset ví về trạng thái ban đầu (500,000đ)');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể reset ví');
    } finally {
      setLoading(false);
    }
  };

  const resetLoyalty = async () => {
    try {
      setLoading(true);
      await LoyaltyService.resetLoyaltyProgram();
      Alert.alert('Thành công', 'Đã reset chương trình tích điểm về trạng thái ban đầu (1,250 điểm - Hạng Bạc)');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể reset chương trình tích điểm');
    } finally {
      setLoading(false);
    }
  };

  const addTestMoney = async () => {
    try {
      setLoading(true);
      await WalletService.addAmount(1000000, 'Test: Nạp 1,000,000đ');
      Alert.alert('Thành công', 'Đã nạp 1,000,000đ vào ví');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể nạp tiền');
    } finally {
      setLoading(false);
    }
  };

  const addTestPoints = async () => {
    try {
      setLoading(true);
      const result = await LoyaltyService.addPoints(
        2000, 
        'test-order-' + Date.now(), 
        2000000, 
        'Test: Thêm 2,000 điểm'
      );
      
      let message = 'Đã thêm 2,000 điểm tích lũy';
      if (result.tierUpgraded && result.newTier) {
        message += `\n🎉 Chúc mừng lên hạng ${result.newTier.name}!`;
      }
      
      Alert.alert('Thành công', message);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm điểm');
    } finally {
      setLoading(false);
    }
  };

  const resetAllData = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn reset tất cả dữ liệu về trạng thái ban đầu?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await Promise.all([
                WalletService.resetWallet(),
                LoyaltyService.resetLoyaltyProgram()
              ]);
              Alert.alert('Thành công', 'Đã reset tất cả dữ liệu về trạng thái ban đầu');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể reset dữ liệu');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const testActions = [
    {
      title: 'Reset Ví',
      description: 'Đặt lại số dư ví về 500,000đ',
      icon: 'wallet',
      color: '#E8622A',
      onPress: resetWallet
    },
    {
      title: 'Reset Tích Điểm',
      description: 'Đặt lại về 1,250 điểm (Hạng Bạc)',
      icon: 'award',
      color: '#9B59B6',
      onPress: resetLoyalty
    },
    {
      title: 'Nạp 1,000,000đ',
      description: 'Thêm tiền vào ví để test',
      icon: 'plus-circle',
      color: '#27AE60',
      onPress: addTestMoney
    },
    {
      title: 'Thêm 2,000 Điểm',
      description: 'Thêm điểm để test lên hạng',
      icon: 'star',
      color: '#F39C12',
      onPress: addTestPoints
    },
    {
      title: 'Reset Tất Cả',
      description: 'Đặt lại toàn bộ dữ liệu',
      icon: 'refresh-cw',
      color: '#E74C3C',
      onPress: resetAllData
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="back" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Data</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="info" size={24} color="#3498DB" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Quản lý dữ liệu test</Text>
            <Text style={styles.infoText}>
              Sử dụng các chức năng dưới đây để test ví và tích điểm. 
              Dữ liệu được lưu trong AsyncStorage và sẽ được giữ khi tắt app.
            </Text>
          </View>
        </View>

        {/* Test Actions */}
        <View style={styles.actionsContainer}>
          {testActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
              disabled={loading}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation Shortcuts */}
        <View style={styles.shortcutsContainer}>
          <Text style={styles.shortcutsTitle}>Kiểm tra kết quả</Text>
          
          <TouchableOpacity
            style={styles.shortcutButton}
            onPress={() => navigation.navigate('Wallet')}
          >
            <LinearGradient
              colors={['#E8622A', '#FF7A30']}
              style={styles.shortcutGradient}
            >
              <Icon name="wallet" size={20} color="#fff" />
              <Text style={styles.shortcutText}>Xem Ví</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutButton}
            onPress={() => navigation.navigate('Loyalty')}
          >
            <LinearGradient
              colors={['#9B59B6', '#8E44AD']}
              style={styles.shortcutGradient}
            >
              <Icon name="award" size={20} color="#fff" />
              <Text style={styles.shortcutText}>Xem Tích Điểm</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  headerRight: {
    width: 40,
  },

  content: {
    flex: 1,
    padding: 16,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    ...theme.shadows.sm,
  },

  infoContent: {
    flex: 1,
    marginLeft: 12,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Actions
  actionsContainer: {
    marginBottom: 20,
  },

  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    ...theme.shadows.sm,
  },

  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  actionInfo: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  actionDescription: {
    fontSize: 14,
    color: '#666',
  },

  // Shortcuts
  shortcutsContainer: {
    marginBottom: 20,
  },

  shortcutsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  shortcutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    ...theme.shadows.sm,
  },

  shortcutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },

  shortcutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TestDataScreen;