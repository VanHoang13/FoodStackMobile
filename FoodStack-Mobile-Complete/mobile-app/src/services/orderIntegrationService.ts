import AsyncStorage from '@react-native-async-storage/async-storage';
import StaffOrderService, { StaffOrder, OrderItem } from './staffOrderService';

// Service to bridge customer orders with staff workflow
class OrderIntegrationService {
  private static instance: OrderIntegrationService;
  private customerOrdersKey = 'foodstack_customer_orders';

  static getInstance(): OrderIntegrationService {
    if (!OrderIntegrationService.instance) {
      OrderIntegrationService.instance = new OrderIntegrationService();
    }
    return OrderIntegrationService.instance;
  }

  // Convert cart items to staff order format
  private convertCartToStaffOrder(cartItems: any[], orderData: any): StaffOrder {
    const orderItems: OrderItem[] = cartItems.map((cartItem, index) => ({
      id: `item_${index + 1}`,
      name: cartItem.menu_item?.name || cartItem.name || 'Unknown Item',
      quantity: cartItem.quantity || 1,
      price: cartItem.menu_item?.price || cartItem.price || 0,
      customizations: cartItem.selected_customizations?.map((custom: any) => 
        custom.options?.map((opt: any) => opt.name).join(', ')
      ).filter(Boolean) || [],
      notes: cartItem.notes || ''
    }));

    const staffOrder: StaffOrder = {
      id: `order_${Date.now()}`,
      orderNumber: `ORD-${String(Date.now()).slice(-6)}`,
      customerName: orderData.customerName || 'Khách hàng',
      table: orderData.table || 'Unknown',
      status: 'PENDING',
      items: orderItems,
      totalAmount: orderData.totalAmount || 0,
      orderTime: new Date().toISOString(),
      priority: 'NORMAL',
      customerPhone: orderData.customerPhone || '',
      branchId: orderData.branchId || '',
      restaurantId: orderData.restaurantId || '',
      specialRequests: orderData.notes || ''
    };

    return staffOrder;
  }

  // Create staff order from customer cart
  async createStaffOrderFromCart(cartItems: any[], orderData: any): Promise<StaffOrder> {
    try {
      console.log('OrderIntegrationService: Creating staff order from cart...');
      console.log('Cart items:', cartItems);
      console.log('Order data:', orderData);
      
      const staffOrder = this.convertCartToStaffOrder(cartItems, orderData);
      console.log('Generated staff order:', staffOrder);
      
      // Add to staff orders
      const existingOrders = await StaffOrderService.getOrders();
      existingOrders.push(staffOrder);
      await AsyncStorage.setItem('foodstack_staff_orders', JSON.stringify(existingOrders));
      
      // Also save to customer orders for tracking
      await this.saveCustomerOrder(staffOrder);
      
      // Save orderId mapping for later tracking
      if (orderData.apiOrderId) {
        await this.saveOrderIdMapping(orderData.apiOrderId, staffOrder.id);
      }
      
      console.log('OrderIntegrationService: Staff order created successfully');
      return staffOrder;
    } catch (error) {
      console.error('Error creating staff order from cart:', error);
      throw error;
    }
  }

  // Save mapping between API orderId and staff orderId
  private async saveOrderIdMapping(apiOrderId: string, staffOrderId: string): Promise<void> {
    try {
      const mappingKey = 'foodstack_order_id_mapping';
      const existingMappings = await AsyncStorage.getItem(mappingKey);
      const mappings = existingMappings ? JSON.parse(existingMappings) : {};
      
      mappings[apiOrderId] = staffOrderId;
      await AsyncStorage.setItem(mappingKey, JSON.stringify(mappings));
      
      console.log('Order ID mapping saved:', { apiOrderId, staffOrderId });
    } catch (error) {
      console.error('Error saving order ID mapping:', error);
    }
  }

  // Get staff order ID from API order ID
  async getStaffOrderIdFromApiId(apiOrderId: string): Promise<string | null> {
    try {
      const mappingKey = 'foodstack_order_id_mapping';
      const existingMappings = await AsyncStorage.getItem(mappingKey);
      const mappings = existingMappings ? JSON.parse(existingMappings) : {};
      
      return mappings[apiOrderId] || null;
    } catch (error) {
      console.error('Error getting staff order ID:', error);
      return null;
    }
  }

  // Save customer order for tracking
  private async saveCustomerOrder(order: StaffOrder): Promise<void> {
    try {
      const existingOrders = await this.getCustomerOrders();
      existingOrders.push(order);
      await AsyncStorage.setItem(this.customerOrdersKey, JSON.stringify(existingOrders));
    } catch (error) {
      console.error('Error saving customer order:', error);
    }
  }

  // Get customer orders
  async getCustomerOrders(): Promise<StaffOrder[]> {
    try {
      const data = await AsyncStorage.getItem(this.customerOrdersKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting customer orders:', error);
      return [];
    }
  }

  // Sync order status from staff to customer
  async syncOrderStatus(orderId: string, newStatus: StaffOrder['status']): Promise<void> {
    try {
      const customerOrders = await this.getCustomerOrders();
      const updatedOrders = customerOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      await AsyncStorage.setItem(this.customerOrdersKey, JSON.stringify(updatedOrders));
    } catch (error) {
      console.error('Error syncing order status:', error);
    }
  }

  // Get order by ID
  async getOrderById(orderId: string): Promise<StaffOrder | null> {
    try {
      const orders = await StaffOrderService.getOrders();
      return orders.find(order => order.id === orderId) || null;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return null;
    }
  }

  // Clear old orders (cleanup)
  async clearOldOrders(daysOld: number = 7): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      // Clear staff orders
      const staffOrders = await StaffOrderService.getOrders();
      const filteredStaffOrders = staffOrders.filter(order => {
        if (order.status !== 'COMPLETED') return true;
        return new Date(order.orderTime) > cutoffDate;
      });
      await AsyncStorage.setItem('foodstack_staff_orders', JSON.stringify(filteredStaffOrders));
      
      // Clear customer orders
      const customerOrders = await this.getCustomerOrders();
      const filteredCustomerOrders = customerOrders.filter(order => {
        if (order.status !== 'COMPLETED') return true;
        return new Date(order.orderTime) > cutoffDate;
      });
      await AsyncStorage.setItem(this.customerOrdersKey, JSON.stringify(filteredCustomerOrders));
    } catch (error) {
      console.error('Error clearing old orders:', error);
    }
  }
}

export default OrderIntegrationService.getInstance();