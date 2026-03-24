import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';

type OrderModificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderModification'>;

interface Props {
  navigation: OrderModificationScreenNavigationProp;
  route: {
    params: {
      orderId: string;
      orderNumber: string;
    };
  };
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
  canModify: boolean;
  status: 'pending' | 'preparing' | 'ready';
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  notes?: string;
  canModify: boolean;
  modificationDeadline?: string;
}

const OrderModificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId, orderNumber } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [modifiedItems, setModifiedItems] = useState<{ [key: string]: number }>({});
  const [orderNotes, setOrderNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      // Mock order data
      const mockOrder: Order = {
        id: orderId,
        orderNumber: orderNumber,
        status: 'confirmed',
        canModify: true,
        modificationDeadline: '2024-03-23T11:00:00Z',
        notes: 'Không cay',
        items: [
          {
            id: '1',
            name: 'Phở Bò Tái',
            price: 65000,
            quantity: 2,
            subtotal: 130000,
            notes: 'Ít hành',
            canModify: true,
            status: 'pending'
          },
          {
            id: '2',
            name: 'Cơm Gà Nướng',
            price: 55000,
            quantity: 1,
            subtotal: 55000,
            canModify: true,
            status: 'pending'
          },
          {
            id: '3',
            name: 'Nước Cam',
            price: 25000,
            quantity: 2,
            subtotal: 50000,
            canModify: false,
            status: 'preparing'
          }
        ],
        subtotal: 235000,
        tax: 23500,
        serviceCharge: 11750,
        total: 270250
      };

      setOrder(mockOrder);
      setOrderNotes(mockOrder.notes || '');
      setLoading(false);
    } catch (error) {
      console.error('Error loading order:', error);
      setLoading(false);
    }
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (!order) return;

    const item = order.items.find(i => i.id === itemId);
    if (!item || !item.canModify) return;

    if (newQuantity < 0) newQuantity = 0;
    if (newQuantity > 10) newQuantity = 10;

    setModifiedItems(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));

    setHasChanges(true);
  };

  const getItemQuantity = (itemId: string) => {
    return modifiedItems[itemId] !== undefined ? modifiedItems[itemId] : 
           order?.items.find(i => i.id === itemId)?.quantity || 0;
  };

  const calculateNewTotal = () => {
    if (!order) return { subtotal: 0, tax: 0, serviceCharge: 0, total: 0 };

    let subtotal = 0;
    
    order.items.forEach(item => {
      const quantity = getItemQuantity(item.id);
      subtotal += item.price * quantity;
    });

    const tax = subtotal * 0.1; // 10% tax
    const serviceCharge = subtotal * 0.05; // 5% service charge
    const total = subtotal + tax + serviceCharge;

    return { subtotal, tax, serviceCharge, total };
  };

  const saveChanges = () => {
    if (!order || !hasChanges) return;

    const newTotals = calculateNewTotal();
    const removedItems = Object.entries(modifiedItems).filter(([_, quantity]) => quantity === 0);
    const modifiedItemsList = Object.entries(modifiedItems).filter(([_, quantity]) => quantity > 0);

    let changesSummary = '';
    
    if (removedItems.length > 0) {
      changesSummary += `Xóa: ${removedItems.map(([itemId]) => 
        order.items.find(i => i.id === itemId)?.name
      ).join(', ')}\n`;
    }

    if (modifiedItemsList.length > 0) {
      changesSummary += `Thay đổi số lượng:\n${modifiedItemsList.map(([itemId, newQuantity]) => {
        const item = order.items.find(i => i.id === itemId);
        const oldQuantity = item?.quantity || 0;
        return `• ${item?.name}: ${oldQuantity} → ${newQuantity}`;
      }).join('\n')}`;
    }

    Alert.alert(
      'Xác nhận thay đổi',
      `${changesSummary}\n\nTổng tiền mới: ${newTotals.total.toLocaleString()}đ\n\nBạn có chắc chắn muốn lưu thay đổi?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            // Mock save changes
            Alert.alert(
              'Thành công',
              'Đơn hàng đã được cập nhật. Nhà hàng sẽ xác nhận thay đổi trong vài phút.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }
              ]
            );
          }
        }
      ]
    );
  };

  const cancelModification = () => {
    if (hasChanges) {
      Alert.alert(
        'Hủy thay đổi',
        'Bạn có chắc chắn muốn hủy tất cả thay đổi?',
        [
          { text: 'Không', style: 'cancel' },
          {
            text: 'Có',
            onPress: () => {
              setModifiedItems({});
              setHasChanges(false);
              navigation.goBack();
            }
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const getItemStatusColor = (status: string) => {
    const colors = {
      pending: '#F39C12',
      preparing: '#E67E22',
      ready: '#27AE60'
    };
    return colors[status as keyof typeof colors] || '#95A5A6';
  };

  const getItemStatusText = (status: string) => {
    const texts = {
      pending: 'Chờ xử lý',
      preparing: 'Đang chuẩn bị',
      ready: 'Sẵn sàng'
    };
    return texts[status as keyof typeof texts] || 'Không xác định';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order.canModify) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Icon name="lock" size={64} color="#ccc" />
          <Text style={styles.errorTitle}>Không thể chỉnh sửa</Text>
          <Text style={styles.errorText}>
            Đơn hàng này đã quá thời gian cho phép chỉnh sửa hoặc đang được chuẩn bị.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const newTotals = calculateNewTotal();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#FF7A30', '#E8622A']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={cancelModification}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Chỉnh sửa đơn hàng</Text>
              <Text style={styles.headerSubtitle}>#{orderNumber}</Text>
            </View>
            <TouchableOpacity style={styles.helpButton}>
              <Icon name="help-circle" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Modification Notice */}
        {order.modificationDeadline && (
          <View style={styles.noticeContainer}>
            <Icon name="clock" size={20} color="#F39C12" />
            <Text style={styles.noticeText}>
              Có thể chỉnh sửa đến {new Date(order.modificationDeadline).toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Món ăn trong đơn</Text>
          {order.items.map((item) => (
            <View key={item.id} style={[
              styles.itemCard,
              !item.canModify && styles.itemCardDisabled
            ]}>
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                  {item.notes && (
                    <Text style={styles.itemNotes}>Ghi chú: {item.notes}</Text>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getItemStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{getItemStatusText(item.status)}</Text>
                </View>
              </View>

              <View style={styles.itemControls}>
                {item.canModify ? (
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateItemQuantity(item.id, getItemQuantity(item.id) - 1)}
                    >
                      <Icon name="minus" size={16} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{getItemQuantity(item.id)}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateItemQuantity(item.id, getItemQuantity(item.id) + 1)}
                    >
                      <Icon name="plus" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.lockedQuantity}>
                    <Icon name="lock" size={16} color="#999" />
                    <Text style={styles.lockedQuantityText}>Số lượng: {item.quantity}</Text>
                  </View>
                )}
                <Text style={styles.itemSubtotal}>
                  {formatCurrency(item.price * getItemQuantity(item.id))}
                </Text>
              </View>

              {getItemQuantity(item.id) === 0 && (
                <View style={styles.removedBadge}>
                  <Text style={styles.removedText}>Sẽ bị xóa khỏi đơn hàng</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Order Notes */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Ghi chú đơn hàng</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Thêm ghi chú cho đơn hàng..."
            value={orderNotes}
            onChangeText={(text) => {
              setOrderNotes(text);
              setHasChanges(true);
            }}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(newTotals.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thuế (10%):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(newTotals.tax)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí dịch vụ (5%):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(newTotals.serviceCharge)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>{formatCurrency(newTotals.total)}</Text>
            </View>
            
            {hasChanges && (
              <View style={styles.changeIndicator}>
                <Text style={styles.changeText}>
                  Thay đổi: {newTotals.total > order.total ? '+' : ''}{formatCurrency(newTotals.total - order.total)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {hasChanges && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setModifiedItems({});
              setOrderNotes(order.notes || '');
              setHasChanges(false);
            }}
          >
            <Text style={styles.cancelButtonText}>Hủy thay đổi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveChanges}
          >
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },

  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Header
  header: {
    marginBottom: 16,
  },

  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
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

  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  // Notice
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },

  noticeText: {
    fontSize: 14,
    color: '#E65100',
    marginLeft: 12,
    flex: 1,
  },

  // Items
  itemsContainer: {
    marginBottom: 24,
  },

  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  itemCardDisabled: {
    opacity: 0.7,
  },

  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },

  itemNotes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  itemControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },

  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },

  lockedQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  lockedQuantityText: {
    fontSize: 14,
    color: '#999',
  },

  itemSubtotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  removedBadge: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
  },

  removedText: {
    fontSize: 12,
    color: '#C62828',
    fontWeight: '600',
  },

  // Notes
  notesContainer: {
    marginBottom: 24,
  },

  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 80,
  },

  // Summary
  summaryContainer: {
    marginBottom: 100,
  },

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },

  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
    paddingTop: 16,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF7A30',
  },

  changeIndicator: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#27AE60',
  },

  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
    textAlign: 'center',
  },

  // Action Buttons
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },

  saveButton: {
    flex: 1,
    backgroundColor: '#FF7A30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default OrderModificationScreen;