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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import StaffOrderService, { StaffOrder, OrderItem } from '../services/staffOrderService';

type StaffOrderManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffOrderManagement'>;

interface Props {
  navigation: StaffOrderManagementScreenNavigationProp;
}

const StaffOrderManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const statusFilters = [
    { key: 'ALL', label: 'Tất cả', color: '#95A5A6' },
    { key: 'PENDING', label: 'Chờ xác nhận', color: '#F39C12' },
    { key: 'CONFIRMED', label: 'Đã xác nhận', color: '#3498DB' },
    { key: 'PREPARING', label: 'Đang chuẩn bị', color: '#E67E22' },
    { key: 'READY', label: 'Sẵn sàng', color: '#27AE60' },
    { key: 'SERVED', label: 'Đã phục vụ', color: '#2ECC71' },
  ];

  useEffect(() => {
    loadOrders();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      // Only initialize mock data if no real data exists
      const existingOrders = await StaffOrderService.getOrders();
      if (existingOrders.length === 0) {
        await StaffOrderService.initializeMockData();
      }
      
      // Load orders from service
      const staffOrders = await StaffOrderService.getOrders();
      setOrders(staffOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="back" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadOrders}>
          <Icon name="refresh-cw" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Status Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedStatus === filter.key && styles.filterChipActive
            ]}
            onPress={() => setSelectedStatus(filter.key)}
          >
            <Text style={[
              styles.filterText,
              selectedStatus === filter.key && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadOrders} />
        }
      >
        {/* Orders List */}
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.tableNumber}>Bàn {order.table}</Text>
              </View>
              <View style={styles.orderStatus}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) }
                ]}>
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
                <Text style={styles.orderTime}>
                  {formatTime(order.orderTime)}
                </Text>
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.orderItems}>
              {order.items.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <Text style={styles.itemName}>
                    {item.quantity}x {item.name}
                  </Text>
                  {item.customizations && (
                    <Text style={styles.itemCustomizations}>
                      {item.customizations.join(', ')}
                    </Text>
                  )}
                  {item.notes && (
                    <Text style={styles.itemNotes}>Ghi chú: {item.notes}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Special Requests */}
            {order.specialRequests && (
              <View style={styles.specialRequests}>
                <Icon name="alert-circle" size={16} color="#F39C12" />
                <Text style={styles.specialRequestsText}>
                  Yêu cầu đặc biệt: {order.specialRequests}
                </Text>
              </View>
            )}

            {/* Order Actions */}
            <View style={styles.orderActions}>
              {renderOrderActions(order)}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  function getStatusColor(status: string): string {
    const statusColors = {
      'PENDING': '#F39C12',
      'CONFIRMED': '#3498DB', 
      'PREPARING': '#E67E22',
      'READY': '#27AE60',
      'SERVED': '#2ECC71',
      'COMPLETED': '#95A5A6'
    };
    return statusColors[status] || '#95A5A6';
  }

  function getStatusText(status: string): string {
    const statusTexts = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'PREPARING': 'Đang chuẩn bị', 
      'READY': 'Sẵn sàng',
      'SERVED': 'Đã phục vụ',
      'COMPLETED': 'Hoàn thành'
    };
    return statusTexts[status] || status;
  }

  function formatTime(timeString: string): string {
    const time = new Date(timeString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    
    return time.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  function renderOrderActions(order: StaffOrder) {
    switch (order.status) {
      case 'PENDING':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => updateOrderStatus(order.id, 'CONFIRMED')}
            >
              <Icon name="check" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => rejectOrder(order.id)}
            >
              <Icon name="x" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Từ chối</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'CONFIRMED':
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.prepareButton]}
            onPress={() => updateOrderStatus(order.id, 'PREPARING')}
          >
            <Icon name="chef-hat" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Chuyển bếp</Text>
          </TouchableOpacity>
        );
      
      case 'READY':
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.serveButton]}
            onPress={() => updateOrderStatus(order.id, 'SERVED')}
          >
            <Icon name="truck" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Đã phục vụ</Text>
          </TouchableOpacity>
        );
      
      default:
        return null;
    }
  }

  function updateOrderStatus(orderId: string, newStatus: string) {
    StaffOrderService.updateOrderStatus(orderId, newStatus as any)
      .then(() => {
        loadOrders(); // Refresh the list
        Alert.alert('Thành công', `Đã cập nhật trạng thái đơn hàng`);
      })
      .catch((error) => {
        console.error('Error updating order status:', error);
        Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng');
      });
  }

  function rejectOrder(orderId: string) {
    Alert.alert(
      'Từ chối đơn hàng',
      'Bạn có chắc chắn muốn từ chối đơn hàng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: () => {
            StaffOrderService.rejectOrder(orderId)
              .then(() => {
                loadOrders(); // Refresh the list
                Alert.alert('Đã từ chối', 'Đơn hàng đã được từ chối');
              })
              .catch((error) => {
                console.error('Error rejecting order:', error);
                Alert.alert('Lỗi', 'Không thể từ chối đơn hàng');
              });
          }
        }
      ]
    );
  }
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Filters
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    marginRight: 8,
  },

  filterChipActive: {
    backgroundColor: '#E8622A',
  },

  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  filterTextActive: {
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
    padding: 16,
  },

  // Order Card
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  orderInfo: {
    flex: 1,
  },

  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },

  customerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },

  tableNumber: {
    fontSize: 14,
    color: '#E8622A',
    fontWeight: '600',
  },

  orderStatus: {
    alignItems: 'flex-end',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },

  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

  orderTime: {
    fontSize: 12,
    color: '#999',
  },

  // Order Items
  orderItems: {
    marginBottom: 12,
  },

  orderItem: {
    paddingVertical: 4,
  },

  itemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  itemCustomizations: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  itemNotes: {
    fontSize: 12,
    color: '#F39C12',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Special Requests
  specialRequests: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },

  specialRequestsText: {
    fontSize: 12,
    color: '#F57F17',
    marginLeft: 6,
    flex: 1,
  },

  // Actions
  orderActions: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    flex: 1,
  },

  confirmButton: {
    backgroundColor: '#27AE60',
  },

  rejectButton: {
    backgroundColor: '#E74C3C',
  },

  prepareButton: {
    backgroundColor: '#E67E22',
  },

  serveButton: {
    backgroundColor: '#2ECC71',
  },

  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default StaffOrderManagementScreen;