import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type StaffAnalyticsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffAnalytics'>;

interface Props {
  navigation: StaffAnalyticsScreenNavigationProp;
}

interface AnalyticsData {
  performance: {
    ordersProcessed: number;
    averageProcessingTime: number;
    customerSatisfaction: number;
    efficiency: number;
  };
  trends: {
    dailyOrders: { date: string; count: number }[];
    hourlyDistribution: { hour: number; orders: number }[];
    categoryPerformance: { category: string; orders: number; revenue: number }[];
  };
  comparisons: {
    lastWeek: number;
    lastMonth: number;
    teamAverage: number;
    ranking: number;
  };
  goals: {
    ordersTarget: number;
    ordersActual: number;
    timeTarget: number;
    timeActual: number;
    satisfactionTarget: number;
    satisfactionActual: number;
  };
}

const { width } = Dimensions.get('window');

const StaffAnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH'>('WEEK');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock analytics data
      const mockData: AnalyticsData = {
        performance: {
          ordersProcessed: 156,
          averageProcessingTime: 8.5,
          customerSatisfaction: 4.7,
          efficiency: 92,
        },
        trends: {
          dailyOrders: [
            { date: '2024-01-15', count: 22 },
            { date: '2024-01-16', count: 28 },
            { date: '2024-01-17', count: 31 },
            { date: '2024-01-18', count: 25 },
            { date: '2024-01-19', count: 35 },
            { date: '2024-01-20', count: 29 },
            { date: '2024-01-21', count: 33 },
          ],
          hourlyDistribution: [
            { hour: 8, orders: 5 },
            { hour: 9, orders: 8 },
            { hour: 10, orders: 12 },
            { hour: 11, orders: 18 },
            { hour: 12, orders: 25 },
            { hour: 13, orders: 22 },
            { hour: 14, orders: 15 },
            { hour: 15, orders: 10 },
            { hour: 16, orders: 8 },
            { hour: 17, orders: 12 },
            { hour: 18, orders: 20 },
            { hour: 19, orders: 18 },
          ],
          categoryPerformance: [
            { category: 'Phở', orders: 45, revenue: 2250000 },
            { category: 'Bún', orders: 32, revenue: 1600000 },
            { category: 'Cơm', orders: 28, revenue: 1260000 },
            { category: 'Đồ uống', orders: 51, revenue: 765000 },
          ],
        },
        comparisons: {
          lastWeek: 12.5,
          lastMonth: 8.3,
          teamAverage: 85,
          ranking: 3,
        },
        goals: {
          ordersTarget: 180,
          ordersActual: 156,
          timeTarget: 10,
          timeActual: 8.5,
          satisfactionTarget: 4.5,
          satisfactionActual: 4.7,
        },
      };
      
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (value: number, target: number, reverse = false) => {
    const percentage = (value / target) * 100;
    if (reverse) {
      if (percentage <= 80) return '#27AE60';
      if (percentage <= 100) return '#F39C12';
      return '#E74C3C';
    } else {
      if (percentage >= 100) return '#27AE60';
      if (percentage >= 80) return '#F39C12';
      return '#E74C3C';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading || !analytics) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải phân tích...</Text>
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
          <Icon name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Phân tích hiệu suất</Text>

        <TouchableOpacity style={styles.headerButton}>
          <Icon name="download" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Period Filter */}
      <View style={styles.periodContainer}>
        {[
          { key: 'TODAY', label: 'Hôm nay' },
          { key: 'WEEK', label: 'Tuần này' },
          { key: 'MONTH', label: 'Tháng này' },
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.key as any)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive,
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Performance Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng quan hiệu suất</Text>
          
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <LinearGradient
                colors={['#3498DB', '#2980B9']}
                style={styles.performanceIcon}
              >
                <Icon name="shopping-bag" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.performanceValue}>{analytics.performance.ordersProcessed}</Text>
              <Text style={styles.performanceLabel}>Đơn hàng xử lý</Text>
              <Text style={[
                styles.performanceChange,
                { color: analytics.comparisons.lastWeek > 0 ? '#27AE60' : '#E74C3C' }
              ]}>
                {analytics.comparisons.lastWeek > 0 ? '+' : ''}{analytics.comparisons.lastWeek}% so với tuần trước
              </Text>
            </View>

            <View style={styles.performanceCard}>
              <LinearGradient
                colors={['#F39C12', '#E67E22']}
                style={styles.performanceIcon}
              >
                <Icon name="clock" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.performanceValue}>{analytics.performance.averageProcessingTime}m</Text>
              <Text style={styles.performanceLabel}>Thời gian trung bình</Text>
              <Text style={[
                styles.performanceChange,
                { color: getPerformanceColor(analytics.performance.averageProcessingTime, 10, true) }
              ]}>
                Mục tiêu: ≤10m
              </Text>
            </View>

            <View style={styles.performanceCard}>
              <LinearGradient
                colors={['#27AE60', '#229954']}
                style={styles.performanceIcon}
              >
                <Icon name="star" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.performanceValue}>{analytics.performance.customerSatisfaction}/5</Text>
              <Text style={styles.performanceLabel}>Đánh giá khách hàng</Text>
              <Text style={[
                styles.performanceChange,
                { color: getPerformanceColor(analytics.performance.customerSatisfaction, 4.5) }
              ]}>
                Mục tiêu: ≥4.5/5
              </Text>
            </View>

            <View style={styles.performanceCard}>
              <LinearGradient
                colors={['#9B59B6', '#8E44AD']}
                style={styles.performanceIcon}
              >
                <Icon name="trending-up" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.performanceValue}>{analytics.performance.efficiency}%</Text>
              <Text style={styles.performanceLabel}>Hiệu suất</Text>
              <Text style={[
                styles.performanceChange,
                { color: getPerformanceColor(analytics.performance.efficiency, 90) }
              ]}>
                Xếp hạng: #{analytics.comparisons.ranking} trong team
              </Text>
            </View>
          </View>
        </View>

        {/* Goals Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiến độ mục tiêu</Text>
          
          <View style={styles.goalsContainer}>
            <View style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>Đơn hàng</Text>
                <Text style={styles.goalProgress}>
                  {analytics.goals.ordersActual}/{analytics.goals.ordersTarget}
                </Text>
              </View>
              <View style={styles.goalBar}>
                <View style={[
                  styles.goalProgress,
                  { 
                    width: `${Math.min((analytics.goals.ordersActual / analytics.goals.ordersTarget) * 100, 100)}%`,
                    backgroundColor: getPerformanceColor(analytics.goals.ordersActual, analytics.goals.ordersTarget)
                  }
                ]} />
              </View>
            </View>

            <View style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>Thời gian xử lý</Text>
                <Text style={styles.goalProgress}>
                  {analytics.goals.timeActual}m / ≤{analytics.goals.timeTarget}m
                </Text>
              </View>
              <View style={styles.goalBar}>
                <View style={[
                  styles.goalProgress,
                  { 
                    width: `${Math.min((analytics.goals.timeTarget / analytics.goals.timeActual) * 100, 100)}%`,
                    backgroundColor: getPerformanceColor(analytics.goals.timeActual, analytics.goals.timeTarget, true)
                  }
                ]} />
              </View>
            </View>

            <View style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>Đánh giá khách hàng</Text>
                <Text style={styles.goalProgress}>
                  {analytics.goals.satisfactionActual}/5 / ≥{analytics.goals.satisfactionTarget}/5
                </Text>
              </View>
              <View style={styles.goalBar}>
                <View style={[
                  styles.goalProgress,
                  { 
                    width: `${Math.min((analytics.goals.satisfactionActual / 5) * 100, 100)}%`,
                    backgroundColor: getPerformanceColor(analytics.goals.satisfactionActual, analytics.goals.satisfactionTarget)
                  }
                ]} />
              </View>
            </View>
          </View>
        </View>

        {/* Daily Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Xu hướng theo ngày</Text>
          
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Đơn hàng 7 ngày qua</Text>
              <Text style={styles.chartSubtitle}>Trung bình: 29 đơn/ngày</Text>
            </View>
            
            <View style={styles.barChart}>
              {analytics.trends.dailyOrders.map((day, index) => {
                const maxOrders = Math.max(...analytics.trends.dailyOrders.map(d => d.count));
                const height = (day.count / maxOrders) * 100;
                
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View style={[
                        styles.bar,
                        { 
                          height: `${height}%`,
                          backgroundColor: '#E8622A'
                        }
                      ]} />
                    </View>
                    <Text style={styles.barValue}>{day.count}</Text>
                    <Text style={styles.barLabel}>
                      {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Category Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hiệu suất theo danh mục</Text>
          
          <View style={styles.categoryList}>
            {analytics.trends.categoryPerformance.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.category}</Text>
                  <Text style={styles.categoryOrders}>{category.orders} đơn</Text>
                </View>
                <View style={styles.categoryRevenue}>
                  <Text style={styles.revenueAmount}>{formatCurrency(category.revenue)}</Text>
                  <Text style={styles.revenueLabel}>Doanh thu</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('StaffDashboard')}
        >
          <Icon name="home" size={22} color="#aaa" />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('KitchenDisplay')}
        >
          <Icon name="chef-hat" size={22} color="#aaa" />
          <Text style={styles.navText}>Bếp</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('StaffTableManagement')}
        >
          <Icon name="grid" size={22} color="#aaa" />
          <Text style={styles.navText}>Bàn</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ServiceRequests')}
        >
          <Icon name="bell" size={22} color="#aaa" />
          <Text style={styles.navText}>Yêu cầu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('StaffProfile')}
        >
          <Icon name="user" size={22} color="#aaa" />
          <Text style={styles.navText}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  periodContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  
  periodButtonActive: {
    backgroundColor: '#E8622A',
  },
  
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  periodButtonTextActive: {
    color: '#fff',
  },
  
  content: {
    flex: 1,
  },
  
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  performanceCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  
  performanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  performanceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  performanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  performanceChange: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  goalsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  goalItem: {
    marginBottom: 16,
  },
  
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  goalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  
  goalProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  goalBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  chartHeader: {
    marginBottom: 16,
  },
  
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  chartSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 8,
  },
  
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  
  barWrapper: {
    height: 80,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  
  bar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 4,
  },
  
  barValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 4,
  },
  
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginTop: 2,
  },
  
  categoryList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  categoryInfo: {
    flex: 1,
  },
  
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  
  categoryOrders: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  categoryRevenue: {
    alignItems: 'flex-end',
  },
  
  revenueAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E8622A',
    marginBottom: 2,
  },
  
  revenueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  bottomNav: {
    height: 68,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 3,
  },
  
  navText: {
    fontSize: 10,
    color: '#aaa',
    fontWeight: '700',
  },
});

export default StaffAnalyticsScreen;