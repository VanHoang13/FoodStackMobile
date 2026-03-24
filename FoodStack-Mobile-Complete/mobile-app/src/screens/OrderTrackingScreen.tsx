import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { orderApi } from '../services/api';
import { theme } from '../theme';
import Icon from '../components/Icon';

type OrderTrackingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderTracking'>;

interface Props {
  navigation: OrderTrackingScreenNavigationProp;
  route: {
    params: {
      orderId: string;
      orderNumber?: string;
    };
  };
}

interface OrderStatus {
  status: string;
  timestamp: string;
  description: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  customerCount: number;
  table: {
    name: string;
    area: {
      name: string;
    };
  };
  branch: {
    name: string;
    restaurant: {
      name: string;
    };
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    subtotal: number;
    notes?: string;
    menuItem: {
      name: string;
      description?: string;
      imageUrl?: string;
    };
  }>;
  statusHistory?: OrderStatus[];
}

const ORDER_STATUSES = {
  PENDING: { label: 'Chờ xác nhận', color: '#F39C12', icon: 'clock' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#3498DB', icon: 'check' },
  PREPARING: { label: 'Đang chuẩn bị', color: '#E67E22', icon: 'chef-hat' },
  READY: { label: 'Sẵn sàng', color: '#27AE60', icon: 'bell' },
  SERVED: { label: 'Đã phục vụ', color: '#2ECC71', icon: 'utensils' },
  COMPLETED: { label: 'Hoàn thành', color: '#16A085', icon: 'check-circle' },
  CANCELLED: { label: 'Đã hủy', color: '#E74C3C', icon: 'x-circle' },
};

const OrderTrackingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId, orderNumber } = route.params;
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderDetails();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadOrderDetails, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setError(null);
      
      const response = await orderApi.getOrderDetails(orderId);
      
      if (response.success) {
        setOrderDetails(response.data);
      } else {
        setError(response.message || 'Không thể tải thông tin đơn hàng');
      }
    } catch (err) {
      console.error('❌ Load order details error:', err);
      setError('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrderDetails();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusProgress = (currentStatus: string) => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return currentIndex >= 0 ? currentIndex : 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8622A" />
          <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !orderDetails) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Không thể tải đơn hàng</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOrderDetails}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatusInfo = ORDER_STATUSES[orderDetails.status as keyof typeof ORDER_STATUSES];
  const progress = getStatusProgress(orderDetails.status);

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
        <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <LinearGradient
            colors={[currentStatusInfo.color, currentStatusInfo.color + '80']}
            style={styles.orderHeaderGradient}
          >
            <View style={styles.orderHeaderContent}>
              <View style={styles.orderNumberContainer}>
                <Text style={styles.orderNumber}>#{orderDetails.orderNumber}</Text>
                <Text style={styles.orderTime}>
                  Đặt lúc {formatTime(orderDetails.createdAt)}
                </Text>
              </View>
              
              <View style={styles.statusContainer}>
                <View style={[styles.statusIcon, { backgroundColor: currentStatusInfo.color }]}>
                  <Icon name={currentStatusInfo.icon} size={20} color="#fff" />
                </View>
                <Text style={styles.statusText}>{currentStatusInfo.label}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Progress Tracker */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Trạng thái đơn hàng</Text>
          
          <View style={styles.progressTracker}>
            {Object.entries(ORDER_STATUSES).slice(0, 6).map(([status, info], index) => {
              const isActive = index <= progress;
              const isCurrent = orderDetails.status === status;
              
              return (
                <View key={status} style={styles.progressStep}>
                  <View style={styles.progressStepContent}>
                    <View style={[
                      styles.progressStepIcon,
                      isActive && styles.progressStepIconActive,
                      isCurrent && styles.progressStepIconCurrent,
                    ]}>
                      <Icon 
                        name={info.icon} 
                        size={16} 
                        color={isActive ? '#fff' : '#ccc'} 
                      />
                    </View>
                    
                    <Text style={[
                      styles.progressStepLabel,
                      isActive && styles.progressStepLabelActive,
                    ]}>
                      {info.label}
                    </Text>
                  </View>
                  
                  {index < 5 && (
                    <View style={[
                      styles.progressLine,
                      isActive && styles.progressLineActive,
                    ]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Mã QR đơn hàng</Text>
          <Text style={styles.qrDescription}>
            Hiển thị mã này cho nhân viên khi cần hỗ trợ
          </Text>
          
          <View style={styles.qrCodeWrapper}>
            <Image
              source={{ 
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORDER-${orderDetails.orderNumber}-${orderDetails.id}&bgcolor=FFFFFF&color=000000&margin=10`
              }}
              style={styles.qrCodeImage}
              resizeMode="contain"
            />
            
            <View style={styles.qrInfo}>
              <Text style={styles.qrOrderNumber}>#{orderDetails.orderNumber}</Text>
              <Text style={styles.qrOrderId}>ID: {orderDetails.id.slice(0, 8)}</Text>
              <Text style={styles.qrTableInfo}>
                Bàn {orderDetails.table.name} - {orderDetails.table.area.name}
              </Text>
            </View>
          </View>
          
          <View style={styles.qrActions}>
            <TouchableOpacity 
              style={styles.qrActionButton}
              onPress={() => {
                navigation.navigate('OrderQR', {
                  orderId: orderDetails.id,
                  orderNumber: orderDetails.orderNumber,
                  tableInfo: orderDetails.table,
                  restaurantName: orderDetails.branch.restaurant.name
                });
              }}
            >
              <Icon name="maximize" size={16} color="#E8622A" />
              <Text style={[styles.qrActionText, { color: '#E8622A' }]}>Xem lớn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.qrActionButton}
              onPress={() => {
                // Mock share functionality
                Alert.alert(
                  'Chia sẻ QR Code',
                  'Chức năng chia sẻ QR code đã được kích hoạt (demo)',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Icon name="share" size={16} color="#3498DB" />
              <Text style={styles.qrActionText}>Chia sẻ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.qrActionButton}
              onPress={() => {
                // Mock save functionality
                Alert.alert(
                  'Lưu QR Code',
                  'QR code đã được lưu vào thư viện ảnh (demo)',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Icon name="download" size={16} color="#27AE60" />
              <Text style={styles.qrActionText}>Lưu ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Restaurant & Table Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Thông tin đơn hàng</Text>
          
          <View style={styles.infoRow}>
            <Icon name="home" size={16} color="#666" />
            <Text style={styles.infoText}>
              {orderDetails.branch.restaurant.name}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="map-pin" size={16} color="#666" />
            <Text style={styles.infoText}>
              Bàn {orderDetails.table.name} - {orderDetails.table.area.name}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="users" size={16} color="#666" />
            <Text style={styles.infoText}>
              {orderDetails.customerCount} khách
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsTitle}>Chi tiết đơn hàng</Text>
          
          {orderDetails.orderItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemContent}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{item.menuItem.name}</Text>
                  {item.notes && (
                    <Text style={styles.orderItemNotes}>Ghi chú: {item.notes}</Text>
                  )}
                  <Text style={styles.orderItemPrice}>
                    {formatPrice(item.price)} x {item.quantity}
                  </Text>
                </View>
                
                <Text style={styles.orderItemTotal}>
                  {formatPrice(item.subtotal)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Tổng cộng</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatPrice(orderDetails.subtotal)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí dịch vụ</Text>
            <Text style={styles.summaryValue}>{formatPrice(orderDetails.serviceCharge)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Thuế</Text>
            <Text style={styles.summaryValue}>{formatPrice(orderDetails.tax)}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Tổng cộng</Text>
            <Text style={styles.summaryTotalAmount}>
              {formatPrice(orderDetails.total)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {(orderDetails.status === 'PENDING' || orderDetails.status === 'CONFIRMED') && (
            <TouchableOpacity 
              style={styles.modifyButton}
              onPress={() => navigation.navigate('OrderModification', {
                orderId: orderDetails.id,
                orderNumber: orderDetails.orderNumber
              })}
            >
              <Icon name="edit" size={18} color="#3498DB" />
              <Text style={styles.modifyButtonText}>Chỉnh sửa đơn hàng</Text>
            </TouchableOpacity>
          )}
          
          {orderDetails.status === 'READY' && (
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#27AE60', '#2ECC71']}
                style={styles.actionButtonGradient}
              >
                <Icon name="bell" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Món đã sẵn sàng!</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.serviceButton}
            onPress={() => navigation.navigate('ServiceRequest', { 
              tableInfo: { 
                table: orderDetails.table, 
                branch: orderDetails.branch 
              } 
            })}
          >
            <Icon name="bell" size={18} color="#E8622A" />
            <Text style={styles.serviceButtonText}>Gọi nhân viên</Text>
          </TouchableOpacity>
        </View>
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

  headerRight: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
  },

  // Order Header
  orderHeader: {
    marginBottom: 16,
  },

  orderHeaderGradient: {
    padding: 20,
  },

  orderHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  orderNumberContainer: {
    flex: 1,
  },

  orderNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },

  orderTime: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  statusContainer: {
    alignItems: 'center',
  },

  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

  // Progress Tracker
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },

  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  progressTracker: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressStep: {
    flex: 1,
    alignItems: 'center',
  },

  progressStepContent: {
    alignItems: 'center',
  },

  progressStepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  progressStepIconActive: {
    backgroundColor: '#E8622A',
  },

  progressStepIconCurrent: {
    backgroundColor: '#27AE60',
  },

  progressStepLabel: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    fontWeight: '600',
  },

  progressStepLabelActive: {
    color: '#333',
  },

  progressLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#f0f0f0',
    zIndex: -1,
  },

  progressLineActive: {
    backgroundColor: '#E8622A',
  },

  // QR Code
  qrContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },

  qrTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },

  qrDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },

  qrCodeWrapper: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
  },

  qrCodeImage: {
    width: 150,
    height: 150,
    marginBottom: 12,
  },

  qrInfo: {
    alignItems: 'center',
  },

  qrOrderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8622A',
    marginBottom: 2,
  },

  qrOrderId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },

  qrTableInfo: {
    fontSize: 12,
    color: '#666',
  },

  qrActions: {
    flexDirection: 'row',
    gap: 16,
  },

  qrActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    gap: 6,
  },

  qrActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },

  // Info
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },

  infoText: {
    fontSize: 14,
    color: '#666',
  },

  // Items
  itemsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },

  itemsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  orderItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
    marginBottom: 12,
  },

  orderItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  orderItemInfo: {
    flex: 1,
  },

  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  orderItemNotes: {
    fontSize: 12,
    color: '#E8622A',
    fontStyle: 'italic',
    marginBottom: 4,
  },

  orderItemPrice: {
    fontSize: 12,
    color: '#666',
  },

  orderItemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E8622A',
  },

  // Summary
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },

  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },

  summaryTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  summaryTotalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8622A',
  },

  // Actions
  actionsContainer: {
    padding: 16,
    paddingBottom: 32,
  },

  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    ...theme.shadows.md,
  },

  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },

  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8622A',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },

  serviceButtonText: {
    color: '#E8622A',
    fontSize: 14,
    fontWeight: '600',
  },

  modifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3498DB',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 8,
  },

  modifyButtonText: {
    color: '#3498DB',
    fontSize: 14,
    fontWeight: '600',
  },

  // Loading & Error
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

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },

  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },

  retryButton: {
    backgroundColor: '#E8622A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderTrackingScreen;