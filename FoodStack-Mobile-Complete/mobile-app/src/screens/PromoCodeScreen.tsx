import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
  Clipboard,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type PromoCodeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PromoCode'>;

interface Props {
  navigation: PromoCodeScreenNavigationProp;
}

interface PromoCode {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'freeShipping';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  isUsed: boolean;
  category: 'general' | 'newUser' | 'loyalty' | 'seasonal';
  restaurantId?: string;
  restaurantName?: string;
}

const PromoCodeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'used' | 'expired'>('available');

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      // Mock promo codes data
      const mockPromoCodes: PromoCode[] = [
        {
          id: '1',
          code: 'WELCOME20',
          title: 'Chào mừng thành viên mới',
          description: 'Giảm 20% cho đơn hàng đầu tiên',
          discountType: 'percentage',
          discountValue: 20,
          minOrderValue: 100000,
          maxDiscount: 50000,
          expiryDate: '2024-04-30T23:59:59Z',
          usageLimit: 1,
          usedCount: 0,
          isActive: true,
          isUsed: false,
          category: 'newUser'
        },
        {
          id: '2',
          code: 'SAVE50K',
          title: 'Giảm 50K cho đơn từ 200K',
          description: 'Áp dụng cho tất cả món ăn',
          discountType: 'fixed',
          discountValue: 50000,
          minOrderValue: 200000,
          expiryDate: '2024-04-15T23:59:59Z',
          usedCount: 0,
          isActive: true,
          isUsed: false,
          category: 'general'
        },
        {
          id: '3',
          code: 'LOYALTY15',
          title: 'Ưu đãi thành viên thân thiết',
          description: 'Giảm 15% cho thành viên Silver trở lên',
          discountType: 'percentage',
          discountValue: 15,
          minOrderValue: 150000,
          maxDiscount: 100000,
          expiryDate: '2024-05-31T23:59:59Z',
          usedCount: 0,
          isActive: true,
          isUsed: false,
          category: 'loyalty'
        },
        {
          id: '4',
          code: 'SPRING2024',
          title: 'Khuyến mãi mùa xuân',
          description: 'Giảm 25% cho tất cả món ăn',
          discountType: 'percentage',
          discountValue: 25,
          minOrderValue: 120000,
          maxDiscount: 80000,
          expiryDate: '2024-03-20T23:59:59Z',
          usedCount: 1,
          isActive: false,
          isUsed: true,
          category: 'seasonal'
        },
        {
          id: '5',
          code: 'FREESHIP',
          title: 'Miễn phí giao hàng',
          description: 'Miễn phí phí dịch vụ cho đơn từ 100K',
          discountType: 'freeShipping',
          discountValue: 0,
          minOrderValue: 100000,
          expiryDate: '2024-04-25T23:59:59Z',
          usedCount: 0,
          isActive: true,
          isUsed: false,
          category: 'general'
        },
        {
          id: '6',
          code: 'RESTAURANT10',
          title: 'Ưu đãi nhà hàng ABC',
          description: 'Giảm 10% tại nhà hàng ABC',
          discountType: 'percentage',
          discountValue: 10,
          minOrderValue: 80000,
          expiryDate: '2024-04-20T23:59:59Z',
          usedCount: 0,
          isActive: true,
          isUsed: false,
          category: 'general',
          restaurantId: 'restaurant-abc',
          restaurantName: 'Nhà hàng ABC'
        }
      ];

      setPromoCodes(mockPromoCodes);
    } catch (error) {
      console.error('Error loading promo codes:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPromoCodes();
    setRefreshing(false);
  };

  const applyPromoCode = async (code: string) => {
    const promoCode = promoCodes.find(p => p.code === code && p.isActive && !p.isUsed);
    
    if (!promoCode) {
      Alert.alert('Mã không hợp lệ', 'Mã giảm giá không tồn tại hoặc đã hết hạn');
      return;
    }

    if (new Date(promoCode.expiryDate) < new Date()) {
      Alert.alert('Mã hết hạn', 'Mã giảm giá này đã hết hạn sử dụng');
      return;
    }

    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      Alert.alert('Mã đã sử dụng', 'Bạn đã sử dụng hết lượt áp dụng mã này');
      return;
    }

    Alert.alert(
      'Áp dụng mã thành công',
      `Mã "${code}" đã được áp dụng. Bạn sẽ được giảm ${
        promoCode.discountType === 'percentage' 
          ? `${promoCode.discountValue}%` 
          : promoCode.discountType === 'fixed'
          ? `${promoCode.discountValue.toLocaleString()}đ`
          : 'phí dịch vụ'
      }`,
      [
        { text: 'OK', onPress: () => setInputCode('') }
      ]
    );
  };

  const copyToClipboard = (code: string) => {
    Clipboard.setString(code);
    Alert.alert('Đã sao chép', `Mã "${code}" đã được sao chép vào clipboard`);
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: '#3498DB',
      newUser: '#27AE60',
      loyalty: '#9B59B6',
      seasonal: '#E67E22'
    };
    return colors[category as keyof typeof colors] || '#95A5A6';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      general: 'Tổng quát',
      newUser: 'Thành viên mới',
      loyalty: 'Thành viên thân thiết',
      seasonal: 'Theo mùa'
    };
    return labels[category as keyof typeof labels] || 'Khác';
  };

  const getDiscountText = (promoCode: PromoCode) => {
    switch (promoCode.discountType) {
      case 'percentage':
        return `Giảm ${promoCode.discountValue}%`;
      case 'fixed':
        return `Giảm ${promoCode.discountValue.toLocaleString()}đ`;
      case 'freeShipping':
        return 'Miễn phí dịch vụ';
      default:
        return 'Giảm giá';
    }
  };

  const filteredPromoCodes = promoCodes.filter(promo => {
    switch (filter) {
      case 'available':
        return promo.isActive && !promo.isUsed && !isExpired(promo.expiryDate);
      case 'used':
        return promo.isUsed;
      case 'expired':
        return isExpired(promo.expiryDate);
      default:
        return true;
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#FF7A30', '#E8622A']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Mã giảm giá</Text>
              <Text style={styles.headerSubtitle}>Tiết kiệm cho đơn hàng</Text>
            </View>
            <TouchableOpacity style={styles.helpButton}>
              <Icon name="help-circle" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Nhập mã giảm giá</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập mã giảm giá..."
              value={inputCode}
              onChangeText={setInputCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => applyPromoCode(inputCode)}
              disabled={!inputCode.trim()}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'available', label: 'Có thể dùng', count: promoCodes.filter(p => p.isActive && !p.isUsed && !isExpired(p.expiryDate)).length },
              { key: 'all', label: 'Tất cả', count: promoCodes.length },
              { key: 'used', label: 'Đã dùng', count: promoCodes.filter(p => p.isUsed).length },
              { key: 'expired', label: 'Hết hạn', count: promoCodes.filter(p => isExpired(p.expiryDate)).length },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  filter === tab.key && styles.filterTabActive,
                ]}
                onPress={() => setFilter(tab.key as any)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filter === tab.key && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Promo Codes List */}
        <View style={styles.promoCodesContainer}>
          {filteredPromoCodes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="tag" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>Không có mã giảm giá</Text>
              <Text style={styles.emptyMessage}>
                {filter === 'available' 
                  ? 'Hiện tại không có mã giảm giá khả dụng'
                  : 'Không có mã giảm giá trong danh mục này'
                }
              </Text>
            </View>
          ) : (
            filteredPromoCodes.map((promoCode) => (
              <View key={promoCode.id} style={[
                styles.promoCard,
                (!promoCode.isActive || promoCode.isUsed || isExpired(promoCode.expiryDate)) && styles.promoCardDisabled
              ]}>
                <View style={styles.promoHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(promoCode.category) }]}>
                    <Text style={styles.categoryText}>{getCategoryLabel(promoCode.category)}</Text>
                  </View>
                  {promoCode.isUsed && (
                    <View style={styles.usedBadge}>
                      <Text style={styles.usedText}>Đã dùng</Text>
                    </View>
                  )}
                  {isExpired(promoCode.expiryDate) && (
                    <View style={styles.expiredBadge}>
                      <Text style={styles.expiredText}>Hết hạn</Text>
                    </View>
                  )}
                </View>

                <View style={styles.promoContent}>
                  <View style={styles.promoLeft}>
                    <View style={styles.discountContainer}>
                      <Icon name="percent" size={24} color="#FF7A30" />
                      <Text style={styles.discountText}>{getDiscountText(promoCode)}</Text>
                    </View>
                  </View>

                  <View style={styles.promoRight}>
                    <Text style={styles.promoTitle}>{promoCode.title}</Text>
                    <Text style={styles.promoDescription}>{promoCode.description}</Text>
                    
                    {promoCode.restaurantName && (
                      <Text style={styles.restaurantName}>📍 {promoCode.restaurantName}</Text>
                    )}

                    <View style={styles.promoDetails}>
                      {promoCode.minOrderValue && (
                        <Text style={styles.promoDetail}>
                          Đơn tối thiểu: {promoCode.minOrderValue.toLocaleString()}đ
                        </Text>
                      )}
                      {promoCode.maxDiscount && (
                        <Text style={styles.promoDetail}>
                          Giảm tối đa: {promoCode.maxDiscount.toLocaleString()}đ
                        </Text>
                      )}
                      <Text style={styles.promoExpiry}>
                        Hết hạn: {formatExpiryDate(promoCode.expiryDate)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.promoFooter}>
                  <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Mã:</Text>
                    <Text style={styles.codeText}>{promoCode.code}</Text>
                  </View>
                  <View style={styles.promoActions}>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => copyToClipboard(promoCode.code)}
                    >
                      <Icon name="copy" size={16} color="#666" />
                      <Text style={styles.copyButtonText}>Sao chép</Text>
                    </TouchableOpacity>
                    {promoCode.isActive && !promoCode.isUsed && !isExpired(promoCode.expiryDate) && (
                      <TouchableOpacity
                        style={styles.useButton}
                        onPress={() => applyPromoCode(promoCode.code)}
                      >
                        <Text style={styles.useButtonText}>Sử dụng</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Mẹo sử dụng mã giảm giá</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Mã giảm giá chỉ áp dụng một lần cho mỗi đơn hàng</Text>
            <Text style={styles.tipItem}>• Kiểm tra điều kiện tối thiểu của đơn hàng</Text>
            <Text style={styles.tipItem}>• Một số mã chỉ áp dụng cho nhà hàng cụ thể</Text>
            <Text style={styles.tipItem}>• Mã có thể hết hạn hoặc hết lượt sử dụng</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header
  header: {
    marginBottom: 16,
  },

  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Input Section
  inputSection: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  applyButton: {
    backgroundColor: '#FF7A30',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },

  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Filter
  filterContainer: {
    marginBottom: 20,
  },

  filterTab: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  filterTabActive: {
    backgroundColor: '#FF7A30',
    borderColor: '#FF7A30',
  },

  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  filterTabTextActive: {
    color: '#fff',
  },

  // Promo Codes
  promoCodesContainer: {
    marginBottom: 20,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },

  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  promoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  promoCardDisabled: {
    opacity: 0.6,
  },

  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  usedBadge: {
    backgroundColor: '#95A5A6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  usedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  expiredBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  expiredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  promoContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  promoLeft: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  discountContainer: {
    alignItems: 'center',
  },

  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF7A30',
    marginTop: 4,
    textAlign: 'center',
  },

  promoRight: {
    flex: 1,
  },

  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },

  promoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },

  restaurantName: {
    fontSize: 12,
    color: '#9B59B6',
    marginBottom: 8,
  },

  promoDetails: {
    marginTop: 4,
  },

  promoDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },

  promoExpiry: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '500',
  },

  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },

  codeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF7A30',
    fontFamily: 'monospace',
  },

  promoActions: {
    flexDirection: 'row',
    gap: 8,
  },

  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 4,
  },

  copyButtonText: {
    fontSize: 12,
    color: '#666',
  },

  useButton: {
    backgroundColor: '#FF7A30',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },

  useButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Tips
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  tipsList: {
    gap: 8,
  },

  tipItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default PromoCodeScreen;