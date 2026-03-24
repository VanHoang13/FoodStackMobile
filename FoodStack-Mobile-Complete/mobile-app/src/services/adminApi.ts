/**
 * Admin API Service
 * Handles all admin-related API calls
 */

import { apiClient } from './api-config';
import { ApiResponse } from '../types';

export interface AdminStats {
  totalRestaurants: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  pendingApprovals: number;
  revenueGrowth: number;
  userGrowth: number;
  recentActivity?: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    restaurant: string;
    createdAt: string;
  }>;
}

export interface AdminRestaurant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  logoUrl?: string;
  branchCount: number;
  userCount: number;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  restaurant?: {
    id: string;
    name: string;
  };
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  total: number;
  customerCount: number;
  restaurant: string;
  branch: string;
  table: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReports {
  period: string;
  orderStats: Record<string, number>;
  revenueStats: {
    total: number;
    average: number;
    orderCount: number;
  };
  userStats: Record<string, number>;
  restaurantStats: Record<string, number>;
  topRestaurants: Array<{
    id: string;
    name: string;
    totalRevenue: number;
    totalOrders: number;
    averageOrder: number;
  }>;
  orderTrends: Array<{
    date: string;
    orderCount: number;
    revenue: number;
  }>;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class AdminApiService {
  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<AdminStats>> {
    try {
      console.log('📊 Fetching admin dashboard stats...');
      
      const response = await apiClient.get('/admin/dashboard');
      
      console.log('✅ Admin dashboard stats loaded');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('❌ Admin dashboard stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải thống kê admin'
      };
    }
  }

  /**
   * Get all restaurants with pagination
   */
  async getRestaurants(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<ApiResponse<PaginatedResponse<AdminRestaurant>>> {
    try {
      console.log('🏪 Fetching admin restaurants...');
      
      const response = await apiClient.get('/admin/restaurants', { params });
      
      console.log('✅ Admin restaurants loaded');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('❌ Admin restaurants error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải danh sách nhà hàng'
      };
    }
  }

  /**
   * Update restaurant status
   */
  async updateRestaurantStatus(
    restaurantId: string,
    status: string,
    reason?: string
  ): Promise<ApiResponse<AdminRestaurant>> {
    try {
      console.log('🔄 Updating restaurant status...');
      
      const response = await apiClient.put(`/admin/restaurants/${restaurantId}/status`, {
        status,
        reason
      });
      
      console.log('✅ Restaurant status updated');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Update restaurant status error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật trạng thái nhà hàng'
      };
    }
  }

  /**
   * Get all users with pagination
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  } = {}): Promise<ApiResponse<PaginatedResponse<AdminUser>>> {
    try {
      console.log('👥 Fetching admin users...');
      
      const response = await apiClient.get('/admin/users', { params });
      
      console.log('✅ Admin users loaded');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('❌ Admin users error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải danh sách người dùng'
      };
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    userId: string,
    status: string,
    reason?: string
  ): Promise<ApiResponse<AdminUser>> {
    try {
      console.log('🔄 Updating user status...');
      
      const response = await apiClient.put(`/admin/users/${userId}/status`, {
        status,
        reason
      });
      
      console.log('✅ User status updated');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Update user status error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật trạng thái người dùng'
      };
    }
  }

  /**
   * Get all orders with pagination
   */
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    restaurant_id?: string;
    date_from?: string;
    date_to?: string;
  } = {}): Promise<ApiResponse<PaginatedResponse<AdminOrder>>> {
    try {
      console.log('📋 Fetching admin orders...');
      
      const response = await apiClient.get('/admin/orders', { params });
      
      console.log('✅ Admin orders loaded');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('❌ Admin orders error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải danh sách đơn hàng'
      };
    }
  }

  /**
   * Get system overview reports
   */
  async getReports(period: string = '30d'): Promise<ApiResponse<AdminReports>> {
    try {
      console.log('📊 Fetching admin reports...');
      
      const response = await apiClient.get('/admin/reports/overview', {
        params: { period }
      });
      
      console.log('✅ Admin reports loaded');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('❌ Admin reports error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải báo cáo'
      };
    }
  }

  /**
   * Get activity logs
   */
  async getActivityLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
    entity_type?: string;
    user_id?: string;
  } = {}): Promise<ApiResponse<PaginatedResponse<ActivityLog>>> {
    try {
      console.log('📝 Fetching activity logs...');
      
      const response = await apiClient.get('/admin/activity-logs', { params });
      
      console.log('✅ Activity logs loaded');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('❌ Activity logs error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải nhật ký hoạt động'
      };
    }
  }
}

export const adminApi = new AdminApiService();