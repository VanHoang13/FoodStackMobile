import React, { useState } from 'react';
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
import { RootStackParamList } from '../types';
import { useCart, CartItem } from '../contexts/CartContext';
import { orderApi } from '../services/api';
import { theme } from '../theme';
import Icon from '../components/Icon';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

interface Props {
  navigation: CartScreenNavigationProp;
  route: {
    params?: {
      tableInfo?: any;
      sessionToken?: string;
    };
  };
}

const CartScreen: React.FC<Props> = ({ navigation, route }) => {
  const { 
    items, 
    totalItems, 
    totalAmount, 
    updateQuantity, 
    removeItem, 
    clearCart,
    tableInfo,
    sessionToken 
  } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  const handleQuantityChange = (item: CartItem, change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm món vào giỏ hàng');
      return;
    }

    if (!tableInfo) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin bàn');
      return;
    }

    setLoading(true);

    try {
      // Prepare order items
      const orderItems = items.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        price: Number(item.menuItem.price),
        customizations: item.customizations || [],
        notes: item.notes || '',
      }));

      // Create order
      const orderData = {
        tableId: tableInfo.table.id,
        branchId: tableInfo.branch.id,
        items: orderItems,
        notes: orderNotes,
        customerCount: 1, // Default, can be made configurable
      };

      console.log('🛒 Placing order:', orderData);

      const response = await orderApi.createOrder(orderData);

      if (response.success) {
        Alert.alert(
          'Đặt hàng thành công!',
          `Đơn hàng #${response.data.orderNumber} đã được gửi đến bếp`,
          [
            {
              text: 'Theo dõi đơn hàng',
              onPress: () => {
                clearCart();
                navigation.navigate('OrderTracking', { 
                  orderId: response.data.id,
                  orderNumber: response.data.orderNumber 
                });
              },
            },
          ]
        );
      } else {
        throw new Error(response.message || 'Không thể đặt hàng');
      }
    } catch (error) {
      console.error('❌ Order placement error:', error);
      Alert.alert(
        'Lỗi đặt hàng',
        error instanceof Error ? error.message : 'Không thể đặt hàng, vui lòng thử lại'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (items.length === 0) {
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
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptyMessage}>
            Hãy thêm món ăn vào giỏ hàng để đặt hàng
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueButtonText}>Tiếp tục xem menu</Text>
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
        <Text style={styles.headerTitle}>Giỏ hàng ({totalItems})</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            Alert.alert(
              'Xóa giỏ hàng',
              'Bạn có chắc muốn xóa tất cả món trong giỏ hàng?',
              [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: clearCart },
              ]
            );
          }}
        >
          <Icon name="trash" size={18} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Table Info */}
        {tableInfo && (
          <View style={styles.tableInfo}>
            <Icon name="map-pin" size={16} color="#E8622A" />
            <Text style={styles.tableInfoText}>
              {tableInfo.restaurant.name} - Bàn {tableInfo.table.name}
            </Text>
          </View>
        )}

        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemContent}>
                {/* Item Image */}
                <View style={styles.itemImageContainer}>
                  {item.menuItem.image_url ? (
                    <Image
                      source={{ uri: item.menuItem.image_url }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.itemImagePlaceholder}>
                      <Icon name="image" size={20} color="#ccc" />
                    </View>
                  )}
                </View>

                {/* Item Details */}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.menuItem.name}</Text>
                  
                  {/* Customizations */}
                  {item.customizations && item.customizations.length > 0 && (
                    <View style={styles.customizations}>
                      {item.customizations.map((custom, index) => (
                        <Text key={index} style={styles.customizationText}>
                          • {custom.groupName}: {custom.optionName}
                          {custom.priceDelta > 0 && ` (+${formatPrice(custom.priceDelta)})`}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <Text style={styles.itemNotes}>Ghi chú: {item.notes}</Text>
                  )}

                  {/* Price & Quantity */}
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>{formatPrice(item.subtotal)}</Text>
                    
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item, -1)}
                      >
                        <Icon name="minus" size={16} color="#666" />
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item, 1)}
                      >
                        <Icon name="plus" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Remove Button */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeItem(item.id)}
                >
                  <Icon name="close" size={16} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính ({totalItems} món)</Text>
            <Text style={styles.summaryValue}>{formatPrice(totalAmount)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí dịch vụ (5%)</Text>
            <Text style={styles.summaryValue}>{formatPrice(totalAmount * 0.05)}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Tổng cộng</Text>
            <Text style={styles.summaryTotalAmount}>
              {formatPrice(totalAmount * 1.05)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.orderButton, loading && styles.orderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#ccc', '#999'] : ['#E8622A', '#D55A1F']}
            style={styles.orderButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="check" size={20} color="#fff" />
                <Text style={styles.orderButtonText}>
                  Đặt hàng • {formatPrice(totalAmount * 1.05)}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
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

  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
  },

  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 8,
  },

  tableInfoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },

  // Items
  itemsContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },

  cartItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  itemContent: {
    flexDirection: 'row',
    padding: 16,
  },

  itemImageContainer: {
    marginRight: 12,
  },

  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },

  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemDetails: {
    flex: 1,
  },

  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },

  customizations: {
    marginBottom: 4,
  },

  customizationText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },

  itemNotes: {
    fontSize: 12,
    color: '#E8622A',
    fontStyle: 'italic',
    marginBottom: 8,
  },

  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8622A',
  },

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },

  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Summary
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
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

  // Bottom
  bottomContainer: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  orderButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.md,
  },

  orderButtonDisabled: {
    opacity: 0.6,
  },

  orderButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },

  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    marginBottom: 24,
    lineHeight: 24,
  },

  continueButton: {
    backgroundColor: '#E8622A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen;