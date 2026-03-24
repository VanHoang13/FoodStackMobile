import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList, PaymentMethod, PaymentResult, Wallet, LoyaltyProgram } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { useCart } from '../contexts/CartContext';
import { WalletService } from '../services/walletService';
import { LoyaltyService } from '../services/loyaltyService';
import OrderIntegrationService from '../services/orderIntegrationService';

type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;

interface Props {
  navigation: PaymentScreenNavigationProp;
  route: {
    params: {
      orderId: string;
      sessionToken?: string;
      tableInfo?: any;
      totalAmount?: number; // Add totalAmount param
    };
  };
}

const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId, tableInfo, totalAmount: paramTotalAmount } = route.params;
  const { totalAmount: cartTotalAmount, clearCart, items } = useCart(); // Get total from cart
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('WALLET');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  
  // Use param totalAmount first, then cart totalAmount, then fallback
  const orderAmount = paramTotalAmount || cartTotalAmount || 150000;
  
  // Debug logging
  console.log('🛒 Payment Debug:', {
    paramTotalAmount,
    cartTotalAmount,
    finalOrderAmount: orderAmount,
    itemsCount: items?.length || 0
  });

  // Mock payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'WALLET',
      type: 'WALLET',
      name: 'Ví FoodStack',
      icon: 'wallet',
      enabled: true
    },
    {
      id: 'CASH',
      type: 'CASH', 
      name: 'Tiền mặt',
      icon: 'dollar-sign',
      enabled: true
    }
  ];

  useEffect(() => {
    loadWalletAndLoyalty();
  }, []);

  const loadWalletAndLoyalty = async () => {
    try {
      setLoading(true);
      
      // Load wallet and loyalty data from AsyncStorage
      const [walletData, loyaltyData] = await Promise.all([
        WalletService.getWallet(),
        LoyaltyService.getLoyaltyProgram()
      ]);

      setWallet(walletData);
      setLoyaltyProgram(loyaltyData);
    } catch (error) {
      console.error('Error loading wallet and loyalty data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const processPayment = async () => {
    if (!wallet) return;

    if (selectedMethod === 'WALLET' && wallet.balance < orderAmount) {
      Alert.alert(
        'Số dư không đủ',
        `Số dư ví: ${formatPrice(wallet.balance)}\nSố tiền cần thanh toán: ${formatPrice(orderAmount)}`,
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate payment QR code
      const paymentId = `PAY${Date.now()}`;
      const qrData = `PAYMENT-${paymentId}-${orderAmount}`;

      const mockPaymentResult: PaymentResult = {
        id: paymentId,
        order_id: orderId,
        payment_method: selectedMethod,
        amount: orderAmount,
        status: 'PENDING',
        qr_code_data: qrData,
        created_at: new Date().toISOString()
      };

      setPaymentResult(mockPaymentResult);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xử lý thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const completePayment = async () => {
    if (!paymentResult || !wallet || !loyaltyProgram) return;

    setLoading(true);

    try {
      // Simulate payment completion
      await new Promise(resolve => setTimeout(resolve, 1500));

      let updatedWallet = wallet;
      let updatedLoyalty = loyaltyProgram;

      // Update wallet balance if paying with wallet
      if (selectedMethod === 'WALLET') {
        updatedWallet = await WalletService.deductAmount(
          orderAmount, 
          orderId, 
          `Thanh toán đơn hàng #${orderId.slice(0, 8)}`
        );
      }

      // Add loyalty points
      const loyaltyResult = await LoyaltyService.addPoints(
        LoyaltyService.calculatePointsFromAmount(orderAmount),
        orderId,
        orderAmount,
        `Tích điểm từ đơn hàng #${orderId.slice(0, 8)}`
      );

      updatedLoyalty = loyaltyResult.loyalty;

      // Update states
      setWallet(updatedWallet);
      setLoyaltyProgram(updatedLoyalty);

      // Update payment status
      setPaymentResult({
        ...paymentResult,
        status: 'SUCCESS'
      });

      // Show tier upgrade alert if applicable
      if (loyaltyResult.tierUpgraded && loyaltyResult.newTier) {
        Alert.alert(
          '🎉 Chúc mừng!',
          `Bạn đã lên hạng ${loyaltyResult.newTier.name}!\n\nLợi ích mới:\n${loyaltyResult.newTier.benefits.map(b => `• ${b}`).join('\n')}`,
          [{ text: 'Tuyệt vời!' }]
        );
      }

      // Show success message
      const earnedPoints = LoyaltyService.calculatePointsFromAmount(orderAmount);
      
      // Update order with actual orderId for tracking
      try {
        await OrderIntegrationService.syncOrderStatus(orderId, 'CONFIRMED');
        console.log('✅ Order ID synced for tracking:', orderId);
      } catch (syncError) {
        console.error('Error syncing order ID:', syncError);
      }
      
      Alert.alert(
        '✅ Thanh toán thành công!',
        `Đã thanh toán: ${formatPrice(orderAmount)}\n` +
        `Điểm tích lũy: +${earnedPoints} điểm\n` +
        `Tổng điểm: ${updatedLoyalty.current_points} điểm` +
        (selectedMethod === 'WALLET' ? `\nSố dư ví: ${formatPrice(updatedWallet.balance)}` : ''),
        [
          {
            text: 'Xem đơn hàng',
            onPress: () => {
              // Clear cart after successful payment
              clearCart();
              
              navigation.navigate('OrderTracking', {
                orderId: orderId,
                orderNumber: `ORD${Math.floor(Math.random() * 10000)}`
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('Payment completion error:', error);
      Alert.alert('Lỗi', 'Không thể hoàn thành thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const getQRUrl = (data: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}&bgcolor=FFFFFF&color=27AE60&margin=10`;
  };
  if (paymentResult) {
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
          <Text style={styles.headerTitle}>
            {paymentResult.status === 'SUCCESS' ? 'Thanh toán thành công' : 'Thanh toán'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Payment Status */}
          <View style={styles.statusContainer}>
            {paymentResult.status === 'SUCCESS' ? (
              <LinearGradient
                colors={['#27AE60', '#2ECC71']}
                style={styles.statusGradient}
              >
                <Icon name="check-circle" size={48} color="#fff" />
                <Text style={styles.statusTitle}>Thanh toán thành công!</Text>
                <Text style={styles.statusSubtitle}>
                  Cảm ơn bạn đã sử dụng dịch vụ
                </Text>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={['#F39C12', '#E67E22']}
                style={styles.statusGradient}
              >
                <Icon name="clock" size={48} color="#fff" />
                <Text style={styles.statusTitle}>Chờ xác nhận thanh toán</Text>
                <Text style={styles.statusSubtitle}>
                  Vui lòng hiển thị mã QR cho nhân viên
                </Text>
              </LinearGradient>
            )}
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>
              {paymentResult.status === 'SUCCESS' ? 'Mã QR đơn hàng' : 'Mã QR thanh toán'}
            </Text>
            
            <View style={styles.qrWrapper}>
              <Image
                source={{ uri: getQRUrl(paymentResult.qr_code_data || '') }}
                style={styles.qrImage}
                resizeMode="contain"
              />
              
              <View style={styles.qrOverlay}>
                <View style={[styles.qrCorner, styles.qrCornerTopLeft]} />
                <View style={[styles.qrCorner, styles.qrCornerTopRight]} />
                <View style={[styles.qrCorner, styles.qrCornerBottomLeft]} />
                <View style={[styles.qrCorner, styles.qrCornerBottomRight]} />
              </View>
            </View>

            <View style={styles.qrInfo}>
              <Text style={styles.qrPaymentId}>#{paymentResult.id}</Text>
              <Text style={styles.qrAmount}>{formatPrice(paymentResult.amount)}</Text>
              <Text style={styles.qrMethod}>
                {paymentMethods.find(m => m.id === paymentResult.payment_method)?.name}
              </Text>
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Chi tiết thanh toán</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã đơn hàng</Text>
              <Text style={styles.detailValue}>#{paymentResult.order_id.slice(0, 8)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số tiền</Text>
              <Text style={styles.detailValue}>{formatPrice(paymentResult.amount)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phương thức</Text>
              <Text style={styles.detailValue}>
                {paymentMethods.find(m => m.id === paymentResult.payment_method)?.name}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thời gian</Text>
              <Text style={styles.detailValue}>
                {new Date(paymentResult.created_at).toLocaleString('vi-VN')}
              </Text>
            </View>
          </View>

          {/* Wallet & Loyalty Info */}
          {wallet && loyaltyProgram && (
            <View style={styles.rewardsContainer}>
              <Text style={styles.rewardsTitle}>Thông tin tài khoản</Text>
              
              {/* Wallet Balance */}
              <View style={styles.walletCard}>
                <View style={styles.walletHeader}>
                  <Icon name="wallet" size={20} color="#E8622A" />
                  <Text style={styles.walletTitle}>Số dư ví</Text>
                </View>
                <Text style={styles.walletBalance}>{formatPrice(wallet.balance)}</Text>
              </View>

              {/* Loyalty Points */}
              <View style={styles.loyaltyCard}>
                <View style={styles.loyaltyHeader}>
                  <Icon name={loyaltyProgram.current_tier.icon} size={20} color={loyaltyProgram.current_tier.color} />
                  <Text style={styles.loyaltyTitle}>Hạng {loyaltyProgram.current_tier.name}</Text>
                </View>
                
                <Text style={styles.loyaltyPoints}>
                  {loyaltyProgram.current_points.toLocaleString()} điểm
                </Text>
                
                {loyaltyProgram.next_tier && loyaltyProgram.points_to_next_tier && (
                  <Text style={styles.loyaltyNext}>
                    Còn {loyaltyProgram.points_to_next_tier} điểm để lên hạng {loyaltyProgram.next_tier.name}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Action Button */}
          {paymentResult.status === 'PENDING' && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={completePayment}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#27AE60', '#2ECC71']}
                  style={styles.completeButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="check" size={20} color="#fff" />
                      <Text style={styles.completeButtonText}>Hoàn thành thanh toán</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
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
          <Text style={styles.summaryTitle}>Tổng đơn hàng</Text>
          <Text style={styles.summaryAmount}>{formatPrice(orderAmount)}</Text>
          
          {(paramTotalAmount === undefined && cartTotalAmount === 0) && (
            <View style={styles.warningContainer}>
              <Icon name="alert-triangle" size={16} color="#F39C12" />
              <Text style={styles.warningText}>
                Cart trống - Sử dụng số tiền test: {formatPrice(orderAmount)}
              </Text>
            </View>
          )}
          
          {tableInfo && (
            <View style={styles.tableInfo}>
              <Icon name="map-pin" size={16} color="#666" />
              <Text style={styles.tableText}>
                Bàn {tableInfo.name} - {tableInfo.area?.name || 'Tầng 1'}
              </Text>
            </View>
          )}
        </View>

        {/* Wallet & Loyalty Display */}
        {wallet && loyaltyProgram && (
          <View style={styles.accountContainer}>
            <Text style={styles.accountTitle}>Thông tin tài khoản</Text>
            
            {/* Wallet */}
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <Icon name="wallet" size={20} color="#E8622A" />
                <Text style={styles.walletTitle}>Ví FoodStack</Text>
              </View>
              <Text style={styles.walletBalance}>{formatPrice(wallet.balance)}</Text>
              <Text style={styles.walletStatus}>
                {wallet.balance >= orderAmount ? '✅ Đủ số dư' : '❌ Không đủ số dư'}
              </Text>
            </View>

            {/* Loyalty */}
            <View style={styles.loyaltyCard}>
              <View style={styles.loyaltyHeader}>
                <Icon name={loyaltyProgram.current_tier.icon} size={20} color={loyaltyProgram.current_tier.color} />
                <Text style={styles.loyaltyTitle}>Hạng {loyaltyProgram.current_tier.name}</Text>
              </View>
              
              <Text style={styles.loyaltyPoints}>
                {loyaltyProgram.current_points.toLocaleString()} điểm
              </Text>
              
              <Text style={styles.loyaltyEarn}>
                +{LoyaltyService.calculatePointsFromAmount(orderAmount)} điểm sau thanh toán
              </Text>
            </View>
          </View>
        )}

        {/* Payment Methods */}
        <View style={styles.methodsContainer}>
          <Text style={styles.methodsTitle}>Chọn phương thức thanh toán</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected
              ]}
              onPress={() => setSelectedMethod(method.id)}
              disabled={!method.enabled}
            >
              <View style={styles.methodContent}>
                <View style={styles.methodLeft}>
                  <View style={[
                    styles.methodIcon,
                    selectedMethod === method.id && styles.methodIconSelected
                  ]}>
                    <Icon name={method.icon} size={20} color={
                      selectedMethod === method.id ? '#fff' : '#666'
                    } />
                  </View>
                  <Text style={[
                    styles.methodName,
                    selectedMethod === method.id && styles.methodNameSelected
                  ]}>
                    {method.name}
                  </Text>
                </View>
                
                <View style={[
                  styles.methodRadio,
                  selectedMethod === method.id && styles.methodRadioSelected
                ]}>
                  {selectedMethod === method.id && (
                    <View style={styles.methodRadioInner} />
                  )}
                </View>
              </View>
              
              {method.id === 'WALLET' && wallet && (
                <Text style={styles.methodBalance}>
                  Số dư: {formatPrice(wallet.balance)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Pay Button */}
        <View style={styles.payContainer}>
          <TouchableOpacity
            style={[
              styles.payButton,
              (!selectedMethod || loading) && styles.payButtonDisabled
            ]}
            onPress={processPayment}
            disabled={!selectedMethod || loading}
          >
            <LinearGradient
              colors={
                selectedMethod && !loading 
                  ? ['#E8622A', '#FF7A30'] 
                  : ['#ccc', '#999']
              }
              style={styles.payButtonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="credit-card" size={20} color="#fff" />
                  <Text style={styles.payButtonText}>
                    Thanh toán {formatPrice(orderAmount)}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
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

  content: {
    flex: 1,
    padding: 16,
  },

  // Order Summary
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.sm,
  },

  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },

  summaryAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#E8622A',
    marginBottom: 12,
  },

  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  tableText: {
    fontSize: 14,
    color: '#666',
  },

  // Warning
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFE082',
  },

  warningText: {
    fontSize: 12,
    color: '#F57F17',
    flex: 1,
  },

  // Account Info
  accountContainer: {
    marginBottom: 16,
  },

  accountTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  walletCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },

  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  walletTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  walletBalance: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E8622A',
    marginBottom: 4,
  },

  walletStatus: {
    fontSize: 12,
    color: '#666',
  },

  loyaltyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },

  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  loyaltyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  loyaltyPoints: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9B59B6',
    marginBottom: 4,
  },

  loyaltyEarn: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },

  loyaltyNext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  // Payment Methods
  methodsContainer: {
    marginBottom: 16,
  },

  methodsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },

  methodCardSelected: {
    borderColor: '#E8622A',
    backgroundColor: '#FFF8F5',
  },

  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  methodIconSelected: {
    backgroundColor: '#E8622A',
  },

  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  methodNameSelected: {
    color: '#E8622A',
  },

  methodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },

  methodRadioSelected: {
    borderColor: '#E8622A',
  },

  methodRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8622A',
  },

  methodBalance: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginLeft: 52,
  },

  // Pay Button
  payContainer: {
    marginBottom: 16,
  },

  payButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.md,
  },

  payButtonDisabled: {
    opacity: 0.6,
  },

  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },

  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Payment Result
  statusContainer: {
    marginBottom: 20,
  },

  statusGradient: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },

  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },

  statusSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // QR Code
  qrContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.sm,
  },

  qrTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  qrWrapper: {
    position: 'relative',
    marginBottom: 16,
  },

  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },

  qrOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },

  qrCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: '#27AE60',
  },

  qrCornerTopLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },

  qrCornerTopRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },

  qrCornerBottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },

  qrCornerBottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  qrInfo: {
    alignItems: 'center',
  },

  qrPaymentId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#27AE60',
    marginBottom: 4,
  },

  qrAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  qrMethod: {
    fontSize: 12,
    color: '#666',
  },

  // Details
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },

  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  detailLabel: {
    fontSize: 14,
    color: '#666',
  },

  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Rewards
  rewardsContainer: {
    marginBottom: 16,
  },

  rewardsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  // Complete Button
  actionContainer: {
    marginBottom: 16,
  },

  completeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.md,
  },

  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },

  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PaymentScreen;