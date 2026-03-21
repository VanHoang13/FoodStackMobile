import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;

interface Props {
  navigation: PaymentScreenNavigationProp;
  route: {
    params: {
      orderId: string;
      sessionToken?: string;
      tableInfo?: any;
    };
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  available: boolean;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'payos',
    name: 'PayOS',
    description: 'Thanh toán qua PayOS (QR Code)',
    icon: 'credit-card',
    color: '#E8622A',
    available: true,
  },
  {
    id: 'momo',
    name: 'MoMo',
    description: 'Ví điện tử MoMo',
    icon: 'smartphone',
    color: '#D82D8B',
    available: true,
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    description: 'Ví điện tử ZaloPay',
    icon: 'zap',
    color: '#0068FF',
    available: true,
  },
  {
    id: 'banking',
    name: 'Internet Banking',
    description: 'Chuyển khoản ngân hàng',
    icon: 'home',
    color: '#27AE60',
    available: true,
  },
  {
    id: 'cash',
    name: 'Tiền mặt',
    description: 'Thanh toán trực tiếp tại quầy',
    icon: 'dollar-sign',
    color: '#F39C12',
    available: true,
  },
];

const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId, sessionToken, tableInfo } = route.params;
  const [loading, setLoading] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    loadOrderSummary();
  }, [orderId]);

  const loadOrderSummary = async () => {
    setLoading(true);
    try {
      // Simulate API call to get order summary
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock order data
      setOrderSummary({
        id: orderId,
        orderNumber: 'ORD-20240322-001',
        subtotal: 450000,
        tax: 45000,
        serviceCharge: 22500,
        total: 517500,
        items: [
          { name: 'Phở Bò Tái', quantity: 2, price: 85000, subtotal: 170000 },
          { name: 'Gỏi Cuốn Tôm', quantity: 1, price: 65000, subtotal: 65000 },
          { name: 'Chả Cá Lã Vọng', quantity: 1, price: 120000, subtotal: 120000 },
          { name: 'Trà Đá', quantity: 3, price: 15000, subtotal: 45000 },
          { name: 'Bia Saigon', quantity: 2, price: 25000, subtotal: 50000 },
        ],
      });
    } catch (error) {
      console.error('❌ Load order summary error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (method: PaymentMethod) => {
    if (!orderSummary) return;

    setSelectedMethod(method.id);
    setPaymentLoading(true);

    try {
      if (method.id === 'cash') {
        // Cash payment - just show confirmation
        Alert.alert(
          'Thanh toán tiền mặt',
          'Vui lòng thanh toán tại quầy. Nhân viên sẽ hỗ trợ bạn.',
          [
            {
              text: 'Đã hiểu',
              onPress: () => {
                navigation.navigate('OrderTracking', { 
                  orderId: orderSummary.id,
                  orderNumber: orderSummary.orderNumber 
                });
              },
            },
          ]
        );
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (method.id === 'payos') {
        // PayOS payment - simulate QR code generation
        const paymentUrl = `https://pay.payos.vn/web/${orderId}`;
        
        Alert.alert(
          'Thanh toán PayOS',
          'Bạn sẽ được chuyển đến trang thanh toán PayOS',
          [
            {
              text: 'Hủy',
              style: 'cancel',
            },
            {
              text: 'Tiếp tục',
              onPress: () => {
                Linking.openURL(paymentUrl).catch(() => {
                  Alert.alert('Lỗi', 'Không thể mở trang thanh toán');
                });
              },
            },
          ]
        );
      } else {
        // Other payment methods
        Alert.alert(
          'Thanh toán thành công!',
          `Đơn hàng #${orderSummary.orderNumber} đã được thanh toán qua ${method.name}`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('OrderTracking', { 
                  orderId: orderSummary.id,
                  orderNumber: orderSummary.orderNumber 
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      Alert.alert('Lỗi thanh toán', 'Không thể xử lý thanh toán, vui lòng thử lại');
    } finally {
      setPaymentLoading(false);
      setSelectedMethod(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8622A" />
          <Text style={styles.loadingText}>Đang tải thông tin thanh toán...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderSummary) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Không thể tải đơn hàng</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOrderSummary}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
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
          <Icon name="back" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Đơn hàng #{orderSummary.orderNumber}</Text>
          
          {/* Table Info */}
          {tableInfo && (
            <View style={styles.tableInfo}>
              <Icon name="map-pin" size={16} color="#666" />
              <Text style={styles.tableInfoText}>
                Bàn {tableInfo.table?.name} - {tableInfo.restaurant?.name || tableInfo.branch?.restaurant?.name}
              </Text>
            </View>
          )}

          {/* Order Items */}
          <View style={styles.itemsList}>
            {orderSummary.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  <Text style={styles.orderItemDetails}>
                    {formatPrice(item.price)} x {item.quantity}
                  </Text>
                </View>
                <Text style={styles.orderItemTotal}>{formatPrice(item.subtotal)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tạm tính</Text>
              <Text style={styles.totalValue}>{formatPrice(orderSummary.subtotal)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Phí dịch vụ (5%)</Text>
              <Text style={styles.totalValue}>{formatPrice(orderSummary.serviceCharge)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Thuế (10%)</Text>
              <Text style={styles.totalValue}>{formatPrice(orderSummary.tax)}</Text>
            </View>
            
            <View style={styles.totalDivider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalFinal}>Tổng cộng</Text>
              <Text style={styles.totalFinalAmount}>{formatPrice(orderSummary.total)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentTitle}>Chọn phương thức thanh toán</Text>
          
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                !method.available && styles.paymentMethodDisabled,
              ]}
              onPress={() => method.available && handlePayment(method)}
              disabled={!method.available || paymentLoading}
            >
              <View style={styles.paymentMethodContent}>
                <View style={[styles.paymentIcon, { backgroundColor: method.color }]}>
                  {paymentLoading && selectedMethod === method.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Icon name={method.icon} size={20} color="#fff" />
                  )}
                </View>
                
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  <Text style={styles.paymentDescription}>{method.description}</Text>
                </View>

                {method.available ? (
                  <Icon name="chevron-right" size={20} color="#ccc" />
                ) : (
                  <Text style={styles.unavailableText}>Không khả dụng</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Info */}
        <View style={styles.securityContainer}>
          <View style={styles.securityHeader}>
            <Icon name="shield" size={16} color="#27AE60" />
            <Text style={styles.securityTitle}>Thanh toán an toàn</Text>
          </View>
          <Text style={styles.securityText}>
            Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối. 
            Chúng tôi không lưu trữ thông tin thẻ của bạn.
          </Text>
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

  // Order Summary
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  tableInfoText: {
    fontSize: 14,
    color: '#666',
  },

  itemsList: {
    marginBottom: 16,
  },

  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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

  orderItemDetails: {
    fontSize: 12,
    color: '#666',
  },

  orderItemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8622A',
  },

  totalsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  totalLabel: {
    fontSize: 14,
    color: '#666',
  },

  totalValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },

  totalDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },

  totalFinal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  totalFinalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8622A',
  },

  // Payment Methods
  paymentContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },

  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
  },

  paymentMethod: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  paymentMethodDisabled: {
    opacity: 0.5,
  },

  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },

  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentInfo: {
    flex: 1,
  },

  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  paymentDescription: {
    fontSize: 14,
    color: '#666',
  },

  unavailableText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // Security
  securityContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 32,
  },

  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
  },

  securityText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
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
    marginBottom: 24,
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

export default PaymentScreen;