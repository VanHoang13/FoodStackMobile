import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../contexts/AuthContext';

type StaffOrderHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffOrderHistory'>;

interface Props {
  navigation: StaffOrderHistoryScreenNavigationProp;
}

interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  table: string;
  customerName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: 'CASH' | 'CARD' | 'DIGITAL_WALLET';
  createdAt: string;
  completedAt?: string;
  handledBy: string;
}

const ORDER_STATUS_COLORS = {
  COMPLETED: '#27AE60',
  CANCELLED: '#E74C3C',
  REFUNDED: '#F39C12',
};

const PAYMENT_METHODS = {
  CASH: { icon: 'dollar-sign', label: 'Tiền mặt' },
  CARD: { icon: 'credit-card', label: 'Thẻ' },
  DIGITAL_WALLET: { icon: 'smartphone', label: 'Ví điện tử' },
};

const StaffOrderHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    loadOrderHistory();
  }, [selectedPeriod, selectedStatus]);

  const loadOrderHistory = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock order history data
      const mockOrders: OrderHistoryItem[] = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          table: 'B05',
          customerName: 'Nguyễn Văn A',
          items: [
            { name: 'Phở bò tái', quantity: 2, price: 65000 },
            { name: 'Nước ngọt', quantity: 2, price: 15000 },
          ],
          totalAmount: 160000,
          status: 'COMPLETED',
          paymentMethod: 'CASH',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          handledBy: user?.fullName || 'Nhân viên',
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          table: 'A03',
          customerName: 'Trần Thị B',
          items: [
            { name: 'Bún bò Huế', quantity: 1, price: 55000 },
            { name: 'Chả cá', quantity: 1, price: 45000 },
          ],
          totalAmount: 100000,
          status: 'COMPLETED',
          paymentMethod: 'CARD',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
          handledBy: user?.fullName || 'Nhân viên',
        },
        {
          id: '3',
          orderNumber: 'ORD-003',
          table: 'C02',
          customerName: 'Lê Văn C',
          items: [
            { name: 'Cơm tấm', quantity: 1, price: 45000 },
          ],
          totalAmount: 45000,
          status: 'CANCELLED',
          paymentMethod: 'CASH',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          handledBy: user?.fullName || 'Nhân viên',
        },
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading order history:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }
    
    return filtered;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getOrderDuration = (createdAt: string, completedAt?: string) => {
    if (!completedAt) return null;
    
    const created = new Date(createdAt);
    const completed = new Date(completedAt);
    const diffInMinutes = Math.floor((completed.getTime() - created.getTime()) / (1000 * 60));
    
    return `${diffInMinutes} phút`;
  };

  const getTotalStats = () => {
    const filtered = getFilteredOrders();
    const completed = filtered.filter(o => o.status === 'COMPLETED');
    
    return {
      totalOrders: filtered.length,
      completedOrders: completed.length,
      totalRevenue: completed.reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: completed.length > 0 
        ? completed.reduce((sum, order) => sum + order.totalAmount, 0) / completed.length 
        : 0,
    };
  };

  const stats = getTotalStats();
  const filteredOrders = getFilteredOrders();

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
        
        <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>

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

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Tổng đơn</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completedOrders}</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
            <Text style={styles.statLabel}>Doanh thu</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(stats.averageOrderValue)}</Text>
            <Text style={styles.statLabel}>Trung bình</Text>
          </View>
        </View>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'ALL', label: 'Tất cả', count: orders.length },
            { key: 'COMPLETED', label: 'Hoàn thành', count: orders.filter(o => o.status === 'COMPLETED').length },
            { key: 'CANCELLED', label: 'Đã hủy', count: orders.filter(o => o.status === 'CANCELLED').length },
            { key: 'REFUNDED', label: 'Hoàn tiền', count: orders.filter(o => o.status === 'REFUNDED').length },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedStatus === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(filter.key)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedStatus === filter.key && styles.filterButtonTextActive,
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Không có đơn hàng</Text>
            <Text style={styles.emptyMessage}>
              Chưa có đơn hàng nào trong khoảng thời gian này
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderLeft}>
                    <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                    <Text style={styles.orderTable}>Bàn {order.table}</Text>
                  </View>
                  
                  <View style={styles.orderRight}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: ORDER_STATUS_COLORS[order.status] }
                    ]}>
                      <Text style={styles.statusText}>
                        {order.status === 'COMPLETED' ? 'Hoàn thành' :
                         order.status === 'CANCELLED' ? 'Đã hủy' : 'Hoàn tiền'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.orderInfo}>
                  <Text style={styles.customerName}>{order.customerName}</Text>
                  <Text style={styles.orderTime}>
                    {formatTime(order.createdAt)} - {formatDate(order.createdAt)}
                  </Text>
                </View>

                <View style={styles.orderItems}>
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <Text style={styles.itemName}>
                        {item.quantity}x {item.name}
                      </Text>
                      <Text style={styles.itemPrice}>
                        {formatCurrency(item.price * item.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.paymentInfo}>
                    <Icon 
                      name={PAYMENT_METHODS[order.paymentMethod].icon} 
                      size={16} 
                      color="#666" 
                    />
                    <Text style={styles.paymentMethod}>
                      {PAYMENT_METHODS[order.paymentMethod].label}
                    </Text>
                  </View>
                  
                  <Text style={styles.totalAmount}>
                    {formatCurrency(order.totalAmount)}
                  </Text>
                </View>

                {order.completedAt && (
                  <View style={styles.orderMeta}>
                    <Text style={styles.metaText}>
                      Thời gian xử lý: {getOrderDuration(order.createdAt, order.completedAt)}
                    </Text>
                    <Text style={styles.metaText}>
                      Xử lý bởi: {order.handledBy}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

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
  
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  
  filterButtonActive: {
    backgroundColor: '#E8622A',
  },
  
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  filterButtonTextActive: {
    color: '#fff',
  },
  
  content: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  ordersList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  orderRight: {
    alignItems: 'flex-end',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  
  orderInfo: {
    marginBottom: 12,
  },
  
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  orderTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  orderItems: {
    marginBottom: 12,
  },
  
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  
  itemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  paymentMethod: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E8622A',
  },
  
  orderMeta: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 2,
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

export default StaffOrderHistoryScreen;