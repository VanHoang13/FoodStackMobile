import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type SubscriptionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Subscription'>;

interface Props {
  navigation: SubscriptionScreenNavigationProp;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  limits: {
    maxBranches: number;
    maxTables: number;
    maxMenuItems: number;
    maxStaff: number;
  };
  popular?: boolean;
}

interface CurrentSubscription {
  id: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  autoRenew: boolean;
  usage: {
    branches: number;
    tables: number;
    menuItems: number;
    staff: number;
  };
}

const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Load current subscription and available plans
      const [subscriptionResponse, plansResponse] = await Promise.all([
        fetch('/api/v1/subscriptions/restaurant/current', {
          headers: {
            'Authorization': `Bearer ${/* get token */}`,
          },
        }),
        fetch('/api/v1/subscriptions/plans'),
      ]);

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        setCurrentSubscription(subscriptionData.data);
      }

      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setAvailablePlans(plansData.data);
      }
    } catch (error) {
      console.error('Load subscription data error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      Alert.alert(
        'Xác nhận nâng cấp',
        'Bạn có chắc chắn muốn nâng cấp gói dịch vụ?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xác nhận',
            onPress: async () => {
              setLoading(true);
              
              const response = await fetch('/api/v1/subscriptions/upgrade', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${/* get token */}`,
                },
                body: JSON.stringify({
                  planId,
                  billingCycle: 'MONTHLY',
                }),
              });

              if (response.ok) {
                Alert.alert('Thành công', 'Nâng cấp gói dịch vụ thành công');
                loadSubscriptionData();
              } else {
                Alert.alert('Lỗi', 'Không thể nâng cấp gói dịch vụ');
              }
              
              setLoading(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Upgrade subscription error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi nâng cấp');
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      Alert.alert(
        'Xác nhận hủy',
        'Bạn có chắc chắn muốn hủy gói dịch vụ? Điều này sẽ ảnh hưởng đến hoạt động của nhà hàng.',
        [
          { text: 'Không', style: 'cancel' },
          {
            text: 'Hủy gói',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              
              const response = await fetch(`/api/v1/subscriptions/${currentSubscription?.id}/cancel`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${/* get token */}`,
                },
                body: JSON.stringify({
                  reason: 'User requested cancellation',
                }),
              });

              if (response.ok) {
                Alert.alert('Thành công', 'Đã hủy gói dịch vụ');
                loadSubscriptionData();
              } else {
                Alert.alert('Lỗi', 'Không thể hủy gói dịch vụ');
              }
              
              setLoading(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Cancel subscription error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi hủy gói dịch vụ');
      setLoading(false);
    }
  };

  const renderCurrentSubscription = () => {
    if (!currentSubscription) {
      return (
        <View style={styles.noSubscriptionCard}>
          <Icon name="alert-circle" size={48} color={theme.colors.warning} />
          <Text style={styles.noSubscriptionTitle}>Chưa có gói dịch vụ</Text>
          <Text style={styles.noSubscriptionText}>
            Bạn cần đăng ký gói dịch vụ để sử dụng đầy đủ tính năng
          </Text>
        </View>
      );
    }

    const { plan, status, expiresAt, usage } = currentSubscription;
    const expiryDate = new Date(expiresAt);
    const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
      <View style={styles.currentSubscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <View>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>
              {plan.price.toLocaleString('vi-VN')}đ/{plan.billingCycle === 'MONTHLY' ? 'tháng' : 'năm'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusText}>{getStatusText(status)}</Text>
          </View>
        </View>

        <View style={styles.expiryInfo}>
          <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.expiryText}>
            {daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Đã hết hạn'}
          </Text>
        </View>

        <View style={styles.usageSection}>
          <Text style={styles.usageTitle}>Sử dụng hiện tại</Text>
          <View style={styles.usageGrid}>
            <UsageItem
              label="Chi nhánh"
              current={usage.branches}
              limit={plan.limits.maxBranches}
              icon="home"
            />
            <UsageItem
              label="Bàn"
              current={usage.tables}
              limit={plan.limits.maxTables}
              icon="grid"
            />
            <UsageItem
              label="Món ăn"
              current={usage.menuItems}
              limit={plan.limits.maxMenuItems}
              icon="utensils"
            />
            <UsageItem
              label="Nhân viên"
              current={usage.staff}
              limit={plan.limits.maxStaff}
              icon="users"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelSubscription}
        >
          <Text style={styles.cancelButtonText}>Hủy gói dịch vụ</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isCurrentPlan = currentSubscription?.plan.id === plan.id;
    
    return (
      <View key={plan.id} style={[styles.planCard, plan.popular && styles.popularPlan]}>
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Phổ biến</Text>
          </View>
        )}
        
        <Text style={styles.planCardName}>{plan.name}</Text>
        <Text style={styles.planCardDescription}>{plan.description}</Text>
        
        <View style={styles.priceSection}>
          <Text style={styles.price}>
            {plan.price.toLocaleString('vi-VN')}đ
          </Text>
          <Text style={styles.billingCycle}>
            /{plan.billingCycle === 'MONTHLY' ? 'tháng' : 'năm'}
          </Text>
        </View>

        <View style={styles.featuresSection}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon name="check" size={16} color={theme.colors.success} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.limitsSection}>
          <Text style={styles.limitsTitle}>Giới hạn:</Text>
          <Text style={styles.limitText}>• {plan.limits.maxBranches} chi nhánh</Text>
          <Text style={styles.limitText}>• {plan.limits.maxTables} bàn</Text>
          <Text style={styles.limitText}>• {plan.limits.maxMenuItems} món ăn</Text>
          <Text style={styles.limitText}>• {plan.limits.maxStaff} nhân viên</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.selectButton,
            isCurrentPlan && styles.currentPlanButton,
          ]}
          onPress={() => isCurrentPlan ? null : handleUpgrade(plan.id)}
          disabled={isCurrentPlan}
        >
          <Text style={[
            styles.selectButtonText,
            isCurrentPlan && styles.currentPlanButtonText,
          ]}>
            {isCurrentPlan ? 'Gói hiện tại' : 'Chọn gói này'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return theme.colors.success;
      case 'TRIAL': return theme.colors.warning;
      case 'EXPIRED': return theme.colors.error;
      case 'CANCELLED': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Đang hoạt động';
      case 'TRIAL': return 'Dùng thử';
      case 'EXPIRED': return 'Hết hạn';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gói dịch vụ</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gói hiện tại</Text>
          {renderCurrentSubscription()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Các gói dịch vụ</Text>
          {availablePlans.map(renderPlanCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const UsageItem: React.FC<{
  label: string;
  current: number;
  limit: number;
  icon: string;
}> = ({ label, current, limit, icon }) => {
  const percentage = (current / limit) * 100;
  
  return (
    <View style={styles.usageItem}>
      <View style={styles.usageHeader}>
        <Icon name={icon} size={16} color={theme.colors.textSecondary} />
        <Text style={styles.usageLabel}>{label}</Text>
      </View>
      <Text style={styles.usageNumbers}>
        {current}/{limit}
      </Text>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: percentage > 90 ? theme.colors.error : theme.colors.primary
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  noSubscriptionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  noSubscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noSubscriptionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  currentSubscriptionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    ...theme.shadows.medium,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  planPrice: {
    fontSize: 16,
    color: theme.colors.primary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  expiryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  usageSection: {
    marginBottom: 20,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  usageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  usageItem: {
    width: '48%',
    marginBottom: 16,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  usageLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  usageNumbers: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.medium,
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  planCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  planCardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  billingCycle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  featuresSection: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
  },
  limitsSection: {
    marginBottom: 20,
  },
  limitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  limitText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  selectButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  currentPlanButton: {
    backgroundColor: theme.colors.border,
  },
  currentPlanButtonText: {
    color: theme.colors.textSecondary,
  },
});

export default SubscriptionScreen;