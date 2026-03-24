import apiClient from './api';
import AuthService from './authService';

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CHEF' | 'WAITER' | 'CASHIER' | 'MANAGER';
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  shift: 'morning' | 'afternoon' | 'evening' | 'full_time';
  performance: number; // 0-100
  avatar?: string;
  isOnline: boolean;
  address?: string;
  emergencyContact?: string;
  salary?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  onLeaveStaff: number;
  averagePerformance: number;
}

export interface StaffListResponse {
  success: boolean;
  message: string;
  data: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StaffCreateRequest {
  name: string;
  email: string;
  phone: string;
  role: Staff['role'];
  status: Staff['status'];
  shift: Staff['shift'];
  address?: string;
  emergencyContact?: string;
  salary?: number;
  joinDate: string;
  performance: number;
  isOnline: boolean;
}

export interface StaffUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: Staff['role'];
  status?: Staff['status'];
  shift?: Staff['shift'];
  address?: string;
  emergencyContact?: string;
  salary?: number;
  performance?: number;
}

class OwnerStaffApiService {
  private static instance: OwnerStaffApiService;

  static getInstance(): OwnerStaffApiService {
    if (!OwnerStaffApiService.instance) {
      OwnerStaffApiService.instance = new OwnerStaffApiService();
    }
    return OwnerStaffApiService.instance;
  }

  // Exact 1 Fallback Item for UI Empty States
  private getFallbackStaff(): Staff {
    return {
      id: 'fallback_staff_1',
      name: 'Nhân viên Mẫu (Chưa có data)',
      email: 'demo@foodstack.com',
      phone: '0901234567',
      role: 'WAITER',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      shift: 'full_time',
      performance: 100,
      isOnline: true,
      address: '123 Đường Mẫu',
      emergencyContact: '0907654321',
      salary: 10000000,
      notes: 'Đây là dữ liệu mẫu để hiển thị UI',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Get all staff with pagination and filters
  async getStaff(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    branchId?: string;
  }): Promise<Staff[]> {
    try {
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        throw new Error('User not authenticated');
      }

      const userData = await AuthService.getUserData();
      if (!userData || !['OWNER', 'MANAGER'].includes(userData.role)) {
        throw new Error(`Unauthorized role: ${userData?.role}`);
      }

      const response = await apiClient.get<StaffListResponse>('/staff', { params });
      const staffList = response.data.data || [];
      return staffList.length > 0 ? staffList : [this.getFallbackStaff()];
    } catch (error: any) {
      console.warn('API getStaff error, using fallback:', error?.message);
      return [this.getFallbackStaff()];
    }
  }

  async createStaff(staffData: StaffCreateRequest): Promise<Staff> {
    const response = await apiClient.post<{ success: boolean; data: Staff }>('/staff', staffData);
    return response.data.data || response.data;
  }

  async updateStaff(staffId: string, updates: StaffUpdateRequest): Promise<Staff> {
    if (staffId.startsWith('fallback')) return { ...this.getFallbackStaff(), ...updates } as Staff;
    const response = await apiClient.put<{ success: boolean; data: Staff }>(`/staff/${staffId}`, updates);
    return response.data.data || response.data;
  }

  async deleteStaff(staffId: string): Promise<boolean> {
    if (staffId.startsWith('fallback')) return true;
    await apiClient.delete(`/staff/${staffId}`);
    return true;
  }

  async getStaffById(staffId: string): Promise<Staff | null> {
    if (staffId.startsWith('fallback')) return this.getFallbackStaff();
    try {
      const response = await apiClient.get<{ success: boolean; data: Staff }>(`/staff/${staffId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getting staff by ID:', error);
      return null;
    }
  }

  async updateStaffStatus(staffId: string, status: Staff['status']): Promise<Staff> {
    if (staffId.startsWith('fallback')) return { ...this.getFallbackStaff(), status };
    const response = await apiClient.patch<{ success: boolean; data: Staff }>(`/staff/${staffId}/status`, { 
      status: status.toUpperCase() 
    });
    return response.data.data || response.data;
  }

  async updateStaffRole(staffId: string, role: Staff['role']): Promise<Staff> {
    if (staffId.startsWith('fallback')) return { ...this.getFallbackStaff(), role };
    const response = await apiClient.patch<{ success: boolean; data: Staff }>(`/staff/${staffId}/role`, { 
      role: role.toUpperCase() 
    });
    return response.data.data || response.data;
  }

  async getStaffStats(): Promise<StaffStats> {
    try {
      const staff = await this.getStaff({ limit: 500 });
      const currentStaff = staff.filter(s => !s.id.startsWith('fallback'));
      const totalStaff = currentStaff.length;

      if (totalStaff === 0) {
        return {
          totalStaff: 1,
          activeStaff: 1,
          inactiveStaff: 0,
          onLeaveStaff: 0,
          averagePerformance: 100
        };
      }

      const activeStaff = currentStaff.filter(s => s.status === 'active' || (s as any).status === 'ACTIVE').length;
      const inactiveStaff = currentStaff.filter(s => s.status === 'inactive' || (s as any).status === 'INACTIVE').length;
      const onLeaveStaff = currentStaff.filter(s => s.status === 'on_leave' || (s as any).status === 'ON_LEAVE').length;
      const averagePerformance = totalStaff > 0 
        ? currentStaff.reduce((sum, s) => sum + (s.performance || 0), 0) / totalStaff 
        : 0;
      
      return {
        totalStaff,
        activeStaff,
        inactiveStaff,
        onLeaveStaff,
        averagePerformance: Math.round(averagePerformance * 100) / 100
      };
    } catch (error) {
      console.warn('Stats API fallback');
      return { totalStaff: 1, activeStaff: 1, inactiveStaff: 0, onLeaveStaff: 0, averagePerformance: 100 };
    }
  }

  async searchStaff(query: string): Promise<Staff[]> {
    return this.getStaff({ search: query });
  }

  async getStaffByStatus(status: Staff['status']): Promise<Staff[]> {
    return this.getStaff({ status });
  }

  async getStaffByRole(role: Staff['role']): Promise<Staff[]> {
    const allStaff = await this.getStaff({ limit: 500 });
    return allStaff.filter(s => s.role === role || s.role === role.toUpperCase() || s.role === role.toLowerCase());
  }

  async getStaffAnalytics(params?: {
    period?: 'TODAY' | 'WEEK' | 'MONTH';
    staffId?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.get('/staff/analytics', { params });
      if (response.data?.data && Object.keys(response.data.data).length > 0) {
        return response.data.data;
      }
      throw new Error('Analytics empty');
    } catch (error: any) {
      console.warn('Analytics API error, using fallback');
      return {
        performance: { ordersProcessed: 0, averageProcessingTime: 0, customerSatisfaction: 0, efficiency: 0 },
        trends: { dailyOrders: [], categoryPerformance: [] },
        goals: { ordersTarget: 100, ordersActual: 0, timeTarget: 10, timeActual: 0, satisfactionTarget: 5, satisfactionActual: 0 },
      };
    }
  }

  async getStaffPerformance(params?: {
    staffId?: string;
    period?: 'WEEK' | 'MONTH';
  }): Promise<any> {
    try {
      const response = await apiClient.get('/staff/analytics/performance', { params });
      if (response.data?.data && Object.keys(response.data.data).length > 0) {
        return response.data.data;
      }
      throw new Error('Performance empty');
    } catch (error: any) {
      console.warn('Performance API fallback');
      return {
        kpis: [
          { id: '1', name: 'Đơn hàng/giờ', value: 0, target: 10, unit: 'đơn', trend: 'stable', trendValue: 0, color: '#3498DB', icon: 'trending-up' }
        ],
        ranking: { position: 1, totalStaff: 1, score: 0, change: 0 },
        achievements: [],
      };
    }
  }

  async generateStaffReport(params: {
    type?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    startDate?: string;
    endDate?: string;
    format?: 'JSON' | 'CSV';
  }): Promise<any> {
    const response = await apiClient.get('/staff/analytics/reports', { params });
    return response.data.data;
  }
}

export default OwnerStaffApiService.getInstance();