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

  // Get all staff with pagination and filters
  async getStaff(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    branchId?: string;
  }): Promise<Staff[]> {
    try {
      console.log('🔄 Attempting to fetch staff from API...');
      
      // Check authentication first
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        console.log('⚠️ User not authenticated, falling back to mock data');
        return this.getMockStaffData().filter(staff => {
          if (params?.status && staff.status !== params.status) return false;
          if (params?.search) {
            const query = params.search.toLowerCase();
            return staff.name.toLowerCase().includes(query) ||
                   staff.email.toLowerCase().includes(query) ||
                   staff.phone.includes(query);
          }
          return true;
        });
      }

      // Check user role
      const userData = await AuthService.getUserData();
      if (!userData || !['OWNER', 'MANAGER'].includes(userData.role)) {
        console.log('⚠️ User does not have permission to access staff data. Current role:', userData?.role || 'unknown');
        console.log('💡 Please login with an OWNER or MANAGER account to access staff management features');
        return this.getMockStaffData().filter(staff => {
          if (params?.status && staff.status !== params.status) return false;
          if (params?.search) {
            const query = params.search.toLowerCase();
            return staff.name.toLowerCase().includes(query) ||
                   staff.email.toLowerCase().includes(query) ||
                   staff.phone.includes(query);
          }
          return true;
        });
      }

      console.log('✅ User authenticated with role:', userData.role);

      const response = await apiClient.get<StaffListResponse>('/staff', { params });
      console.log('✅ Staff data loaded from API:', response.data);
      return response.data.data || [];
    } catch (error: any) {
      console.error('❌ Error getting staff from API:', error?.message || error);
      
      // Log more details about the error
      if (error?.response) {
        console.error('API Response Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // If it's a 401 error, the user needs to login again
        if (error.response.status === 401) {
          console.log('🔐 Authentication failed - user needs to login again');
          console.log('💡 Please login with owner@foodstack.test / password123 to access staff management');
          // Clear stored auth data
          await AuthService.logout();
        }
      } else if (error?.request) {
        console.error('Network Error - No response received');
      } else {
        console.error('Request Setup Error:', error.message);
      }
      
      console.log('⚠️ Falling back to mock staff data');
      // Return mock data when API is not available
      return this.getMockStaffData().filter(staff => {
        if (params?.status && staff.status !== params.status) return false;
        if (params?.search) {
          const query = params.search.toLowerCase();
          return staff.name.toLowerCase().includes(query) ||
                 staff.email.toLowerCase().includes(query) ||
                 staff.phone.includes(query);
        }
        return true;
      });
    }
  }

  // Create new staff member
  async createStaff(staffData: StaffCreateRequest): Promise<Staff> {
    try {
      const response = await apiClient.post<{ success: boolean; data: Staff }>('/staff', staffData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  }

  // Update staff member
  async updateStaff(staffId: string, updates: StaffUpdateRequest): Promise<Staff> {
    try {
      const response = await apiClient.put<{ success: boolean; data: Staff }>(`/staff/${staffId}`, updates);
      return response.data.data;
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  }

  // Delete staff member (soft delete)
  async deleteStaff(staffId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/staff/${staffId}`);
      return true;
    } catch (error) {
      console.error('Error deleting staff:', error);
      return false;
    }
  }

  // Get staff by ID
  async getStaffById(staffId: string): Promise<Staff | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Staff }>(`/staff/${staffId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting staff by ID:', error);
      return null;
    }
  }

  // Update staff status
  async updateStaffStatus(staffId: string, status: Staff['status']): Promise<Staff> {
    try {
      const response = await apiClient.patch<{ success: boolean; data: Staff }>(`/staff/${staffId}/status`, { 
        status: status.toUpperCase() 
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating staff status:', error);
      throw error;
    }
  }

  // Update staff role
  async updateStaffRole(staffId: string, role: Staff['role']): Promise<Staff> {
    try {
      const response = await apiClient.patch<{ success: boolean; data: Staff }>(`/staff/${staffId}/role`, { 
        role: role.toUpperCase() 
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating staff role:', error);
      throw error;
    }
  }

  // Get staff statistics (calculated from API data)
  async getStaffStats(): Promise<StaffStats> {
    try {
      console.log('🔄 Attempting to fetch staff stats from API...');
      const staff = await this.getStaff({ limit: 500 }); // Increased limit for stats calculation
      
      const totalStaff = staff.length;
      const activeStaff = staff.filter(s => s.status === 'active').length;
      const inactiveStaff = staff.filter(s => s.status === 'inactive').length;
      const onLeaveStaff = staff.filter(s => s.status === 'on_leave').length;
      const averagePerformance = totalStaff > 0 
        ? staff.reduce((sum, s) => sum + (s.performance || 0), 0) / totalStaff 
        : 0;
      
      const stats = {
        totalStaff,
        activeStaff,
        inactiveStaff,
        onLeaveStaff,
        averagePerformance: Math.round(averagePerformance * 100) / 100
      };
      
      console.log('✅ Staff statistics calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting staff stats:', error);
      
      console.log('⚠️ Statistics API not available, using mock data');
      // Return mock data when API is not available
      return {
        totalStaff: 8,
        activeStaff: 6,
        inactiveStaff: 1,
        onLeaveStaff: 1,
        averagePerformance: 87.5
      };
    }
  }

  // Search staff
  async searchStaff(query: string): Promise<Staff[]> {
    try {
      return await this.getStaff({ search: query });
    } catch (error) {
      console.error('Error searching staff:', error);
      return [];
    }
  }

  // Get staff by status
  async getStaffByStatus(status: Staff['status']): Promise<Staff[]> {
    try {
      return await this.getStaff({ status });
    } catch (error) {
      console.error('Error getting staff by status:', error);
      return [];
    }
  }

  // Get staff by role
  async getStaffByRole(role: Staff['role']): Promise<Staff[]> {
    try {
      const allStaff = await this.getStaff({ limit: 500 }); // Increased limit
      return allStaff.filter(s => s.role === role);
    } catch (error) {
      console.error('Error getting staff by role:', error);
      return [];
    }
  }

  // Get staff analytics from backend
  async getStaffAnalytics(params?: {
    period?: 'TODAY' | 'WEEK' | 'MONTH';
    staffId?: string;
  }): Promise<any> {
    try {
      console.log('🔄 Attempting to fetch staff analytics from API...');
      const response = await apiClient.get('/staff/analytics', { params });
      console.log('✅ Staff analytics loaded from API:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error getting staff analytics:', error?.message || error);
      
      console.log('⚠️ Analytics API not available, using mock data');
      // Return mock analytics data when API is not available
      return {
        performance: {
          ordersProcessed: 156,
          averageProcessingTime: 8.5,
          customerSatisfaction: 4.7,
          efficiency: 92,
        },
        trends: {
          dailyOrders: [
            { date: '2024-01-15', count: 22 },
            { date: '2024-01-16', count: 28 },
            { date: '2024-01-17', count: 31 },
            { date: '2024-01-18', count: 25 },
            { date: '2024-01-19', count: 35 },
            { date: '2024-01-20', count: 29 },
            { date: '2024-01-21', count: 33 },
          ],
          categoryPerformance: [
            { category: 'Phở', orders: 45, revenue: 2250000 },
            { category: 'Bún', orders: 32, revenue: 1600000 },
            { category: 'Cơm', orders: 28, revenue: 1260000 },
            { category: 'Đồ uống', orders: 51, revenue: 765000 },
          ],
        },
        goals: {
          ordersTarget: 180,
          ordersActual: 156,
          timeTarget: 10,
          timeActual: 8.5,
          satisfactionTarget: 4.5,
          satisfactionActual: 4.7,
        },
      };
    }
  }

  // Get staff performance data
  async getStaffPerformance(params?: {
    staffId?: string;
    period?: 'WEEK' | 'MONTH';
  }): Promise<any> {
    try {
      console.log('🔄 Attempting to fetch staff performance from API...');
      const response = await apiClient.get('/staff/analytics/performance', { params });
      console.log('✅ Staff performance loaded from API:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error getting staff performance:', error?.message || error);
      
      console.log('⚠️ Performance API not available, using mock data');
      // Return mock performance data when API is not available
      return {
        kpis: [
          {
            id: '1',
            name: 'Đơn hàng/giờ',
            value: 12.5,
            target: 15,
            unit: 'đơn',
            trend: 'up',
            trendValue: 8.3,
            color: '#3498DB',
            icon: 'trending-up',
          },
          {
            id: '2',
            name: 'Thời gian phục vụ',
            value: 8.2,
            target: 10,
            unit: 'phút',
            trend: 'down',
            trendValue: -12.5,
            color: '#27AE60',
            icon: 'clock',
          },
          {
            id: '3',
            name: 'Độ chính xác',
            value: 96.8,
            target: 95,
            unit: '%',
            trend: 'up',
            trendValue: 2.1,
            color: '#E67E22',
            icon: 'target',
          },
          {
            id: '4',
            name: 'Đánh giá khách hàng',
            value: 4.7,
            target: 4.5,
            unit: '/5',
            trend: 'stable',
            trendValue: 0,
            color: '#9B59B6',
            icon: 'star',
          },
        ],
        ranking: {
          position: 3,
          totalStaff: 15,
          score: 892,
          change: 2,
        },
        achievements: [
          {
            id: '1',
            title: 'Speed Demon',
            description: 'Xử lý 100 đơn hàng trong 1 ngày',
            icon: 'zap',
            color: '#F39C12',
            unlockedAt: '2024-01-20',
          },
          {
            id: '2',
            title: 'Customer Favorite',
            description: 'Nhận 50 đánh giá 5 sao',
            icon: 'heart',
            color: '#E74C3C',
            unlockedAt: '2024-01-18',
          },
        ],
      };
    }
  }

  // Generate staff reports
  async generateStaffReport(params: {
    type?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    startDate?: string;
    endDate?: string;
    format?: 'JSON' | 'CSV';
  }): Promise<any> {
    try {
      const response = await apiClient.get('/staff/analytics/reports', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error generating staff report:', error);
      throw error;
    }
  }
}

// Mock data for fallback when API is not available
const getMockStaffData = (): Staff[] => {
  return [
    {
      id: 'staff_1',
      name: 'Trần Văn A',
      email: 'tranvana@restaurant.com',
      phone: '0901234567',
      role: 'CHEF',
      status: 'active',
      joinDate: '2023-01-15',
      shift: 'full_time',
      performance: 92,
      isOnline: true,
      address: '123 Nguyễn Văn Linh, Q7, TP.HCM',
      emergencyContact: '0987654321',
      salary: 15000000,
      notes: 'Đầu bếp chính, có kinh nghiệm 5 năm',
      created_at: '2023-01-15T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z'
    },
    {
      id: 'staff_2',
      name: 'Nguyễn Thị B',
      email: 'nguyenthib@restaurant.com',
      phone: '0912345678',
      role: 'WAITER',
      status: 'active',
      joinDate: '2023-03-20',
      shift: 'morning',
      performance: 88,
      isOnline: true,
      address: '456 Lê Văn Việt, Q9, TP.HCM',
      emergencyContact: '0976543210',
      salary: 8000000,
      notes: 'Phục vụ nhiệt tình, được khách hàng yêu thích',
      created_at: '2023-03-20T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z'
    },
    {
      id: 'staff_3',
      name: 'Lê Văn C',
      email: 'levanc@restaurant.com',
      phone: '0923456789',
      role: 'CASHIER',
      status: 'active',
      joinDate: '2023-02-10',
      shift: 'afternoon',
      performance: 85,
      isOnline: false,
      address: '789 Võ Văn Ngân, Thủ Đức, TP.HCM',
      emergencyContact: '0965432109',
      salary: 9000000,
      notes: 'Thu ngân chính xác, ít sai sót',
      created_at: '2023-02-10T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z'
    },
    {
      id: 'staff_4',
      name: 'Phạm Thị D',
      email: 'phamthid@restaurant.com',
      phone: '0934567890',
      role: 'MANAGER',
      status: 'active',
      joinDate: '2022-11-05',
      shift: 'full_time',
      performance: 95,
      isOnline: true,
      address: '321 Điện Biên Phủ, Q3, TP.HCM',
      emergencyContact: '0954321098',
      salary: 20000000,
      notes: 'Quản lý ca, có khả năng lãnh đạo tốt',
      created_at: '2022-11-05T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z'
    },
    {
      id: 'staff_5',
      name: 'Hoàng Văn E',
      email: 'hoangvane@restaurant.com',
      phone: '0945678901',
      role: 'CHEF',
      status: 'on_leave',
      joinDate: '2023-04-12',
      shift: 'evening',
      performance: 78,
      isOnline: false,
      address: '654 Cách Mạng Tháng 8, Q10, TP.HCM',
      emergencyContact: '0943210987',
      salary: 12000000,
      notes: 'Đang nghỉ phép thai sản',
      created_at: '2023-04-12T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z'
    },
    {
      id: 'staff_6',
      name: 'Vũ Thị F',
      email: 'vuthif@restaurant.com',
      phone: '0956789012',
      role: 'WAITER',
      status: 'inactive',
      joinDate: '2023-05-18',
      shift: 'morning',
      performance: 65,
      isOnline: false,
      address: '987 Phan Văn Trị, Gò Vấp, TP.HCM',
      emergencyContact: '0932109876',
      salary: 7500000,
      notes: 'Tạm nghỉ việc do lý do cá nhân',
      created_at: '2023-05-18T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z'
    },
    {
      id: 'staff_7',
      name: 'Đặng Văn G',
      email: 'dangvang@restaurant.com',
      phone: '0967890123',
      role: 'WAITER',
      status: 'active',
      joinDate: '2023-06-25',
      shift: 'evening',
      performance: 82,
      isOnline: true,
      address: '147 Hoàng Văn Thụ, Tân Bình, TP.HCM',
      emergencyContact: '0921098765',
      salary: 8200000,
      notes: 'Nhân viên mới, đang trong thời gian thử việc',
      created_at: '2023-06-25T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z'
    },
    {
      id: 'staff_8',
      name: 'Bùi Thị H',
      email: 'buithih@restaurant.com',
      phone: '0978901234',
      role: 'CASHIER',
      status: 'active',
      joinDate: '2023-01-30',
      shift: 'full_time',
      performance: 90,
      isOnline: true,
      address: '258 Lý Thường Kiệt, Q11, TP.HCM',
      emergencyContact: '0910987654',
      salary: 9500000,
      notes: 'Thu ngân kinh nghiệm, xử lý tốt các tình huống',
      created_at: '2023-01-30T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z'
    }
  ];
};

export default OwnerStaffApiService.getInstance();