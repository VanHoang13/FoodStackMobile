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
    const response = await apiClient.get(`/public/qr/${qrToken}`);
    return response.data;
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
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  // Get order details
  getOrderDetails: async (orderId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
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
    const response = await apiClient.get(`/branches/${branchId}/menu`);
    return response.data;
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

export default apiClient;