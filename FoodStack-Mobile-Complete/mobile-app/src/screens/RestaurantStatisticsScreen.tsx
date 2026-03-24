import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import apiClient from '../services/api';
import AuthService from '../services/authService';

type RestaurantStatisticsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RestaurantStatistics'>;

interface Props {
  navigation: RestaurantStatisticsScreenNavigationProp;
}

interface StatisticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  revenueByDay: Array<{
    day: string;
    revenue: number;
  }>;
  ordersByStatus: {
    completed: number;
    cancelled: number;
    pending: number;
  };
}

const { width } = Dimensions.get('window');

const RestaurantStatisticsScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<StatisticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingItems: [],
    revenueByDay: [],
    ordersByStatus: { completed: 0, cancelled: 0, pending: 0 },
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadStatistics();
  }, [selectedPeriod]);

  const getDateRange = () => {
    const now = new Date();
    const to = now.toISOString();
    let from: string;

    if (selectedPeriod === 'today') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      from = start.toISOString();
    } else if (selectedPeriod === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      from = start.toISOString();
    } else {
      const start = new Date(now);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      from = start.toISOString();
    }
    return { from, to };
  };

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const { from, to } = getDateRange();

      // Fetch restaurant statistics from real API
      const statsRes = await apiClient.get<{ success: boolean; data: any }>(
        `/restaurants/me/statistics`,
        { params: { from, to } }
      );

      const statsData = statsRes.data.data || {};

      // Build revenueByDay for week period
      let revenueByDay: Array<{ day: string; revenue: number }> = [];
      if (selectedPeriod === 'week' && statsData.revenueByDay) {
        const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        revenueByDay = statsData.revenueByDay.map((item: any) => ({
          day: item.day || dayLabels[new Date(item.date).getDay()] || '',
          revenue: item.revenue || 0,
        }));
      }

      // Fetch top selling items from analytics endpoint
      let topSellingItems: Array<{ name: string; quantity: number; revenue: number }> = [];
      try {
        const userData = await AuthService.getUserData();
        const restaurantId = userData?.restaurantId;
        if (restaurantId) {
          const menuRes = await apiClient.get<{ success: boolean; data: any }>(
            `/analytics/menu/${restaurantId}`,
            { params: { startDate: from, endDate: to } }
          );
          const menuData = menuRes.data.data || {};
          if (Array.isArray(menuData.topSellingItems)) {
            topSellingItems = menuData.topSellingItems.slice(0, 5).map((item: any) => ({
              name: item.itemName || item.name || 'Unknown',
              quantity: item.totalQuantity || item.quantity || 0,
              revenue: item.revenue || 0,
            }));
          }
        }
      } catch (menuErr) {
        console.warn('Could not load top selling items:', menuErr);
      }

      setStatistics({
        totalRevenue: statsData.todayRevenue ?? statsData.weeklyRevenue ?? statsData.monthlyRevenue ?? 0,
        totalOrders: statsData.todayOrders ?? statsData.weeklyOrders ?? statsData.monthlyOrders ?? 0,
        averageOrderValue: statsData.avgOrderValue ?? 0,
        topSellingItems,
        revenueByDay,
        ordersByStatus: {
          completed: statsData.completedOrders ?? 0,
          cancelled: statsData.cancelledOrders ?? 0,
          pending: statsData.pendingOrders ?? 0,
        },
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'today':
        return 'Hôm nay';
      case 'week':
        return 'Tuần này';
      case 'month':
        return 'Tháng này';
      default:
        return 'Hôm nay';
    }
  };

  const renderBarChart = () => {
    const maxRevenue = Math.max(...statistics.revenueByDay.map(d => d.revenue));
    const chartHeight = 120;
    const barWidth = (width - 80) / statistics.revenueByDay.length - 8;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Doanh thu theo ngày</Text>
        <View style={styles.chart}>
          {statistics.revenueByDay.map((data, index) => {
            const barHeight = maxRevenue > 0 ? (data.revenue / maxRevenue) * chartHeight : 0;
            return (
              <View key={index} style={styles.barContainer}>
                <View style={[styles.barBackground, { height: chartHeight }]}>
                  <LinearGradient
                    colors={['#FF7A30', '#E8622A']}
                    style={[styles.bar, { height: barHeight }]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        {[
          { key: 'today', label: 'Hôm nay' },
          { key: 'week', label: 'Tuần này' },
          { key: 'month', label: 'Tháng này' },
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.activePeriodButton,
            ]}
            onPress={() => setSelectedPeriod(period.key as any)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.activePeriodButtonText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7A30" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
        <Animated.View style={[styles.statisticsContainer, { opacity: fadeAnim }]}>
          {/* Overview Cards */}
          <View style={styles.overviewContainer}>
            <Text style={styles.sectionTitle}>Tổng quan {getPeriodText().toLowerCase()}</Text>
            
            <View style={styles.overviewGrid}>
              <View style={[styles.overviewCard, styles.revenueCard]}>
                <Icon name="dollar-sign" size={24} color="#4CAF50" />
                <Text style={styles.overviewNumber}>
                  {formatCurrency(statistics.totalRevenue)}
                </Text>
                <Text style={styles.overviewLabel}>Doanh thu</Text>
              </View>

              <View style={[styles.overviewCard, styles.ordersCard]}>
                <Icon name="shopping-bag" size={24} color="#2196F3" />
                <Text style={styles.overviewNumber}>{statistics.totalOrders}</Text>
                <Text style={styles.overviewLabel}>Đơn hàng</Text>
              </View>

              <View style={[styles.overviewCard, styles.averageCard]}>
                <Icon name="trending-up" size={24} color="#FF9800" />
                <Text style={styles.overviewNumber}>
                  {formatCurrency(statistics.averageOrderValue)}
                </Text>
                <Text style={styles.overviewLabel}>Giá trị TB/đơn</Text>
              </View>
            </View>
          </View>

          {/* Revenue Chart */}
          {selectedPeriod === 'week' && renderBarChart()}

          {/* Order Status */}
          <View style={styles.orderStatusContainer}>
            <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
            <View style={styles.statusGrid}>
              <View style={[styles.statusCard, styles.completedCard]}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.statusNumber}>{statistics.ordersByStatus.completed}</Text>
                <Text style={styles.statusLabel}>Hoàn thành</Text>
              </View>

              <View style={[styles.statusCard, styles.cancelledCard]}>
                <Icon name="x-circle" size={20} color="#F44336" />
                <Text style={styles.statusNumber}>{statistics.ordersByStatus.cancelled}</Text>
                <Text style={styles.statusLabel}>Đã hủy</Text>
              </View>

              <View style={[styles.statusCard, styles.pendingCard]}>
                <Icon name="clock" size={20} color="#FF9800" />
                <Text style={styles.statusNumber}>{statistics.ordersByStatus.pending}</Text>
                <Text style={styles.statusLabel}>Chờ xử lý</Text>
              </View>
            </View>
          </View>

          {/* Top Selling Items */}
          <View style={styles.topItemsContainer}>
            <Text style={styles.sectionTitle}>Món bán chạy nhất</Text>
            {statistics.topSellingItems.map((item, index) => (
              <View key={index} style={styles.topItemCard}>
                <View style={styles.topItemRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.topItemInfo}>
                  <Text style={styles.topItemName}>{item.name}</Text>
                  <Text style={styles.topItemQuantity}>Đã bán: {item.quantity}</Text>
                </View>
                <Text style={styles.topItemRevenue}>
                  {formatCurrency(item.revenue)}
                </Text>
              </View>
            ))}
          </View>

          {/* Success Rate */}
          <View style={styles.successRateContainer}>
            <Text style={styles.sectionTitle}>Tỷ lệ thành công</Text>
            <View style={styles.successRateCard}>
              <View style={styles.successRateInfo}>
                <Text style={styles.successRatePercentage}>
                  {Math.round((statistics.ordersByStatus.completed / statistics.totalOrders) * 100)}%
                </Text>
                <Text style={styles.successRateLabel}>
                  {statistics.ordersByStatus.completed}/{statistics.totalOrders} đơn thành công
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <LinearGradient
                    colors={['#4CAF50', '#45A049']}
                    style={[
                      styles.progressBar,
                      {
                        width: `${(statistics.ordersByStatus.completed / statistics.totalOrders) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

  loadingContainer: {
    flex: 1,
    paddingVertical: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  placeholder: {
    width: 40,
  },

  // Period Selector
  periodContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },

  activePeriodButton: {
    backgroundColor: '#FF7A30',
  },

  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  activePeriodButtonText: {
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
  },

  statisticsContainer: {
    padding: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  // Overview Cards
  overviewContainer: {
    marginBottom: 24,
  },

  overviewGrid: {
    gap: 12,
  },

  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },

  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },

  ordersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },

  averageCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },

  overviewNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },

  overviewLabel: {
    fontSize: 14,
    color: '#666',
  },

  // Chart Styles
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
  },

  barContainer: {
    alignItems: 'center',
    flex: 1,
  },

  barBackground: {
    width: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },

  bar: {
    width: '100%',
    borderRadius: 12,
    minHeight: 4,
  },

  barLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },

  // Order Status
  orderStatusContainer: {
    marginBottom: 24,
  },

  statusGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  statusCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  completedCard: {
    borderTopWidth: 3,
    borderTopColor: '#4CAF50',
  },

  cancelledCard: {
    borderTopWidth: 3,
    borderTopColor: '#F44336',
  },

  pendingCard: {
    borderTopWidth: 3,
    borderTopColor: '#FF9800',
  },

  statusNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },

  statusLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Top Items
  topItemsContainer: {
    marginBottom: 24,
  },

  topItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  topItemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF7A30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  topItemInfo: {
    flex: 1,
  },

  topItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  topItemQuantity: {
    fontSize: 12,
    color: '#666',
  },

  topItemRevenue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF7A30',
  },

  // Success Rate
  successRateContainer: {
    marginBottom: 24,
  },

  successRateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  successRateInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },

  successRatePercentage: {
    fontSize: 32,
    fontWeight: '900',
    color: '#4CAF50',
    marginBottom: 4,
  },

  successRateLabel: {
    fontSize: 14,
    color: '#666',
  },

  progressBarContainer: {
    alignItems: 'center',
  },

  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});

export default RestaurantStatisticsScreen;