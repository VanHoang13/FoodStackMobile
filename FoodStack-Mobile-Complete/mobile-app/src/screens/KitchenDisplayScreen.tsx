import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type KitchenDisplayScreenNavigationProp = StackNavigationProp<RootStackParamList, 'KitchenDisplay'>;

interface Props {
  navigation: KitchenDisplayScreenNavigationProp;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  customizations?: string[];
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  estimatedTime: number; // minutes
  elapsedTime: number; // minutes
  table: {
    name: string;
    area: string;
  };
  items: OrderItem[];
  customerCount: number;
  specialInstructions?: string;
}

const ORDER_STATUSES = {
  PENDING: { label: 'Chờ xử lý', color: '#F39C12', icon: 'clock' },
  PREPARING: { label: 'Đang chuẩn bị', color: '#E67E22', icon: 'chef-hat' },
  READY: { label: 'Sẵn sàng', color: '#27AE60', icon: 'bell' },
  SERVED: { label: 'Đã phục vụ', color: '#2ECC71', icon: 'check-circle' },
};

const PRIORITY_COLORS = {
  LOW: '#95A5A6',
  NORMAL: '#3498DB',
  HIGH: '#E67E22',
  URGENT: '#E74C3C',
};

const KitchenDisplayScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    loadOrders();
    
    // Set up real-time updates
    const interval = setInterval(loadOrders, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock kitchen orders data
      const mockOrders: KitchenOrder[] = [
        {
          id: '1',
          orderNumber: 'ORD-20240322-001',
          status: 'PENDING',
          priority: 'HIGH',
          createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
          estimatedTime: 15,
          elapsedTime: 5,
          table: { name: 'B01', area: 'VIP' },
          customerCount: 4,
          items: [
            { id: '1', name: 'Phở Bò Tái', quantity: 2, notes: 'Ít hành' },
            { id: '2', name: 'Bún Chả', quantity: 1 },
            { id: '3', name: 'Chả Cá Lã Vọng', quantity: 1, customizations: ['Thêm rau thơm'] },
          ],
          specialInstructions: 'Khách có dị ứng tôm cua',
        },
        {
          id: '2',
          orderNumber: 'ORD-20240322-002',
          status: 'PREPARING',
          priority: 'NORMAL',
          createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
          estimatedTime: 20,
          elapsedTime: 12,
          table: { name: 'A05', area: 'Chính' },
          customerCount: 2,
          items: [
            { id: '4', name: 'Gỏi Cuốn Tôm', quantity: 2 },
            { id: '5', name: 'Bánh Mì Thịt Nướng', quantity: 1 },
          ],
        },
        {
          id: '3',
          orderNumber: 'ORD-20240322-003',
          status: 'READY',
          priority: 'URGENT',
          createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
          estimatedTime: 18,
          elapsedTime: 25,
          table: { name: 'C12', area: 'Ngoài trời' },
          customerCount: 6,
          items: [
            { id: '6', name: 'Lẩu Thái', quantity: 1, notes: 'Cay vừa' },
            { id: '7', name: 'Cơm Trắng', quantity: 6 },
          ],
        },
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('❌ Load orders error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as any }
            : order
        )
      );

      // Show success message
      const statusLabel = ORDER_STATUSES[newStatus as keyof typeof ORDER_STATUSES]?.label;
      Alert.alert('Thành công', `Đơn hàng đã chuyển sang trạng thái: ${statusLabel}`);
    } catch (error) {
      console.error('❌ Update order status error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimeColor = (elapsedTime: number, estimatedTime: number) => {
    const ratio = elapsedTime / estimatedTime;
    if (ratio >= 1.2) return '#E74C3C'; // Over time
    if (ratio >= 0.8) return '#E67E22'; // Warning
    return '#27AE60'; // On time
  };

  const filteredOrders = selectedStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const statusCounts = {
    ALL: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    PREPARING: orders.filter(o => o.status === 'PREPARING').length,
    READY: orders.filter(o => o.status === 'READY').length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8622A" />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
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
          onPress={() => {
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
          }}
        >
          <Icon name="log-out" size={20} color="#e74c3c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Màn hình bếp</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Icon name="refresh-cw" size={20} color="#E8622A" />
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'PENDING', label: 'Chờ xử lý' },
            { key: 'PREPARING', label: 'Đang chuẩn bị' },
            { key: 'READY', label: 'Sẵn sàng' },
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
                {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
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
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍳</Text>
            <Text style={styles.emptyTitle}>Không có đơn hàng</Text>
            <Text style={styles.emptyMessage}>
              {selectedStatus === 'ALL' 
                ? 'Chưa có đơn hàng nào trong bếp'
                : `Không có đơn hàng ở trạng thái "${ORDER_STATUSES[selectedStatus as keyof typeof ORDER_STATUSES]?.label}"`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                    <View style={styles.orderMeta}>
                      <View style={styles.tableInfo}>
                        <Icon name="map-pin" size={12} color="#666" />
                        <Text style={styles.tableText}>
                          Bàn {order.table.name} - {order.table.area}
                        </Text>
                      </View>
                      <View style={styles.customerInfo}>
                        <Icon name="users" size={12} color="#666" />
                        <Text style={styles.customerText}>{order.customerCount} khách</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.orderStatus}>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: PRIORITY_COLORS[order.priority] }
                    ]}>
                      <Text style={styles.priorityText}>{order.priority}</Text>
                    </View>
                    
                    <View style={styles.timeInfo}>
                      <Text style={[
                        styles.timeText,
                        { color: getTimeColor(order.elapsedTime, order.estimatedTime) }
                      ]}>
                        {order.elapsedTime}m / {order.estimatedTime}m
                      </Text>
                      <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
                    </View>
                  </View>
                </View>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <View style={styles.specialInstructions}>
                    <Icon name="alert-triangle" size={14} color="#E67E22" />
                    <Text style={styles.specialInstructionsText}>
                      {order.specialInstructions}
                    </Text>
                  </View>
                )}

                {/* Order Items */}
                <View style={styles.orderItems}>
                  {order.items.map((item) => (
                    <View key={item.id} style={styles.orderItem}>
                      <View style={styles.itemQuantity}>
                        <Text style={styles.quantityText}>{item.quantity}x</Text>
                      </View>
                      
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        
                        {item.customizations && item.customizations.length > 0 && (
                          <View style={styles.customizations}>
                            {item.customizations.map((custom, index) => (
                              <Text key={index} style={styles.customizationText}>
                                • {custom}
                              </Text>
                            ))}
                          </View>
                        )}
                        
                        {item.notes && (
                          <Text style={styles.itemNotes}>Ghi chú: {item.notes}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.orderActions}>
                  {order.status === 'PENDING' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.startButton]}
                      onPress={() => updateOrderStatus(order.id, 'PREPARING')}
                    >
                      <Icon name="play" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Bắt đầu</Text>
                    </TouchableOpacity>
                  )}
                  
                  {order.status === 'PREPARING' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.readyButton]}
                      onPress={() => updateOrderStatus(order.id, 'READY')}
                    >
                      <Icon name="check" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Hoàn thành</Text>
                    </TouchableOpacity>
                  )}
                  
                  {order.status === 'READY' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.servedButton]}
                      onPress={() => updateOrderStatus(order.id, 'SERVED')}
                    >
                      <Icon name="bell" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Đã phục vụ</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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

  // Filter
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    marginRight: 8,
  },

  filterButtonActive: {
    backgroundColor: '#E8622A',
  },

  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },

  filterButtonTextActive: {
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
  },

  ordersContainer: {
    padding: 16,
  },

  // Order Card
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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

  orderMeta: {
    flexDirection: 'row',
    gap: 16,
  },

  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  tableText: {
    fontSize: 12,
    color: '#666',
  },

  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  customerText: {
    fontSize: 12,
    color: '#666',
  },

  orderStatus: {
    alignItems: 'flex-end',
  },

  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },

  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },

  timeInfo: {
    alignItems: 'flex-end',
  },

  timeText: {
    fontSize: 14,
    fontWeight: '700',
  },

  orderTime: {
    fontSize: 12,
    color: '#666',
  },

  // Special Instructions
  specialInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },

  specialInstructionsText: {
    fontSize: 12,
    color: '#E67E22',
    fontWeight: '600',
    flex: 1,
  },

  // Order Items
  orderItems: {
    marginBottom: 16,
  },

  orderItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  itemQuantity: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8622A',
  },

  itemDetails: {
    flex: 1,
  },

  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  customizations: {
    marginBottom: 2,
  },

  customizationText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 1,
  },

  itemNotes: {
    fontSize: 12,
    color: '#E8622A',
    fontStyle: 'italic',
  },

  // Actions
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },

  startButton: {
    backgroundColor: '#3498DB',
  },

  readyButton: {
    backgroundColor: '#27AE60',
  },

  servedButton: {
    backgroundColor: '#E8622A',
  },

  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },

  emptyIcon: {
    fontSize: 80,
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

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default KitchenDisplayScreen;