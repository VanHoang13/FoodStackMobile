import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import apiClient from '../services/api';
import AuthService from '../services/authService';

type AdvancedAnalyticsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdvancedAnalytics'>;

interface Props {
  navigation: AdvancedAnalyticsScreenNavigationProp;
}

interface AnalyticsData {
  revenue: {
    totalRevenue: number;
    orderCount: number;
    avgOrderValue: number;
    revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  };
  orders: {
    ordersByStatus: Array<{ status: string; count: number }>;
    ordersByHour: Array<{ hour: number; orders: number }>;
    avgPreparationTime: number;
  };
  menu: {
    topSellingItems: Array<{ itemName: string; totalQuantity: number }>;
    categoryPerformance: Array<{ categoryName: string; totalRevenue: number }>;
  };
  customers: {
    totalCustomers: number;
    avgPartySize: number;
    peakHours: Array<{ hour: number; customerCount: number }>;
  };
  feedback: {
    averageRatings: {
      overall: number;
      foodQuality: number;
      service: number;
      atmosphere: number;
    };
    totalFeedbacks: number;
    ratingDistribution: Array<{ rating: number; count: number }>;
  };
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40;

const AdvancedAnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedTab, setSelectedTab] = useState('revenue');

  const periods = [
    { key: '1d', label: '1 ngày' },
    { key: '7d', label: '7 ngày' },
    { key: '30d', label: '30 ngày' },
    { key: '90d', label: '90 ngày' },
  ];

  const tabs = [
    { key: 'revenue', label: 'Doanh thu', icon: 'dollar-sign' },
    { key: 'orders', label: 'Đơn hàng', icon: 'shopping-bag' },
    { key: 'menu', label: 'Menu', icon: 'utensils' },
    { key: 'customers', label: 'Khách hàng', icon: 'users' },
    { key: 'feedback', label: 'Đánh giá', icon: 'star' },
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Get user data to get restaurantId
      const userData = await AuthService.getUserData();
      const restaurantId = userData?.restaurantId;

      if (!restaurantId) {
        console.warn('No restaurantId found, cannot load analytics');
        setLoading(false);
        return;
      }

      // Fetch comprehensive dashboard data from analytics API
      const response = await apiClient.get<{ success: boolean; data: any }>(
        `/analytics/dashboard/${restaurantId}`,
        { params: { period: selectedPeriod } }
      );

      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      console.error('Load analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRevenueAnalytics = () => {
    if (!analyticsData?.revenue) return null;

    const { revenue } = analyticsData;
    
    // Prepare chart data
    const chartData = {
      labels: revenue.revenueByDay.slice(-7).map(item => {
        const date = new Date(item.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [{
        data: revenue.revenueByDay.slice(-7).map(item => item.revenue),
        color: (opacity = 1) => `rgba(${theme.colors.primaryRGB}, ${opacity})`,
        strokeWidth: 2,
      }],
    };

    return (
      <View style={styles.analyticsSection}>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Tổng doanh thu"
            value={`${revenue.totalRevenue.toLocaleString('vi-VN')}đ`}
            icon="dollar-sign"
            color={theme.colors.success}
          />
          <MetricCard
            title="Số đơn hàng"
            value={revenue.orderCount.toString()}
            icon="shopping-bag"
            color={theme.colors.primary}
          />
          <MetricCard
            title="Giá trị TB/đơn"
            value={`${Math.round(revenue.avgOrderValue).toLocaleString('vi-VN')}đ`}
            icon="trending-up"
            color={theme.colors.warning}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Doanh thu theo ngày</Text>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.white,
              backgroundGradientFrom: theme.colors.white,
              backgroundGradientTo: theme.colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(${theme.colors.primaryRGB}, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(${theme.colors.textRGB}, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.colors.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>
    );
  };

  const renderOrderAnalytics = () => {
    if (!analyticsData?.orders) return null;

    const { orders } = analyticsData;

    // Order status chart
    const statusData = orders.ordersByStatus.map((item, index) => ({
      name: getStatusLabel(item.status),
      population: item.count,
      color: getStatusColor(item.status, index),
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    }));

    // Orders by hour chart
    const hourlyData = {
      labels: orders.ordersByHour.slice(0, 12).map(item => `${item.hour}h`),
      datasets: [{
        data: orders.ordersByHour.slice(0, 12).map(item => item.orders),
      }],
    };

    return (
      <View style={styles.analyticsSection}>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Thời gian chuẩn bị TB"
            value={`${Math.round(orders.avgPreparationTime)} phút`}
            icon="clock"
            color={theme.colors.info}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Trạng thái đơn hàng</Text>
          <PieChart
            data={statusData}
            width={chartWidth}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Đơn hàng theo giờ</Text>
          <BarChart
            data={hourlyData}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.white,
              backgroundGradientFrom: theme.colors.white,
              backgroundGradientTo: theme.colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(${theme.colors.primaryRGB}, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(${theme.colors.textRGB}, ${opacity})`,
            }}
            style={styles.chart}
          />
        </View>
      </View>
    );
  };

  const renderMenuAnalytics = () => {
    if (!analyticsData?.menu) return null;

    const { menu } = analyticsData;

    return (
      <View style={styles.analyticsSection}>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Món bán chạy nhất</Text>
          <View style={styles.topItemsList}>
            {menu.topSellingItems.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.topItem}>
                <View style={styles.topItemRank}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.topItemInfo}>
                  <Text style={styles.topItemName}>{item.itemName}</Text>
                  <Text style={styles.topItemQuantity}>Đã bán: {item.totalQuantity}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Doanh thu theo danh mục</Text>
          <View style={styles.categoryList}>
            {menu.categoryPerformance.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{category.categoryName}</Text>
                <Text style={styles.categoryRevenue}>
                  {category.totalRevenue.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderCustomerAnalytics = () => {
    if (!analyticsData?.customers) return null;

    const { customers } = analyticsData;

    // Peak hours chart
    const peakHoursData = {
      labels: customers.peakHours.slice(0, 8).map(item => `${item.hour}h`),
      datasets: [{
        data: customers.peakHours.slice(0, 8).map(item => item.customerCount),
      }],
    };

    return (
      <View style={styles.analyticsSection}>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Tổng khách hàng"
            value={customers.totalCustomers.toString()}
            icon="users"
            color={theme.colors.primary}
          />
          <MetricCard
            title="Số người TB/bàn"
            value={customers.avgPartySize.toFixed(1)}
            icon="user-friends"
            color={theme.colors.info}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Giờ cao điểm</Text>
          <BarChart
            data={peakHoursData}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.white,
              backgroundGradientFrom: theme.colors.white,
              backgroundGradientTo: theme.colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(${theme.colors.warningRGB}, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(${theme.colors.textRGB}, ${opacity})`,
            }}
            style={styles.chart}
          />
        </View>
      </View>
    );
  };

  const renderFeedbackAnalytics = () => {
    if (!analyticsData?.feedback) return null;

    const { feedback } = analyticsData;

    // Rating distribution chart
    const ratingData = feedback.ratingDistribution.map((item, index) => ({
      name: `${item.rating} sao`,
      population: item.count,
      color: getRatingColor(item.rating),
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    }));

    return (
      <View style={styles.analyticsSection}>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Đánh giá TB"
            value={feedback.averageRatings.overall.toFixed(1)}
            icon="star"
            color={theme.colors.warning}
          />
          <MetricCard
            title="Tổng đánh giá"
            value={feedback.totalFeedbacks.toString()}
            icon="message-circle"
            color={theme.colors.info}
          />
        </View>

        <View style={styles.ratingBreakdown}>
          <Text style={styles.chartTitle}>Chi tiết đánh giá</Text>
          <RatingBar label="Chất lượng món ăn" rating={feedback.averageRatings.foodQuality} />
          <RatingBar label="Dịch vụ" rating={feedback.averageRatings.service} />
          <RatingBar label="Không gian" rating={feedback.averageRatings.atmosphere} />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Phân bố đánh giá</Text>
          <PieChart
            data={ratingData}
            width={chartWidth}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </View>
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'PENDING': 'Chờ xử lý',
      'CONFIRMED': 'Đã xác nhận',
      'PREPARING': 'Đang chuẩn bị',
      'READY': 'Sẵn sàng',
      'SERVED': 'Đã phục vụ',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string, index: number) => {
    const colors = [
      theme.colors.primary,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.info,
      theme.colors.secondary,
      theme.colors.error,
    ];
    return colors[index % colors.length];
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return theme.colors.success;
    if (rating >= 3) return theme.colors.warning;
    return theme.colors.error;
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'revenue': return renderRevenueAnalytics();
      case 'orders': return renderOrderAnalytics();
      case 'menu': return renderMenuAnalytics();
      case 'customers': return renderCustomerAnalytics();
      case 'feedback': return renderFeedbackAnalytics();
      default: return renderRevenueAnalytics();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
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
        <Text style={styles.headerTitle}>Phân tích nâng cao</Text>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.selectedPeriodButton,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.selectedPeriodButtonText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabSelector}
        contentContainerStyle={styles.tabSelectorContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && styles.selectedTabButton,
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={selectedTab === tab.key ? theme.colors.white : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.tabButtonText,
                selectedTab === tab.key && styles.selectedTabButtonText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => (
  <View style={styles.metricCard}>
    <View style={[styles.metricIcon, { backgroundColor: color }]}>
      <Icon name={icon} size={24} color={theme.colors.white} />
    </View>
    <View style={styles.metricContent}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  </View>
);

const RatingBar: React.FC<{
  label: string;
  rating: number;
}> = ({ label, rating }) => (
  <View style={styles.ratingBarContainer}>
    <View style={styles.ratingBarHeader}>
      <Text style={styles.ratingBarLabel}>{label}</Text>
      <Text style={styles.ratingBarValue}>{rating.toFixed(1)}</Text>
    </View>
    <View style={styles.ratingBarTrack}>
      <View
        style={[
          styles.ratingBarFill,
          { width: `${(rating / 5) * 100}%` }
        ]}
      />
    </View>
  </View>
);

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
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: theme.colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: theme.colors.white,
  },
  tabSelector: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabSelectorContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
  },
  selectedTabButton: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  selectedTabButtonText: {
    color: theme.colors.white,
  },
  content: {
    flex: 1,
  },
  analyticsSection: {
    padding: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    ...theme.shadows.small,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  chartContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.small,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  topItemsList: {
    marginTop: 8,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  topItemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  topItemQuantity: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  categoryList: {
    marginTop: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryName: {
    fontSize: 14,
    color: theme.colors.text,
  },
  categoryRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  ratingBreakdown: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.small,
  },
  ratingBarContainer: {
    marginBottom: 16,
  },
  ratingBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBarLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  ratingBarValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  ratingBarTrack: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: theme.colors.warning,
    borderRadius: 4,
  },
});

export default AdvancedAnalyticsScreen;