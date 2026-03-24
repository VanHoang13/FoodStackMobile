import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from './api-config';
import { 
  ApiResponse, 
  TableInfo, 
  MenuData, 
  ItemCustomizations,
  OrderSession,
  OrderItem,
  Order,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  AuthUser
} from '../types';

// API Configuration
const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL + '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          await AsyncStorage.setItem('access_token', accessToken);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient.request(error.config);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  getProfile: async (): Promise<AuthUser> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

// Public API (no auth required)
export const publicApi = {
  // QR Code scanning
  scanQR: async (qrToken: string): Promise<ApiResponse<TableInfo>> => {
    try {
      const response = await apiClient.get(`/public/tables/${qrToken}`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available for QR scan, using mock data');
      // Return mock table data when backend is not available
      const mockTableData: { [key: string]: TableInfo } = {
        'qr-token-table-1': {
          table: {
            id: 'table-1',
            name: 'B01',
            capacity: 4,
            status: 'AVAILABLE'
          },
          branch: {
            id: 'branch-1',
            name: 'Chi nhánh Hoàn Kiếm',
            address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
            phone: '0901234567'
          },
          restaurant: {
            id: 'restaurant-1',
            name: 'Nhà Hàng Phố Cổ',
            logo_url: 'https://via.placeholder.com/200x200?text=Pho+Co'
          }
        },
        'qr-token-table-2': {
          table: {
            id: 'table-2',
            name: 'B02',
            capacity: 2,
            status: 'AVAILABLE'
          },
          branch: {
            id: 'branch-1',
            name: 'Chi nhánh Hoàn Kiếm',
            address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
            phone: '0901234567'
          },
          restaurant: {
            id: 'restaurant-1',
            name: 'Nhà Hàng Phố Cổ',
            logo_url: 'https://via.placeholder.com/200x200?text=Pho+Co'
          }
        },
        'qr-token-table-3': {
          table: {
            id: 'table-3',
            name: 'B03',
            capacity: 6,
            status: 'AVAILABLE'
          },
          branch: {
            id: 'branch-1',
            name: 'Chi nhánh Hoàn Kiếm',
            address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
            phone: '0901234567'
          },
          restaurant: {
            id: 'restaurant-1',
            name: 'Nhà Hàng Phố Cổ',
            logo_url: 'https://via.placeholder.com/200x200?text=Pho+Co'
          }
        }
      };

      const mockTable = mockTableData[qrToken];
      if (!mockTable) {
        throw new Error('Invalid QR code');
      }

      return {
        success: true,
        message: 'Table info retrieved (mock data)',
        data: mockTable
      };
    }
  },

  // Get restaurants
  getRestaurants: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/restaurants');
    return response.data;
  },

  // Get restaurant details
  getRestaurant: async (restaurantId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/restaurants/${restaurantId}`);
    return response.data;
  },

  // Get menu for branch
  getMenu: async (branchId: string): Promise<ApiResponse<MenuData>> => {
    const response = await apiClient.get(`/branches/${branchId}/menu`);
    return response.data;
  },

  // Get menu item customizations
  getItemCustomizations: async (menuItemId: string): Promise<ApiResponse<ItemCustomizations>> => {
    const response = await apiClient.get(`/menu-items/${menuItemId}/customizations`);
    return response.data;
  },
};

// Order API
export const orderApi = {
  // Create order
  createOrder: async (orderData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.warn('Backend not available for order creation, using mock data');
      // Return mock order creation response
      const mockOrderId = `order-${Date.now()}`;
      const mockOrderNumber = `ORD${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      return {
        success: true,
        message: 'Đặt hàng thành công (mock data)',
        data: {
          id: mockOrderId,
          orderNumber: mockOrderNumber,
          status: 'PENDING',
          total: orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
          createdAt: new Date().toISOString()
        }
      };
    }
  },

  // Get order details
  getOrderDetails: async (orderId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available for order details, checking local orders...');
      
      // Try to get from OrderIntegrationService first
      try {
        const OrderIntegrationService = require('./orderIntegrationService').default;
        
        // First try to get staff order ID from API order ID mapping
        const staffOrderId = await OrderIntegrationService.getStaffOrderIdFromApiId(orderId);
        const targetOrderId = staffOrderId || orderId;
        
        const localOrder = await OrderIntegrationService.getOrderById(targetOrderId);
        
        if (localOrder) {
          console.log('Found local order:', localOrder);
          // Convert staff order to order details format
          const orderDetails = {
            id: orderId, // Use original API order ID
            orderNumber: localOrder.orderNumber,
            status: localOrder.status,
            createdAt: localOrder.orderTime,
            updatedAt: localOrder.completedTime || localOrder.orderTime,
            subtotal: localOrder.totalAmount,
            tax: Math.round(localOrder.totalAmount * 0.1), // 10% tax
            serviceCharge: Math.round(localOrder.totalAmount * 0.05), // 5% service charge
            total: Math.round(localOrder.totalAmount * 1.15), // subtotal + tax + service
            customerCount: 1,
            table: {
              name: localOrder.table,
              area: {
                name: 'Khu vực chính'
              }
            },
            branch: {
              name: 'Chi nhánh chính',
              restaurant: {
                name: 'FoodStack Restaurant'
              }
            },
            orderItems: localOrder.items.map(item => ({
              id: item.id,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
              notes: item.notes,
              menuItem: {
                name: item.name,
                description: `Món ${item.name}`,
                imageUrl: 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(item.name)
              }
            })),
            statusHistory: [
              {
                status: 'PENDING',
                timestamp: localOrder.orderTime,
                description: 'Đơn hàng đã được tạo'
              },
              {
                status: 'CONFIRMED',
                timestamp: localOrder.orderTime,
                description: 'Đơn hàng đã được xác nhận'
              }
            ]
          };
          
          return {
            success: true,
            data: orderDetails
          };
        }
      } catch (localError) {
        console.error('Error getting local order:', localError);
      }
      
      // Fallback to mock data if no local order found
      console.warn('No local order found, using mock data');
      const mockOrderDetails = {
        id: orderId,
        orderNumber: `ORD${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        status: 'PREPARING',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        subtotal: 180000,
        tax: 18000,
        serviceCharge: 9000,
        total: 207000,
        customerCount: 2,
        table: {
          name: 'B01',
          area: {
            name: 'Tầng 1'
          }
        },
        branch: {
          name: 'Chi nhánh Hoàn Kiếm',
          restaurant: {
            name: 'Nhà Hàng Phố Cổ'
          }
        },
        orderItems: [
          {
            id: 'item-1',
            quantity: 2,
            price: 85000,
            subtotal: 170000,
            notes: 'Ít cay',
            menuItem: {
              name: 'Phở Bò Tái',
              description: 'Phở bò tái truyền thống với nước dùng đậm đà',
              imageUrl: 'https://via.placeholder.com/300x200?text=Pho+Bo+Tai'
            }
          },
          {
            id: 'item-2',
            quantity: 1,
            price: 15000,
            subtotal: 15000,
            menuItem: {
              name: 'Trà Đá',
              description: 'Trà đá truyền thống',
              imageUrl: 'https://via.placeholder.com/300x200?text=Tra+Da'
            }
          }
        ],
        statusHistory: [
          {
            status: 'PENDING',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            description: 'Đơn hàng đã được tạo'
          },
          {
            status: 'CONFIRMED',
            timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
            description: 'Đơn hàng đã được xác nhận'
          },
          {
            status: 'PREPARING',
            timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
            description: 'Bếp đang chuẩn bị món ăn'
          }
        ]
      };

      return {
        success: true,
        message: 'Order details retrieved (mock data)',
        data: mockOrderDetails
      };
    }
  },

  // Update order status (for restaurant)
  updateOrderStatus: async (orderId: string, status: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Get order history
  getOrderHistory: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/orders/history');
    return response.data;
  },

  // Get active orders by branch (for restaurant staff)
  getActiveOrdersByBranch: async (branchId: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/orders/branch/${branchId}/active`);
    return response.data;
  },

  // Add items to existing order
  addItemsToOrder: async (orderId: string, items: any[]): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/orders/${orderId}/items`, { items });
    return response.data;
  },

  // Remove item from order
  removeItemFromOrder: async (orderId: string, orderItemId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/orders/${orderId}/items/${orderItemId}`);
    return response.data;
  },

  // Update order item quantity
  updateOrderItem: async (orderId: string, orderItemId: string, quantity: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/orders/${orderId}/items/${orderItemId}`, { quantity });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string, reason?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },
};

// Service Request API
export const serviceRequestApi = {
  // Create service request
  createRequest: async (requestData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/service-requests', requestData);
    return response.data;
  },

  // Get requests for table
  getTableRequests: async (tableId: string, status?: string): Promise<ApiResponse<any[]>> => {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get(`/service-requests/table/${tableId}${params}`);
    return response.data;
  },

  // Get requests for branch (staff)
  getBranchRequests: async (branchId: string, filters?: any): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/service-requests/branch/${branchId}?${params}`);
    return response.data;
  },

  // Update request status
  updateRequestStatus: async (requestId: string, statusData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/service-requests/${requestId}/status`, statusData);
    return response.data;
  },

  // Cancel request
  cancelRequest: async (requestId: string, reason?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/service-requests/${requestId}`, { data: { reason } });
    return response.data;
  },

  // Get statistics
  getStats: async (branchId: string, filters?: any): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/service-requests/stats/${branchId}?${params}`);
    return response.data;
  },
};

// Payment API
export const paymentApi = {
  // Create payment
  createPayment: async (paymentData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/payments/create', paymentData);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (orderId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/payments/${orderId}`);
    return response.data;
  },

  // Confirm cash payment (staff)
  confirmCashPayment: async (paymentId: string, confirmData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/payments/${paymentId}/confirm`, confirmData);
    return response.data;
  },

  // Get pending cash payments (staff)
  getPendingCashPayments: async (branchId: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/payments/branch/${branchId}/pending`);
    return response.data;
  },
};

// Feedback API
export const feedbackApi = {
  // Submit feedback
  submitFeedback: async (feedbackData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/feedback', feedbackData);
    return response.data;
  },

  // Get feedback for order
  getOrderFeedback: async (orderId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/feedback/order/${orderId}`);
    return response.data;
  },

  // Get restaurant feedback
  getRestaurantFeedback: async (restaurantId: string, filters?: any): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/feedback/restaurant/${restaurantId}?${params}`);
    return response.data;
  },

  // Get branch feedback (staff)
  getBranchFeedback: async (branchId: string, filters?: any): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/feedback/branch/${branchId}?${params}`);
    return response.data;
  },

  // Get feedback statistics
  getFeedbackStats: async (restaurantId: string, filters?: any): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/feedback/stats/${restaurantId}?${params}`);
    return response.data;
  },

  // Add management response
  addResponse: async (feedbackId: string, response: string): Promise<ApiResponse<any>> => {
    const responseData = await apiClient.put(`/feedback/${feedbackId}/response`, { response });
    return responseData.data;
  },

  // Update feedback status
  updateStatus: async (feedbackId: string, status: string, reason?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/feedback/${feedbackId}/status`, { status, reason });
    return response.data;
  },
};

// Restaurant API
export const restaurantApi = {
  // Get my restaurants
  getMyRestaurants: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/restaurants/me');
    return response.data;
  },

  // Get restaurant statistics
  getMyStatistics: async (from?: string, to?: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await apiClient.get(`/restaurants/me/statistics?${params.toString()}`);
    return response.data;
  },

  // Get restaurant details
  getRestaurant: async (restaurantId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/restaurants/${restaurantId}`);
    return response.data;
  },

  // Create restaurant
  createRestaurant: async (restaurantData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/restaurants', restaurantData);
    return response.data;
  },

  // Update restaurant
  updateRestaurant: async (restaurantId: string, restaurantData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/restaurants/${restaurantId}`, restaurantData);
    return response.data;
  },
};

// Branch API
export const branchApi = {
  // Get branches
  getBranches: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/branches');
    return response.data;
  },

  // Get branch details
  getBranch: async (branchId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/branches/${branchId}`);
    return response.data;
  },

  // Get branch menu
  getBranchMenu: async (branchId: string): Promise<ApiResponse<MenuData>> => {
    try {
      const response = await apiClient.get(`/branches/${branchId}/menu`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock data');
      // Return mock menu data when backend is not available
      return {
        success: true,
        message: 'Mock menu data',
        data: {
          categories: [
            {
              id: 'cat-1',
              name: 'Món chính',
              description: 'Các món ăn chính',
              menu_items: [
                {
                  id: 'item-1',
                  name: 'Phở Bò Tái',
                  description: 'Phở bò tái truyền thống với nước dùng đậm đà',
                  price: 85000,
                  image_url: 'https://via.placeholder.com/300x200?text=Pho+Bo',
                  available: true,
                  category_id: 'cat-1'
                },
                {
                  id: 'item-2',
                  name: 'Cơm Gà Nướng',
                  description: 'Cơm gà nướng thơm ngon với nước mắm pha',
                  price: 95000,
                  image_url: 'https://via.placeholder.com/300x200?text=Com+Ga',
                  available: true,
                  category_id: 'cat-1'
                }
              ]
            },
            {
              id: 'cat-2',
              name: 'Đồ uống',
              description: 'Các loại nước uống',
              menu_items: [
                {
                  id: 'item-3',
                  name: 'Trà Đá',
                  description: 'Trà đá truyền thống',
                  price: 15000,
                  image_url: 'https://via.placeholder.com/300x200?text=Tra+Da',
                  available: true,
                  category_id: 'cat-2'
                },
                {
                  id: 'item-4',
                  name: 'Nước Cam',
                  description: 'Nước cam tươi vắt',
                  price: 25000,
                  image_url: 'https://via.placeholder.com/300x200?text=Nuoc+Cam',
                  available: true,
                  category_id: 'cat-2'
                }
              ]
            }
          ]
        }
      };
    }
  },

  // Get branch tables
  getBranchTables: async (branchId: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/branches/${branchId}/tables`);
    return response.data;
  },
};

// Menu Item API
export const menuItemApi = {
  // Create menu item
  createMenuItem: async (menuItemData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/menu-items', menuItemData);
    return response.data;
  },

  // Update menu item
  updateMenuItem: async (menuItemId: string, menuItemData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/menu-items/${menuItemId}`, menuItemData);
    return response.data;
  },

  // Delete menu item
  deleteMenuItem: async (menuItemId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/menu-items/${menuItemId}`);
    return response.data;
  },

  // Upload menu item image
  uploadMenuItemImage: async (menuItemId: string, imageFile: any): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post(`/menu-items/${menuItemId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update menu item availability
  updateMenuItemAvailability: async (menuItemId: string, available: boolean): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(`/menu-items/${menuItemId}/availability`, { available });
    return response.data;
  },

  // Search menu items
  searchMenuItems: async (params: any): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/menu-items/search?${queryParams}`);
    return response.data;
  },
};

// Category API
export const categoryApi = {
  // Get categories
  getCategories: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // Create category
  createCategory: async (categoryData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (categoryId: string, categoryData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (categoryId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/categories/${categoryId}`);
    return response.data;
  },
};
export const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },

  getItem: async (key: string): Promise<string | null> => {
    return await AsyncStorage.getItem(key);
  },

  removeItem: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  multiRemove: async (keys: string[]): Promise<void> => {
    await AsyncStorage.multiRemove(keys);
  },
};

// Wallet API
export const walletApi = {
  // Get wallet balance and transactions
  getWallet: async (): Promise<ApiResponse<any>> => {
    // Mock wallet data
    const mockWallet = {
      id: 'wallet-1',
      user_id: 'user-123',
      balance: 500000,
      transactions: [
        {
          id: 'txn-1',
          type: 'DEPOSIT',
          amount: 200000,
          description: 'Nạp tiền vào ví',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'txn-2',
          type: 'PAYMENT',
          amount: -150000,
          description: 'Thanh toán đơn hàng #ORD1234',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          order_id: 'order-1234'
        }
      ]
    };

    return {
      success: true,
      message: 'Wallet data retrieved',
      data: mockWallet
    };
  },

  // Top up wallet
  topUp: async (amount: number): Promise<ApiResponse<any>> => {
    return {
      success: true,
      message: 'Top up successful',
      data: { transaction_id: `txn-${Date.now()}`, amount }
    };
  },

  // Withdraw from wallet
  withdraw: async (amount: number): Promise<ApiResponse<any>> => {
    return {
      success: true,
      message: 'Withdrawal successful',
      data: { transaction_id: `txn-${Date.now()}`, amount: -amount }
    };
  }
};

// Loyalty API
export const loyaltyApi = {
  // Get loyalty program data
  getLoyaltyProgram: async (): Promise<ApiResponse<any>> => {
    // Mock loyalty data
    const mockLoyalty = {
      id: 'loyalty-1',
      user_id: 'user-123',
      current_points: 1250,
      total_earned_points: 5670,
      current_tier: {
        id: 'silver',
        name: 'Bạc',
        min_points: 1000,
        max_points: 2999,
        benefits: ['Giảm 5% mọi đơn hàng', 'Tích điểm x1.2'],
        color: '#C0C0C0',
        icon: 'award'
      },
      next_tier: {
        id: 'gold',
        name: 'Vàng',
        min_points: 3000,
        max_points: 9999,
        benefits: ['Giảm 10% mọi đơn hàng', 'Tích điểm x1.5', 'Ưu tiên đặt bàn'],
        color: '#FFD700',
        icon: 'star'
      },
      points_to_next_tier: 1750,
      transactions: [
        {
          id: 'ltxn-1',
          type: 'EARNED',
          points: 207,
          description: 'Tích điểm từ đơn hàng #ORD1234',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          order_id: 'order-1234'
        }
      ]
    };

    return {
      success: true,
      message: 'Loyalty program data retrieved',
      data: mockLoyalty
    };
  },

  // Redeem points
  redeemPoints: async (points: number, reward_id: string): Promise<ApiResponse<any>> => {
    return {
      success: true,
      message: 'Points redeemed successfully',
      data: { 
        transaction_id: `ltxn-${Date.now()}`, 
        points: -points,
        reward_id 
      }
    };
  }
};

export default apiClient;