import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';

type ManagerOrderManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManagerOrderManagement'>;

interface Props {
  navigation: ManagerOrderManagementScreenNavigationProp;
}

interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
  totalAmount: number;
  orderTime: string;
  estimatedTime?: string;
  assignedStaff?: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

const ManagerOrderManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'served'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedFilter]);

  const loadOrders = async () => {
    try {
      // Mock orders data for branch
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: '#501',
          tableNumber: 'Bàn 8',
          customerName: 'Nguyễn Văn A',
          items: [
            { name: 'Phở bò đặc biệt', quantity: 2, price: 65000 },
            { name: 'Cà phê sữa đá', quantity: 1, price: 25000 },
          ],
          status: 'pending',
          totalAmount: 155000,
          orderTime: '2024-03-22T10:30:00Z',
          estimatedTime: '15 phút',
        },
        {
          id: '2',
          orderNumber: '#502',
          tableNumber: 'Bàn 12',
          customerName: 'Trần Thị B',
          items: [
            { name: 'Cơm tấm sườn nướng', quantity: 1, price: 55000 },
            { name: 'Nước chanh', quantity: 2, price: 15000 },
          ],
          status: 'preparing',
          totalAmount: 85000,
          orderTime: '2024-03-22T10:15:00Z',
          estimatedTime: '8 phút',
          assignedStaff: 'Nguyễn Văn C',
        },
        {
          id: '3',
          orderNumber: '#503',
          tableNumber: 'Bàn 5',
          customerName: 'Lê Văn D',
          items: [
            { name: 'Bánh mì thịt nướng', quantity: 3, price: 25000 },
          ],
          status: 'ready',
          totalAmount: 75000,
          orderTime: '2024-03-22T10:00:00Z',
          assignedStaff: 'Trần Thị E',
        },
        {
          id: '4',
          orderNumber: '#504',
          tableNumber: 'Bàn 3',
          customerName: 'Phạm Thị F',
          items: [
            { name: 'Bún bò Huế', quantity: 1, price: 45000 },
            { name: 'Chè ba màu', quantity: 1, price: 20000 },
          ],
          status: 'served',
          totalAmount: 65000,
          orderTime: '2024-03-22T09:45:00Z',
          assignedStaff: 'Hoàng Văn G',
        },
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(order => order.status === selectedFilter);
    }

    // Sort by order time (newest first)
    filtered.sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime());

    setFilteredOrders(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleUpdateStatus = (order: Order, newStatus: Order['status']) => {
    Alert.alert(
      'Cập nhật trạng thái',
      `Chuyển đơn hàng ${order.orderNumber} sang "${getStatusText(newStatus)}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => updateOrderStatus(order.id, newStatus) },
      ]
    );
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
  };

  const handleAssignStaff = (order: Order) => {
    Alert.alert(
      'Phân công nhân viên',
      'Chọn nhân viên phụ trách:',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Nguyễn Văn A', onPress: () => assignStaff(order.id, 'Nguyễn Văn A') },
        { text: 'Trần Thị B', onPress: () => assignStaff(order.id, 'Trần Thị B') },
        { text: 'Lê Văn C', onPress: () => assignStaff(order.id, 'Lê Văn C') },
      ]
    );
  };

  const assignStaff = (orderId: string, staffName: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, assignedStaff: staffName } : order
      )
    );
    Alert.alert('Thành công', `Đã phân công ${staffName} phụ trách đơn hàng`);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'preparing': return 'Đang chuẩn bị';
      case 'ready': return 'Sẵn sàng';
      case 'served': return 'Đã phục vụ';
      case 'paid': return 'Đã thanh toán';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F39C12';
      case 'preparing': return '#3498DB';
      case 'ready': return '#27AE60';
      case 'served': return '#9B59B6';
      case 'paid': return '#95A5A6';
      default: return '#95A5A6';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'served';
      case 'served': return 'paid';
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#3498DB', '#2980B9']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quản lý Đơn hàng</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Tất cả', count: orders.length },
            { key: 'pending', label: 'Chờ xử lý', count: orders.filter(o => o.status === 'pending').length },
            { key: 'preparing', label: 'Đang chuẩn bị', count: orders.filter(o => o.status === 'preparing').length },
            { key: 'ready', label: 'Sẵn sàng', count: orders.filter(o => o.status === 'ready').length },
            { key: 'served', label: 'Đã phục vụ', count: orders.filter(o => o.status === 'served').length },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.filterTabActive
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter.key && styles.filterTabTextActive
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Text style={styles.tableNumber}>{order.tableNumber}</Text>
              </View>
              <View style={styles.orderMeta}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusBadgeText}>{getStatusText(order.status)}</Text>
                </View>
                <Text style={styles.orderTime}>{formatTime(order.orderTime)}</Text>
              </View>
            </View>

            {/* Customer Info */}
            <View style={styles.customerInfo}>
              <Icon name="user" size={16} color="#666" />
              <Text style={styles.customerName}>{order.customerName}</Text>
              {order.estimatedTime && (
                <>
                  <Icon name="clock" size={16} color="#F39C12" />
                  <Text style={styles.estimatedTime}>{order.estimatedTime}</Text>
                </>
              )}
            </View>

            {/* Order Items */}
            <View style={styles.orderItems}>
              {order.items.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                </View>
              ))}
            </View>

            {/* Assigned Staff */}
            {order.assignedStaff && (
              <View style={styles.assignedStaff}>
                <Icon name="user-check" size={16} color="#27AE60" />
                <Text style={styles.assignedStaffText}>Phụ trách: {order.assignedStaff}</Text>
              </View>
            )}

            {/* Total Amount */}
            <View style={styles.orderTotal}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalAmount}>{formatCurrency(order.totalAmount)}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {!order.assignedStaff && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.assignButton]}
                  onPress={() => handleAssignStaff(order)}
                >
                  <Icon name="user-plus" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Phân công</Text>
                </TouchableOpacity>
              )}
              
              {getNextStatus(order.status) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.updateButton]}
                  onPress={() => handleUpdateStatus(order, getNextStatus(order.status)!)}
                >
                  <Icon name="arrow-right" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    {getStatusText(getNextStatus(order.status)!)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {filteredOrders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
          </View>
        )}
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
    marginBottom: 16,
  },

  headerGradient: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  headerRight: {
    width: 40,
  },

  // Filter Styles
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  filterTabActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },

  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  filterTabTextActive: {
    color: '#fff',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Order Card Styles
  orderCard: {
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

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  tableNumber: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  orderMeta: {
    alignItems: 'flex-end',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  orderTime: {
    fontSize: 12,
    color: '#666',
  },

  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  customerName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  estimatedTime: {
    fontSize: 12,
    color: '#F39C12',
    fontWeight: '600',
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
    color: '#666',
    fontWeight: '600',
  },

  assignedStaff: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
  },

  assignedStaffText: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
  },

  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 12,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3498DB',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },

  assignButton: {
    backgroundColor: '#9B59B6',
  },

  updateButton: {
    backgroundColor: '#27AE60',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ManagerOrderManagementScreen;