import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

type StaffDashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffDashboard'>;

interface Props {
  navigation: StaffDashboardScreenNavigationProp;
}

interface DashboardStats {
  ordersToday: number;
  ordersCompleted: number;
  averageTime: number;
  activeOrders: number;
  pendingRequests: number;
  tablesAssigned: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  table: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
  items: number;
  time: string;
}

interface ServiceRequest {
  id: string;
  table: string;
  type: 'WATER' | 'CLEAN' | 'ASSISTANCE' | 'BILL';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  time: string;
  message?: string;
}

const StaffDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    ordersToday: 0,
    ordersCompleted: 0,
    averageTime: 0,
    activeOrders: 0,
    pendingRequests: 0,
    tablesAssigned: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDashboardData();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Auto refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // TODO: Replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setStats({
        ordersToday: 24,
        ordersCompleted: 18,
        averageTime: 12,
        activeOrders: 6,
        pendingRequests: 3,
        tablesAssigned: 8,
      });

      setRecentOrders([
        {
          id: '1',
          orderNumber: 'ORD-001',
          table: 'B01',
          status: 'PREPARING',
          items: 3,
          time: '10:30',
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          table: 'B05',
          status: 'READY',
          items: 2,
          time: '10:25',
        },
        {
          id: '3',
          orderNumber: 'ORD-003',
          table: 'A03',
          status: 'PENDING',
          items: 4,
          time: '10:35',
        },
      ]);

      setPendingRequests([
        {
          id: '1',
          table: 'B02',
          type: 'WATER',
          priority: 'NORMAL',
          time: '10:32',
          message: 'Cần thêm nước',
        },
        {
          id: '2',
          table: 'A05',
          type: 'ASSISTANCE',
          priority: 'HIGH',
          time: '10:28',
          message: 'Cần hỗ trợ thanh toán',
        },
        {
          id: '3',
          table: 'B07',
          type: 'CLEAN',
          priority: 'LOW',
          time: '10:20',
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
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
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#F39C12';
      case 'PREPARING': return '#E67E22';
      case 'READY': return '#27AE60';
      case 'SERVED': return '#2ECC71';
      default: return '#95A5A6';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#E74C3C';
      case 'NORMAL': return '#3498DB';
      case 'LOW': return '#95A5A6';
      default: return '#95A5A6';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'WATER': return 'droplet';
      case 'CLEAN': return 'trash-2';
      case 'ASSISTANCE': return 'help-circle';
      case 'BILL': return 'credit-card';
      default: return 'bell';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👨‍🍳</Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.staffName}>{user?.fullName || 'Staff'}</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('StaffNotification')}
          >
            <Icon name="bell" size={20} color="#333" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="log-out" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê hôm nay</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#3498DB', '#2980B9']}
                  style={styles.statIconContainer}
                >
                  <Icon name="shopping-bag" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{stats.ordersToday}</Text>
                <Text style={styles.statLabel}>Đơn hàng hôm nay</Text>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#27AE60', '#229954']}
                  style={styles.statIconContainer}
                >
                  <Icon name="check-circle" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{stats.ordersCompleted}</Text>
                <Text style={styles.statLabel}>Đã hoàn thành</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#F39C12', '#E67E22']}
                  style={styles.statIconContainer}
                >
                  <Icon name="clock" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{stats.averageTime}m</Text>
                <Text style={styles.statLabel}>Thời gian trung bình</Text>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#E74C3C', '#C0392B']}
                  style={styles.statIconContainer}
                >
                  <Icon name="activity" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{stats.activeOrders}</Text>
                <Text style={styles.statLabel}>Đang xử lý</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          
          <View style={styles.quickActionsContainer}>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StaffOrderManagement')}
              >
                <LinearGradient
                  colors={['#FF7A30', '#E8622A']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="chef-hat" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Quản lý đơn hàng</Text>
                <Text style={styles.quickActionSubtitle}>Xử lý đơn hàng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StaffTableManagement')}
              >
                <LinearGradient
                  colors={['#4FC3F7', '#0288D1']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="grid" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Quản lý bàn</Text>
                <Text style={styles.quickActionSubtitle}>Trạng thái bàn</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StaffServiceRequests')}
              >
                <LinearGradient
                  colors={['#4DB6AC', '#00897B']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="bell" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Yêu cầu dịch vụ</Text>
                <Text style={styles.quickActionSubtitle}>Hỗ trợ khách hàng</Text>
                {pendingRequests.length > 0 && (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{pendingRequests.length}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StaffChat')}
              >
                <LinearGradient
                  colors={['#CE93D8', '#7B1FA2']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="message-circle" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Chat nhân viên</Text>
                <Text style={styles.quickActionSubtitle}>Liên lạc nội bộ</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StaffOrderHistory')}
              >
                <LinearGradient
                  colors={['#FFB74D', '#FF9800']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="file-text" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Lịch sử đơn hàng</Text>
                <Text style={styles.quickActionSubtitle}>Báo cáo & thống kê</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StaffInventory')}
              >
                <LinearGradient
                  colors={['#81C784', '#4CAF50']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="package" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Quản lý kho</Text>
                <Text style={styles.quickActionSubtitle}>Kiểm tra tồn kho</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StaffAnalytics')}
              >
                <LinearGradient
                  colors={['#64B5F6', '#2196F3']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="bar-chart-2" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Phân tích</Text>
                <Text style={styles.quickActionSubtitle}>Báo cáo hiệu suất</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StaffPerformance')}
              >
                <LinearGradient
                  colors={['#F06292', '#E91E63']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="award" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>KPIs</Text>
                <Text style={styles.quickActionSubtitle}>Hiệu suất cá nhân</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StaffTasks')}
              >
                <LinearGradient
                  colors={['#A1887F', '#795548']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="check-square" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Công việc</Text>
                <Text style={styles.quickActionSubtitle}>Quản lý task</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StaffSchedule')}
              >
                <LinearGradient
                  colors={['#90A4AE', '#607D8B']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="calendar" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Lịch làm việc</Text>
                <Text style={styles.quickActionSubtitle}>Ca làm việc</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StaffTraining')}
              >
                <LinearGradient
                  colors={['#FFD54F', '#FFC107']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="book-open" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Đào tạo</Text>
                <Text style={styles.quickActionSubtitle}>Khóa học & chứng chỉ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StaffProfile')}
              >
                <LinearGradient
                  colors={['#A1887F', '#795548']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="settings" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Cài đặt</Text>
                <Text style={styles.quickActionSubtitle}>Tùy chỉnh cá nhân</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Orders & Service Requests */}
        <View style={styles.section}>
          <View style={styles.overviewContainer}>
            {/* Recent Orders */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <Text style={styles.overviewTitle}>Đơn hàng gần đây</Text>
                <TouchableOpacity onPress={() => navigation.navigate('StaffOrderManagement')}>
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>

              {recentOrders.slice(0, 3).map((order) => (
                <View key={order.id} style={styles.orderItem}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                    <Text style={styles.orderTable}>Bàn {order.table}</Text>
                  </View>
                  <View style={styles.orderStatus}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) }
                    ]}>
                      <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                    <Text style={styles.orderTime}>{order.time}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Service Requests */}
            {pendingRequests.length > 0 && (
              <View style={styles.overviewCard}>
                <View style={styles.overviewHeader}>
                  <Text style={styles.overviewTitle}>Yêu cầu dịch vụ</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('StaffServiceRequests')}>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                  </TouchableOpacity>
                </View>

                {pendingRequests.slice(0, 3).map((request) => (
                  <View key={request.id} style={styles.requestItem}>
                    <View style={styles.requestInfo}>
                      <Icon 
                        name={getRequestTypeIcon(request.type)} 
                        size={16} 
                        color={getPriorityColor(request.priority)} 
                      />
                      <Text style={styles.requestTable}>Bàn {request.table}</Text>
                      <View style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(request.priority) }
                      ]}>
                        <Text style={styles.priorityText}>{request.priority}</Text>
                      </View>
                    </View>
                    <Text style={styles.requestTime}>{request.time}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Icon name="home" size={22} color="#E8622A" />
          <Text style={[styles.navText, styles.activeNavText]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('StaffOrderManagement')}
        >
          <Icon name="chef-hat" size={22} color="#aaa" />
          <Text style={styles.navText}>Đơn hàng</Text>
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
          onPress={() => navigation.navigate('StaffServiceRequests')}
        >
          <Icon name="bell" size={22} color="#aaa" />
          <Text style={styles.navText}>Yêu cầu</Text>
          {pendingRequests.length > 0 && (
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>{pendingRequests.length}</Text>
            </View>
          )}
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
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE0CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  avatarText: {
    fontSize: 18,
  },
  
  welcomeText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  
  staffName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 20,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8622A',
  },
  
  // Stats Section
  statsContainer: {
    gap: 16,
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    ...theme.shadows.md,
    minHeight: 120,
  },
  
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Quick Actions Section
  quickActionsContainer: {
    gap: 16,
  },
  
  quickActionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    ...theme.shadows.md,
    minHeight: 140,
  },
  
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  quickActionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  actionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  
  // Overview Section (Recent Orders & Service Requests)
  overviewContainer: {
    gap: 20,
  },
  
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    ...theme.shadows.md,
  },
  
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  overviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  
  // Order Items
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  orderInfo: {
    flex: 1,
  },
  
  orderNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  
  orderTable: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  orderStatus: {
    alignItems: 'flex-end',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  
  orderTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  // Request Items
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  
  requestTable: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  
  requestTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  orderNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  
  orderTable: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  orderStatus: {
    // Status badge container
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  orderItems: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  orderTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  requestTable: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  
  requestTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  requestMessage: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
    position: 'relative',
  },
  
  activeNavItem: {
    // Active state styling handled by individual elements
  },
  
  navText: {
    fontSize: 10,
    color: '#aaa',
    fontWeight: '700',
  },
  
  activeNavText: {
    color: '#E8622A',
  },
  
  navBadge: {
    position: 'absolute',
    top: 4,
    right: '35%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  navBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
  },
});

export default StaffDashboardScreen;