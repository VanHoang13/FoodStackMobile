import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { getApiBaseUrl } from '../services/api-config';
import apiClient, { storage, restaurantApi, branchApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import OwnerStaffApiService from '../services/ownerStaffApiService';
import RestaurantStatisticsService from '../services/restaurantStatisticsService';
import AuthService from '../services/authService';

type RestaurantDashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RestaurantDashboard'>;

interface Props {
  navigation: RestaurantDashboardScreenNavigationProp;
}

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  totalMenuItems: number;
  activeTables: number;
  avgServiceTime: string;
  revenueChange: number;
  ordersChange: number;
  // Staff stats
  totalStaff: number;
  activeStaff: number;
  onLeaveStaff: number;
  averagePerformance: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'payment' | 'service';
  title: string;
  time: string;
  amount?: string;
}

interface TopItem {
  name: string;
  sold: number;
  progress: number;
}

const RestaurantDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalMenuItems: 0,
    activeTables: 0,
    avgServiceTime: '0m',
    revenueChange: 0,
    ordersChange: 0,
    totalStaff: 0,
    activeStaff: 0,
    onLeaveStaff: 0,
    averagePerformance: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [restaurantName, setRestaurantName] = useState('Nhà hàng');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Loading restaurant dashboard data...');
      
      // Fetch real data from backend APIs using the new statistics service
      const [restaurantInfoRes, statisticsRes, staffStatsRes] = await Promise.allSettled([
        RestaurantStatisticsService.getRestaurantInfo(),
        RestaurantStatisticsService.getRestaurantStatistics(),
        OwnerStaffApiService.getStaffStats(),
      ]);

      let todayOrders = 0;
      let todayRevenue = 0;
      let pendingOrders = 0;
      let totalMenuItems = 0;
      let activeTables = 0;
      let avgServiceTime = '0m';
      let revenueChange = 0;
      let ordersChange = 0;
      let totalStaff = 0;
      let activeStaff = 0;
      let onLeaveStaff = 0;
      let averagePerformance = 0;

      // Process restaurant info to get restaurant name
      if (restaurantInfoRes.status === 'fulfilled' && restaurantInfoRes.value.length > 0) {
        setRestaurantName(restaurantInfoRes.value[0].name);
        console.log('✅ Restaurant info loaded:', restaurantInfoRes.value[0].name);
      }

      // Process statistics data from new API
      if (statisticsRes.status === 'fulfilled') {
        const stats = statisticsRes.value;
        todayOrders = stats.todayOrders || 0;
        todayRevenue = stats.todayRevenue || 0;
        pendingOrders = stats.pendingOrders || 0;
        totalMenuItems = stats.totalMenuItems || 0;
        activeTables = stats.activeTables || 0;
        avgServiceTime = stats.avgServiceTime || '0m';
        revenueChange = stats.revenueChange || 0;
        ordersChange = stats.ordersChange || 0;
        console.log('✅ Restaurant statistics loaded from new API:', stats);
      } else {
        console.log('⚠️ Statistics API not available, using fallback data');
        // Use demo data for testing
        todayOrders = 12;
        todayRevenue = 450000;
        pendingOrders = 3;
        totalMenuItems = 25;
        activeTables = 8;
        avgServiceTime = '14m 20s';
        revenueChange = 12.5;
        ordersChange = 8.2;
      }

      // Process staff statistics from API
      if (staffStatsRes.status === 'fulfilled') {
        const staffStats = staffStatsRes.value;
        totalStaff = staffStats.totalStaff || 0;
        activeStaff = staffStats.activeStaff || 0;
        onLeaveStaff = staffStats.onLeaveStaff || 0;
        averagePerformance = staffStats.averagePerformance || 0;
        console.log('✅ Staff statistics loaded from API:', staffStats);
      } else {
        console.log('⚠️ Staff statistics API not available, using mock data');
        // Fallback to demo data
        totalStaff = 8;
        activeStaff = 6;
        onLeaveStaff = 1;
        averagePerformance = 87.5;
      }

      setStats({
        todayOrders,
        todayRevenue,
        pendingOrders,
        totalMenuItems,
        activeTables,
        avgServiceTime,
        revenueChange,
        ordersChange,
        totalStaff,
        activeStaff,
        onLeaveStaff,
        averagePerformance,
      });

      // Fetch analytics dashboard for recent activity & top items
      const userData = await AuthService.getUserData();
      const restaurantId = userData?.restaurantId;
      if (restaurantId) {
        try {
          const analyticsRes = await apiClient.get<{ success: boolean; data: any }>(
            `/analytics/dashboard/${restaurantId}`,
            { params: { period: '1d' } }
          );
          const dashData = analyticsRes.data.data || {};

          // Map top selling items from analytics
          if (Array.isArray(dashData.menu?.topSellingItems) && dashData.menu.topSellingItems.length > 0) {
            const maxQty = dashData.menu.topSellingItems[0].totalQuantity || 1;
            setTopItems(
              dashData.menu.topSellingItems.slice(0, 3).map((item: any) => ({
                name: item.itemName || item.name || 'Unknown',
                sold: item.totalQuantity || 0,
                progress: Math.round(((item.totalQuantity || 0) / maxQty) * 100),
              }))
            );
          } else {
            setTopItems([]);
          }

          // Map recent orders as recent activity
          if (Array.isArray(dashData.recentOrders) && dashData.recentOrders.length > 0) {
            setRecentActivity(
              dashData.recentOrders.slice(0, 5).map((order: any) => {
                const createdAt = new Date(order.createdAt || order.created_at);
                const diffMs = Date.now() - createdAt.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const timeText = diffMins < 60
                  ? `${diffMins} phút trước`
                  : `${Math.floor(diffMins / 60)} giờ trước`;
                return {
                  id: order.id || order.orderNumber,
                  type: 'order' as const,
                  title: `Đơn hàng #${order.orderNumber || order.id?.slice(-4) || '---'}`,
                  time: timeText,
                  amount: order.total ? `${order.total.toLocaleString('vi-VN')}đ` : undefined,
                };
              })
            );
          } else {
            setRecentActivity([]);
          }
        } catch (analyticsErr) {
          console.warn('Analytics dashboard not available:', analyticsErr);
          setRecentActivity([]);
          setTopItems([]);
        }
      } else {
        setRecentActivity([]);
        setTopItems([]);
      }

      console.log('📊 Restaurant dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading restaurant dashboard data:', error);
      
      // Fallback to demo data
      setStats({
        todayOrders: 12,
        todayRevenue: 450000,
        pendingOrders: 3,
        totalMenuItems: 25,
        activeTables: 8,
        avgServiceTime: '14m 20s',
        revenueChange: 12.5,
        ordersChange: 8.2,
        totalStaff: 8,
        activeStaff: 6,
        onLeaveStaff: 1,
        averagePerformance: 87.5,
      });

      setRecentActivity([
        { id: '1', type: 'order', title: 'Đơn hàng mới #402', time: '2 phút trước', amount: '125.000đ' },
        { id: '2', type: 'service', title: 'Yêu cầu phục vụ bàn 4', time: '5 phút trước' },
        { id: '3', type: 'payment', title: 'Thanh toán #398', time: '12 phút trước', amount: '89.000đ' },
      ]);

      setTopItems([
        { name: 'Phở bò đặc biệt', sold: 342, progress: 85 },
        { name: 'Cơm tấm sườn nướng', sold: 289, progress: 72 },
        { name: 'Cà phê sữa đá', sold: 215, progress: 54 },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleMenuManagement = () => {
    navigation.navigate('OwnerMenuManagement');
  };

  const handleBranchManagement = () => {
    navigation.navigate('OwnerBranchManagement');
  };

  const handleOrderManagement = () => {
    navigation.navigate('OrderManagement');
  };

  const handleRestaurantSettings = () => {
    navigation.navigate('RestaurantSettings');
  };

  const handleStatistics = () => {
    navigation.navigate('RestaurantStatistics');
  };

  const handleKitchenDisplay = () => {
    navigation.navigate('KitchenDisplay');
  };

  const handleServiceRequests = () => {
    navigation.navigate('ServiceRequests');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              navigation.replace('Login');
            }
          }
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FF7A30', '#E8622A']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
              <Text style={styles.restaurantName}>{restaurantName}</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Icon name="log-out" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Icon name="shopping-bag" size={24} color="#FF7A30" />
              <Text style={styles.statNumber}>{stats.todayOrders}</Text>
              <Text style={styles.statLabel}>Đơn hôm nay</Text>
            </View>
            <View style={[styles.statCard, styles.statCardSuccess]}>
              <Icon name="dollar-sign" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{formatCurrency(stats.todayRevenue)}</Text>
              <Text style={styles.statLabel}>Doanh thu hôm nay</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardWarning]}>
              <Icon name="clock" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>Đơn chờ xử lý</Text>
            </View>
            <View style={[styles.statCard, styles.statCardInfo]}>
              <Icon name="menu" size={24} color="#2196F3" />
              <Text style={styles.statNumber}>{stats.totalMenuItems}</Text>
              <Text style={styles.statLabel}>Món ăn</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardStaff]}>
              <Icon name="users" size={24} color="#9C27B0" />
              <Text style={styles.statNumber}>{stats.totalStaff}</Text>
              <Text style={styles.statLabel}>Tổng nhân viên</Text>
            </View>
            <View style={[styles.statCard, styles.statCardActive]}>
              <Icon name="user-check" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.activeStaff}</Text>
              <Text style={styles.statLabel}>Đang làm việc</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardLeave]}>
              <Icon name="user-x" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>{stats.onLeaveStaff}</Text>
              <Text style={styles.statLabel}>Nghỉ phép</Text>
            </View>
            <View style={[styles.statCard, styles.statCardPerformance]}>
              <Icon name="trending-up" size={24} color="#2196F3" />
              <Text style={styles.statNumber}>{stats.averagePerformance.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Hiệu suất TB</Text>
            </View>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View
          style={[
            styles.activityContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={[
                styles.activityIcon,
                activity.type === 'order' ? styles.orderIcon :
                activity.type === 'payment' ? styles.paymentIcon : styles.serviceIcon
              ]}>
                <Icon 
                  name={activity.type === 'order' ? 'shopping-bag' : 
                        activity.type === 'payment' ? 'dollar-sign' : 'bell'} 
                  size={16} 
                  color="#fff" 
                />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              {activity.amount && (
                <Text style={styles.activityAmount}>{activity.amount}</Text>
              )}
            </View>
          ))}
        </Animated.View>

        {/* Top Items */}
        <Animated.View
          style={[
            styles.topItemsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Món bán chạy nhất</Text>
          {topItems.map((item, index) => (
            <View key={index} style={styles.topItemCard}>
              <View style={styles.topItemInfo}>
                <Text style={styles.topItemName}>{item.name}</Text>
                <Text style={styles.topItemSold}>{item.sold} đã bán</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[styles.progressBar, { width: `${item.progress}%` }]} 
                  />
                </View>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.actionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Quản lý nhanh</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleOrderManagement}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF7A30', '#E8622A']}
                style={styles.actionGradient}
              >
                <Icon name="orders" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Quản lý đơn hàng</Text>
                <Text style={styles.actionSubtitle}>Xem và xử lý đơn hàng</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleMenuManagement}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.actionGradient}
              >
                <Icon name="menu" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Quản lý menu</Text>
                <Text style={styles.actionSubtitle}>Thêm, sửa món ăn</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('OwnerStaffManagement')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.actionGradient}
              >
                <Icon name="users" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Quản lý nhân viên</Text>
                <Text style={styles.actionSubtitle}>Nhân sự & hiệu suất</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('OwnerTableManagement')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.actionGradient}
              >
                <Icon name="grid" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Quản lý bàn</Text>
                <Text style={styles.actionSubtitle}>Trạng thái & đặt bàn</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleBranchManagement}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#607D8B', '#455A64']}
                style={styles.actionGradient}
              >
                <Icon name="map-pin" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Quản lý chi nhánh</Text>
                <Text style={styles.actionSubtitle}>Địa điểm & hoạt động</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('OwnerInventory')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#9C27B0', '#7B1FA2']}
                style={styles.actionGradient}
              >
                <Icon name="package" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Quản lý kho</Text>
                <Text style={styles.actionSubtitle}>Nguyên liệu & tồn kho</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('OwnerNotification')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#F44336', '#D32F2F']}
                style={styles.actionGradient}
              >
                <Icon name="bell" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Thông báo</Text>
                <Text style={styles.actionSubtitle}>Cảnh báo & tin nhắn</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('OwnerChat')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#00BCD4', '#0097A7']}
                style={styles.actionGradient}
              >
                <Icon name="message-circle" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Chat nhân viên</Text>
                <Text style={styles.actionSubtitle}>Giao tiếp nội bộ</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('OwnerStaffAnalytics')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#673AB7', '#512DA8']}
                style={styles.actionGradient}
              >
                <Icon name="bar-chart-2" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Phân tích NV</Text>
                <Text style={styles.actionSubtitle}>Hiệu suất & báo cáo</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleStatistics}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#795548', '#5D4037']}
                style={styles.actionGradient}
              >
                <Icon name="chart" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Thống kê</Text>
                <Text style={styles.actionSubtitle}>Báo cáo doanh thu</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleKitchenDisplay}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF5722', '#D84315']}
                style={styles.actionGradient}
              >
                <Icon name="chef-hat" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Màn hình bếp</Text>
                <Text style={styles.actionSubtitle}>Quản lý đơn hàng bếp</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleServiceRequests}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#607D8B', '#455A64']}
                style={styles.actionGradient}
              >
                <Icon name="headphones" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Yêu cầu dịch vụ</Text>
                <Text style={styles.actionSubtitle}>Xử lý yêu cầu khách</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleRestaurantSettings}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#9E9E9E', '#757575']}
                style={styles.actionGradient}
              >
                <Icon name="settings" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Cài đặt</Text>
                <Text style={styles.actionSubtitle}>Thông tin nhà hàng</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

  // Header Styles
  header: {
    marginBottom: 20,
  },

  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },

  restaurantName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },

  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Stats Styles
  statsContainer: {
    marginBottom: 24,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
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

  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A30',
  },

  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },

  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },

  statCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },

  statCardStaff: {
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },

  statCardActive: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },

  statCardLeave: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },

  statCardPerformance: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },

  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Actions Styles
  actionsContainer: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  actionCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  actionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },

  actionSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Activity Styles
  activityContainer: {
    marginBottom: 24,
  },

  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
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

  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  orderIcon: {
    backgroundColor: '#4CAF50',
  },

  paymentIcon: {
    backgroundColor: '#2196F3',
  },

  serviceIcon: {
    backgroundColor: '#FF9800',
  },

  activityInfo: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  activityTime: {
    fontSize: 12,
    color: '#666',
  },

  activityAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF7A30',
  },

  // Top Items Styles
  topItemsContainer: {
    marginBottom: 24,
  },

  topItemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  topItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  topItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  topItemSold: {
    fontSize: 12,
    color: '#666',
  },

  progressBarContainer: {
    width: '100%',
  },

  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#FF7A30',
    borderRadius: 3,
  },
});

export default RestaurantDashboardScreen;