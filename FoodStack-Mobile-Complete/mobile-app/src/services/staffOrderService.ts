import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
  notes?: string;
}

export interface StaffOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  table: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED';
  items: OrderItem[];
  totalAmount: number;
  orderTime: string;
  estimatedTime?: number;
  specialRequests?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  customerPhone?: string;
  branchId?: string;
  restaurantId?: string;
  assignedStaff?: string;
  completedTime?: string;
}

class StaffOrderService {
  private static instance: StaffOrderService;
  private storageKey = 'foodstack_staff_orders'; // Global key for all users

  static getInstance(): StaffOrderService {
    if (!StaffOrderService.instance) {
      StaffOrderService.instance = new StaffOrderService();
    }
    return StaffOrderService.instance;
  }

  // Get all orders
  async getOrders(): Promise<StaffOrder[]> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, newStatus: StaffOrder['status']): Promise<StaffOrder | null> {
    try {
      const orders = await this.getOrders();
      const index = orders.findIndex(order => order.id === orderId);
      
      if (index === -1) {
        return null;
      }
      
      orders[index].status = newStatus;
      
      // Add completion time if status is completed
      if (newStatus === 'COMPLETED' && !orders[index].completedTime) {
        orders[index].completedTime = new Date().toISOString();
      }
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(orders));
      return orders[index];
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Reject/Cancel order
  async rejectOrder(orderId: string): Promise<boolean> {
    try {
      const orders = await this.getOrders();
      const filteredOrders = orders.filter(order => order.id !== orderId);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(filteredOrders));
      return true;
    } catch (error) {
      console.error('Error rejecting order:', error);
      return false;
    }
  }

  // Get orders by status
  async getOrdersByStatus(status: StaffOrder['status']): Promise<StaffOrder[]> {
    try {
      const orders = await this.getOrders();
      return orders.filter(order => order.status === status);
    } catch (error) {
      console.error('Error getting orders by status:', error);
      return [];
    }
  }

  // Get pending orders count
  async getPendingOrdersCount(): Promise<number> {
    try {
      const orders = await this.getOrders();
      return orders.filter(order => order.status === 'PENDING').length;
    } catch (error) {
      console.error('Error getting pending orders count:', error);
      return 0;
    }
  }

  // Get active orders count (not completed)
  async getActiveOrdersCount(): Promise<number> {
    try {
      const orders = await this.getOrders();
      return orders.filter(order => order.status !== 'COMPLETED').length;
    } catch (error) {
      console.error('Error getting active orders count:', error);
      return 0;
    }
  }

  // Initialize with mock data for testing
  async initializeMockData(): Promise<void> {
    try {
      const existingOrders = await this.getOrders();
      if (existingOrders.length > 0) {
        console.log('StaffOrderService: Mock data already exists, skipping initialization');
        return; // Don't overwrite existing data
      }
      
      console.log('StaffOrderService: Initializing mock data...');
      
      const mockOrders: StaffOrder[] = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          customerName: 'Nguyễn Văn A',
          table: 'B01',
          status: 'PENDING',
          items: [
            { id: '1', name: 'Phở Bò Tái', quantity: 2, price: 85000, customizations: ['Ít cay'] },
            { id: '2', name: 'Trà Đá', quantity: 2, price: 15000 }
          ],
          totalAmount: 200000,
          orderTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          specialRequests: 'Không hành',
          priority: 'NORMAL',
          customerPhone: '0901234567'
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          customerName: 'Trần Thị B',
          table: 'A05',
          status: 'CONFIRMED',
          items: [
            { id: '3', name: 'Bún Bò Huế', quantity: 1, price: 75000 },
            { id: '4', name: 'Chả Cá', quantity: 1, price: 120000, notes: 'Không rau thơm' }
          ],
          totalAmount: 195000,
          orderTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          estimatedTime: 15,
          priority: 'NORMAL',
          customerPhone: '0901234568'
        },
        {
          id: '3',
          orderNumber: 'ORD-003',
          customerName: 'Lê Văn C',
          table: 'C02',
          status: 'PREPARING',
          items: [
            { id: '5', name: 'Cơm Tấm', quantity: 2, price: 65000 },
            { id: '6', name: 'Nước Cam', quantity: 2, price: 25000 }
          ],
          totalAmount: 180000,
          orderTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          estimatedTime: 10,
          priority: 'HIGH',
          assignedStaff: 'Nhân viên 1',
          customerPhone: '0901234569'
        },
        {
          id: '4',
          orderNumber: 'ORD-004',
          customerName: 'Phạm Thị D',
          table: 'B07',
          status: 'READY',
          items: [
            { id: '7', name: 'Bánh Mì', quantity: 3, price: 35000 },
            { id: '8', name: 'Cà Phê Sữa', quantity: 2, price: 30000 }
          ],
          totalAmount: 165000,
          orderTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          priority: 'NORMAL',
          assignedStaff: 'Nhân viên 2',
          customerPhone: '0901234570'
        },
        {
          id: '5',
          orderNumber: 'ORD-005',
          customerName: 'Hoàng Văn E',
          table: 'A03',
          status: 'SERVED',
          items: [
            { id: '9', name: 'Gỏi Cuốn', quantity: 4, price: 45000 },
            { id: '10', name: 'Nước Dừa', quantity: 2, price: 35000 }
          ],
          totalAmount: 250000,
          orderTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          priority: 'NORMAL',
          assignedStaff: 'Nhân viên 3',
          customerPhone: '0901234571'
        }
      ];
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(mockOrders));
      console.log('StaffOrderService: Mock data initialized successfully');
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }
  }

  // Clean up old completed orders
  async cleanupOldOrders(daysOld: number = 7): Promise<void> {
    try {
      const orders = await this.getOrders();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const filteredOrders = orders.filter(order => {
        if (order.status !== 'COMPLETED') return true;
        if (!order.completedTime) return true;
        
        const completedDate = new Date(order.completedTime);
        return completedDate > cutoffDate;
      });
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(filteredOrders));
    } catch (error) {
      console.error('Error cleaning up old orders:', error);
    }
  }
}

export default StaffOrderService.getInstance();