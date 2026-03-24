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
import { useAuth } from '../contexts/AuthContext';

type ManagerDashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManagerDashboard'>;

interface Props {
  navigation: ManagerDashboardScreenNavigationProp;
}

interface BranchStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  activeStaff: number;
  occupiedTables: number;
  avgServiceTime: string;
  revenueChange: number;
  ordersChange: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'staff' | 'service' | 'alert';
  title: string;
  time: string;
  priority?: 'high' | 'medium' | 'low';
}

const ManagerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<BranchStats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    activeStaff: 0,
    occupiedTables: 0,
    avgServiceTime: '0m',
    revenueChange: 0,
    ordersChange: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [branchName, setBranchName] = useState('Chi nhánh');
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
      console.log('📊 Loading manager dashboard data...');
      
      // Mock data for branch-specific stats
      setStats({
        todayOrders: 28,
        todayRevenue: 850000,
        pendingOrders: 5,
        activeStaff: 8,
        occupiedTables: 12,
        avgServiceTime: '18m 30s',
        revenueChange: 15.2,
        ordersChange: 12.8,
      });

      setBranchName('Chi nhánh Quận 1');

      // Set recent activity for branch management
      setRecentActivity([
        { id: '1', type: 'order', title: 'Đơn hàng #501 - Bàn 8', time: '3 phút trước', priority: 'high' },
        { id: '2', type: 'staff', title: 'Nhân viên Minh đã check-in', time: '15 phút trước', priority: 'low' },
        { id: '3', type: 'alert', title: 'Bàn 12 yêu cầu hỗ trợ', time: '20 phút trước', priority: 'medium' },
        { id: '4', type: 'service', title: 'Hoàn thành dọn bàn 5', time: '25 phút trước', priority: 'low' },
      ]);

      console.log('📊 Manager dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading manager dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
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

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#E74C3C';
      case 'medium': return '#F39C12';
      case 'low': return '#27AE60';
      default: return '#95A5A6';
    }
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
          colors={['#3498DB', '#2980B9']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Quản lý chi nhánh</Text>
              <Text style={styles.branchName}>{branchName}</Text>
              <Text style={styles.managerName}>👨‍💼 {user?.fullName}</Text>
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
              <Icon name="shopping-bag" size={24} color="#3498DB" />
              <Text style={styles.statNumber}>{stats.todayOrders}</Text>
              <Text style={styles.statLabel}>Đơn hôm nay</Text>
              <Text style={[styles.statChange, { color: '#27AE60' }]}>
                +{stats.ordersChange}%
              </Text>
            </View>
            <View style={[styles.statCard, styles.statCardSuccess]}>
              <Icon name="dollar-sign" size={24} color="#27AE60" />
              <Text style={styles.statNumber}>{formatCurrency(stats.todayRevenue)}</Text>
              <Text style={styles.statLabel}>Doanh thu chi nhánh</Text>
              <Text style={[styles.statChange, { color: '#27AE60' }]}>
                +{stats.revenueChange}%
              </Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardWarning]}>
              <Icon name="clock" size={24} color="#F39C12" />
              <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>Đơn chờ xử lý</Text>
            </View>
            <View style={[styles.statCard, styles.statCardInfo]}>
              <Icon name="users" size={24} color="#9B59B6" />
              <Text style={styles.statNumber}>{stats.activeStaff}</Text>
              <Text style={styles.statLabel}>Nhân viên đang làm</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardTable]}>
              <Icon name="grid" size={24} color="#E67E22" />
              <Text style={styles.statNumber}>{stats.occupiedTables}</Text>
              <Text style={styles.statLabel}>Bàn đang phục vụ</Text>
            </View>
            <View style={[styles.statCard, styles.statCardTime]}>
              <Icon name="clock" size={24} color="#34495E" />
              <Text style={styles.statNumber}>{stats.avgServiceTime}</Text>
              <Text style={styles.statLabel}>Thời gian phục vụ TB</Text>
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
          <Text style={styles.sectionTitle}>Hoạt động chi nhánh</Text>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={[
                styles.activityIcon,
                { backgroundColor: getPriorityColor(activity.priority) }
              ]}>
                <Icon 
                  name={activity.type === 'order' ? 'shopping-bag' : 
                        activity.type === 'staff' ? 'user' :
                        activity.type === 'alert' ? 'alert-circle' : 'check-circle'} 
                  size={16} 
                  color="#fff" 
                />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              {activity.priority && (
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(activity.priority) }]}>
                  <Text style={styles.priorityText}>
                    {activity.priority === 'high' ? 'Cao' : 
                     activity.priority === 'medium' ? 'TB' : 'Thấp'}
                  </Text>
                </View>
              )}
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
          <Text style={styles.sectionTitle}>Quản lý chi nhánh</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManagerOrderManagement')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#3498DB', '#2980B9']}
                style={styles.actionGradient}
              >
                <Icon name="orders" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Quản lý đơn hàng</Text>
                <Text style={styles.actionSubtitle}>Theo dõi đơn chi nhánh</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManagerStaffManagement')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#9B59B6', '#8E44AD']}
                style={styles.actionGradient}
              >
                <Icon name="users" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Quản lý nhân viên</Text>
                <Text style={styles.actionSubtitle}>Nhân sự chi nhánh</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManagerTableManagement')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#E67E22', '#D35400']}
                style={styles.actionGradient}
              >
                <Icon name="grid" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Quản lý bàn</Text>
                <Text style={styles.actionSubtitle}>Trạng thái bàn</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManagerShiftManagement')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#27AE60', '#229954']}
                style={styles.actionGradient}
              >
                <Icon name="clock" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Quản lý ca làm</Text>
                <Text style={styles.actionSubtitle}>Lịch trình nhân viên</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManagerReports')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#F39C12', '#E67E22']}
                style={styles.actionGradient}
              >
                <Icon name="chart" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Báo cáo chi nhánh</Text>
                <Text style={styles.actionSubtitle}>Thống kê hiệu suất</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManagerProfile')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#34495E', '#2C3E50']}
                style={styles.actionGradient}
              >
                <Icon name="user" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Thông tin cá nhân</Text>
                <Text style={styles.actionSubtitle}>Hồ sơ manager</Text>
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
    backgroundColor: '#f8f9fa',
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

  branchName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
  },

  managerName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
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
    borderLeftColor: '#3498DB',
  },

  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },

  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },

  statCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#9B59B6',
  },

  statCardTable: {
    borderLeftWidth: 4,
    borderLeftColor: '#E67E22',
  },

  statCardTime: {
    borderLeftWidth: 4,
    borderLeftColor: '#34495E',
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

  statChange: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
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

  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ManagerDashboardScreen;