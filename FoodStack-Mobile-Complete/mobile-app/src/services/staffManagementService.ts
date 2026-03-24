import AsyncStorage from '@react-native-async-storage/async-storage';

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

class StaffManagementService {
  private static instance: StaffManagementService;
  private storageKey = 'foodstack_staff_management';

  static getInstance(): StaffManagementService {
    if (!StaffManagementService.instance) {
      StaffManagementService.instance = new StaffManagementService();
    }
    return StaffManagementService.instance;
  }

  // Get all staff
  async getStaff(): Promise<Staff[]> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting staff:', error);
      return [];
    }
  }

  // Save staff list
  private async saveStaff(staff: Staff[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(staff));
    } catch (error) {
      console.error('Error saving staff:', error);
      throw error;
    }
  }

  // Create new staff member
  async createStaff(staffData: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Promise<Staff> {
    try {
      const staff = await this.getStaff();
      
      const newStaff: Staff = {
        ...staffData,
        id: `staff_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      staff.push(newStaff);
      await this.saveStaff(staff);
      
      return newStaff;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  }

  // Update staff member
  async updateStaff(staffId: string, updates: Partial<Staff>): Promise<Staff | null> {
    try {
      const staff = await this.getStaff();
      const index = staff.findIndex(s => s.id === staffId);
      
      if (index === -1) return null;
      
      staff[index] = {
        ...staff[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      await this.saveStaff(staff);
      return staff[index];
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  }

  // Delete staff member
  async deleteStaff(staffId: string): Promise<boolean> {
    try {
      const staff = await this.getStaff();
      const filteredStaff = staff.filter(s => s.id !== staffId);
      await this.saveStaff(filteredStaff);
      return true;
    } catch (error) {
      console.error('Error deleting staff:', error);
      return false;
    }
  }

  // Get staff by ID
  async getStaffById(staffId: string): Promise<Staff | null> {
    try {
      const staff = await this.getStaff();
      return staff.find(s => s.id === staffId) || null;
    } catch (error) {
      console.error('Error getting staff by ID:', error);
      return null;
    }
  }

  // Update staff status
  async updateStaffStatus(staffId: string, status: Staff['status']): Promise<Staff | null> {
    return this.updateStaff(staffId, { status });
  }

  // Update staff performance
  async updateStaffPerformance(staffId: string, performance: number): Promise<Staff | null> {
    return this.updateStaff(staffId, { performance });
  }

  // Get staff statistics
  async getStaffStats(): Promise<StaffStats> {
    try {
      const staff = await this.getStaff();
      
      const totalStaff = staff.length;
      const activeStaff = staff.filter(s => s.status === 'active').length;
      const inactiveStaff = staff.filter(s => s.status === 'inactive').length;
      const onLeaveStaff = staff.filter(s => s.status === 'on_leave').length;
      const averagePerformance = totalStaff > 0 
        ? staff.reduce((sum, s) => sum + s.performance, 0) / totalStaff 
        : 0;
      
      return {
        totalStaff,
        activeStaff,
        inactiveStaff,
        onLeaveStaff,
        averagePerformance
      };
    } catch (error) {
      console.error('Error getting staff stats:', error);
      return {
        totalStaff: 0,
        activeStaff: 0,
        inactiveStaff: 0,
        onLeaveStaff: 0,
        averagePerformance: 0
      };
    }
  }

  // Search staff
  async searchStaff(query: string): Promise<Staff[]> {
    try {
      const staff = await this.getStaff();
      const lowercaseQuery = query.toLowerCase();
      
      return staff.filter(s =>
        s.name.toLowerCase().includes(lowercaseQuery) ||
        s.email.toLowerCase().includes(lowercaseQuery) ||
        s.phone.includes(query) ||
        s.role.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching staff:', error);
      return [];
    }
  }

  // Get staff by status
  async getStaffByStatus(status: Staff['status']): Promise<Staff[]> {
    try {
      const staff = await this.getStaff();
      return staff.filter(s => s.status === status);
    } catch (error) {
      console.error('Error getting staff by status:', error);
      return [];
    }
  }

  // Get staff by role
  async getStaffByRole(role: Staff['role']): Promise<Staff[]> {
    try {
      const staff = await this.getStaff();
      return staff.filter(s => s.role === role);
    } catch (error) {
      console.error('Error getting staff by role:', error);
      return [];
    }
  }

  // Initialize with mock data
  async initializeMockData(): Promise<void> {
    try {
      const existingStaff = await this.getStaff();
      if (existingStaff.length > 0) {
        console.log('StaffManagementService: Mock data already exists, skipping initialization');
        return;
      }

      await this.createMockStaffData();
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }
  }

  // Reset and recreate mock data
  async resetMockData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      await this.createMockStaffData();
      console.log('StaffManagementService: Mock data reset and recreated');
    } catch (error) {
      console.error('Error resetting mock data:', error);
    }
  }

  private async createMockStaffData(): Promise<void> {
    try {
      console.log('StaffManagementService: Creating mock staff data...');

      const mockStaffData: Omit<Staff, 'id' | 'created_at' | 'updated_at'>[] = [
        {
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
          notes: 'Đầu bếp chính, có kinh nghiệm 5 năm'
        },
        {
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
          notes: 'Phục vụ nhiệt tình, được khách hàng yêu thích'
        },
        {
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
          notes: 'Thu ngân chính xác, ít sai sót'
        },
        {
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
          notes: 'Quản lý ca, có khả năng lãnh đạo tốt'
        },
        {
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
          notes: 'Đang nghỉ phép thai sản'
        },
        {
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
          notes: 'Tạm nghỉ việc do lý do cá nhân'
        },
        {
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
          notes: 'Nhân viên mới, đang trong thời gian thử việc'
        },
        {
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
          notes: 'Thu ngân kinh nghiệm, xử lý tốt các tình huống'
        }
      ];

      // Create all staff members
      for (const staffData of mockStaffData) {
        await this.createStaff(staffData);
      }

      console.log('StaffManagementService: Mock staff data created successfully');
    } catch (error) {
      console.error('Error creating mock staff data:', error);
    }
  }
}

export default StaffManagementService.getInstance();