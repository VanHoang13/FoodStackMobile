import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList, LoyaltyProgram, LoyaltyTransaction, LoyaltyTier } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { LoyaltyService } from '../services/loyaltyService';

type LoyaltyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Loyalty'>;

interface Props {
  navigation: LoyaltyScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const LoyaltyScreen: React.FC<Props> = ({ navigation }) => {
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  const loadLoyaltyData = async () => {
    try {
      const loyaltyData = await LoyaltyService.getLoyaltyProgram();
      setLoyaltyProgram(loyaltyData);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin tích điểm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLoyaltyData();
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
      case 'EARN':
        return 'plus-circle';
      case 'REDEEM':
        return 'minus-circle';
      case 'BONUS':
        return 'gift';
      case 'EXPIRED':
        return 'clock';
      default:
        return 'circle';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'EARN':
      case 'BONUS':
        return '#27AE60';
      case 'REDEEM':
        return '#E74C3C';
      case 'EXPIRED':
        return '#F39C12';
      default:
        return '#666';
    }
  };

  const getProgressPercentage = () => {
    if (!loyaltyProgram || !loyaltyProgram.next_tier) return 100;
    return LoyaltyService.getTierProgress(loyaltyProgram);
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

  if (!loyaltyProgram) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text>Không thể tải thông tin tích điểm</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[loyaltyProgram.current_tier.color, loyaltyProgram.current_tier.color + '80']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tích điểm thành viên</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="more-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Current Tier Card */}
        <LinearGradient
          colors={[loyaltyProgram.current_tier.color, loyaltyProgram.current_tier.color + '80']}
          style={styles.tierCard}
        >
          <View style={styles.tierHeader}>
            <View style={styles.tierIconContainer}>
              <Icon name={loyaltyProgram.current_tier.icon} size={32} color="#fff" />
            </View>
            <View style={styles.tierInfo}>
              <Text style={styles.tierName}>Hạng {loyaltyProgram.current_tier.name}</Text>
              <Text style={styles.tierPoints}>
                {loyaltyProgram.current_points.toLocaleString()} điểm
              </Text>
            </View>
          </View>

          {loyaltyProgram.next_tier && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  Tiến độ lên hạng {loyaltyProgram.next_tier.name}
                </Text>
                <Text style={styles.progressPoints}>
                  {loyaltyProgram.points_to_next_tier} điểm nữa
                </Text>
              </View>
              
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${getProgressPercentage()}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.sectionTitle}>Quyền lợi hiện tại</Text>
          {loyaltyProgram.current_tier.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color="#27AE60" />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* All Tiers */}
        <View style={styles.tiersContainer}>
          <Text style={styles.sectionTitle}>Tất cả hạng thành viên</Text>
          
          {LoyaltyService.getTiers().map((tier, index) => {
            const isCurrentTier = tier.id === loyaltyProgram.current_tier.id;
            const isUnlocked = loyaltyProgram.current_points >= tier.min_points;
            
            return (
              <View 
                key={tier.id} 
                style={[
                  styles.tierItem,
                  isCurrentTier && styles.tierItemCurrent
                ]}
              >
                <View style={styles.tierItemLeft}>
                  <View style={[
                    styles.tierItemIcon,
                    { backgroundColor: isUnlocked ? tier.color : '#ddd' }
                  ]}>
                    <Icon 
                      name={tier.icon} 
                      size={20} 
                      color={isUnlocked ? '#fff' : '#999'} 
                    />
                  </View>
                  
                  <View style={styles.tierItemInfo}>
                    <Text style={[
                      styles.tierItemName,
                      isCurrentTier && styles.tierItemNameCurrent
                    ]}>
                      Hạng {tier.name}
                    </Text>
                    <Text style={styles.tierItemRange}>
                      {tier.min_points.toLocaleString()}
                      {tier.max_points ? ` - ${tier.max_points.toLocaleString()}` : '+'} điểm
                    </Text>
                  </View>
                </View>
                
                {isCurrentTier && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Hiện tại</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Transaction History */}
        <View style={styles.transactionSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử tích điểm</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {loyaltyProgram.transactions.map((transaction) => (
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
                styles.transactionPoints,
                { color: getTransactionColor(transaction.type) }
              ]}>
                {transaction.points > 0 ? '+' : ''}{transaction.points} điểm
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
    paddingHorizontal: 16,
    paddingVertical: 16,
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

  // Tier Card
  tierCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    ...theme.shadows.md,
  },

  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },

  tierIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  tierInfo: {
    flex: 1,
  },

  tierName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },

  tierPoints: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },

  progressSection: {
    marginTop: 8,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },

  progressPoints: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },

  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },

  // Benefits
  benefitsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.sm,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },

  benefitText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },

  // All Tiers
  tiersContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.sm,
  },

  tierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  tierItemCurrent: {
    backgroundColor: '#FFF8F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0,
    marginBottom: 8,
  },

  tierItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  tierItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tierItemInfo: {
    flex: 1,
  },

  tierItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  tierItemNameCurrent: {
    color: '#E8622A',
  },

  tierItemRange: {
    fontSize: 12,
    color: '#666',
  },

  currentBadge: {
    backgroundColor: '#E8622A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
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

  transactionPoints: {
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

export default LoyaltyScreen;