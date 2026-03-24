import storage from './storageService';
import { getApiBaseUrl } from './api-config';

const API_BASE_URL = getApiBaseUrl();

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager_name: string;
  manager_phone: string;
  is_active: boolean;
  opening_hours: {
    open: string;
    close: string;
  };
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BranchStats {
  totalBranches: number;
  activeBranches: number;
  inactiveBranches: number;
  totalTables: number;
}

export interface BranchData {
  branches: Branch[];
  stats: BranchStats;
}

class BranchManagementService {
  private static instance: BranchManagementService;
  private storageKey = 'branch_management_data';

  static getInstance(): BranchManagementService {
    if (!BranchManagementService.instance) {
      BranchManagementService.instance = new BranchManagementService();
    }
    return BranchManagementService.instance;
  }

  async getBranchData(): Promise<BranchData> {
    try {
      const storedData = await storage.getItem(this.storageKey);
      if (storedData) {
        return JSON.parse(storedData);
      }
      
      // Return empty data if no stored data
      return {
        branches: [],
        stats: {
          totalBranches: 0,
          activeBranches: 0,
          inactiveBranches: 0,
          totalTables: 0,
        }
      };
    } catch (error) {
      console.error('Error getting branch data:', error);
      throw error;
    }
  }

  private async saveBranchData(branchData: BranchData): Promise<void> {
    try {
      await storage.setItem(this.storageKey, JSON.stringify(branchData));
    } catch (error) {
      console.error('Error saving branch data:', error);
      throw error;
    }
  }

  async getBranches(): Promise<Branch[]> {
    const data = await this.getBranchData();
    return data.branches;
  }

  async createBranch(branchInput: Omit<Branch, 'id' | 'created_at' | 'updated_at'>): Promise<Branch> {
    try {
      const data = await this.getBranchData();
      
      const newBranch: Branch = {
        id: `branch-${Date.now()}`,
        ...branchInput,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      data.branches.push(newBranch);
      
      // Update stats
      data.stats = this.calculateStats(data.branches);
      
      await this.saveBranchData(data);
      
      // Try to sync with backend
      this.syncWithBackend(newBranch, 'create').catch(console.error);
      
      return newBranch;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  async updateBranch(branchId: string, updates: Partial<Branch>): Promise<Branch | null> {
    try {
      const data = await this.getBranchData();
      
      const branchIndex = data.branches.findIndex(branch => branch.id === branchId);
      if (branchIndex === -1) {
        return null;
      }

      const updatedBranch: Branch = {
        ...data.branches[branchIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      data.branches[branchIndex] = updatedBranch;
      
      // Update stats
      data.stats = this.calculateStats(data.branches);
      
      await this.saveBranchData(data);
      
      // Try to sync with backend
      this.syncWithBackend(updatedBranch, 'update').catch(console.error);
      
      return updatedBranch;
    } catch (error) {
      console.error('Error updating branch:', error);
      throw error;
    }
  }

  async deleteBranch(branchId: string): Promise<boolean> {
    try {
      const data = await this.getBranchData();
      
      const branchIndex = data.branches.findIndex(branch => branch.id === branchId);
      if (branchIndex === -1) {
        return false;
      }

      const deletedBranch = data.branches[branchIndex];
      data.branches.splice(branchIndex, 1);
      
      // Update stats
      data.stats = this.calculateStats(data.branches);
      
      await this.saveBranchData(data);
      
      // Try to sync with backend
      this.syncWithBackend(deletedBranch, 'delete').catch(console.error);
      
      return true;
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw error;
    }
  }

  async toggleBranchStatus(branchId: string): Promise<Branch | null> {
    try {
      const data = await this.getBranchData();
      
      const branchIndex = data.branches.findIndex(branch => branch.id === branchId);
      if (branchIndex === -1) {
        return null;
      }

      const updatedBranch: Branch = {
        ...data.branches[branchIndex],
        is_active: !data.branches[branchIndex].is_active,
        updated_at: new Date().toISOString(),
      };

      data.branches[branchIndex] = updatedBranch;
      
      // Update stats
      data.stats = this.calculateStats(data.branches);
      
      await this.saveBranchData(data);
      
      // Try to sync with backend
      this.syncWithBackend(updatedBranch, 'update').catch(console.error);
      
      return updatedBranch;
    } catch (error) {
      console.error('Error toggling branch status:', error);
      throw error;
    }
  }

  async getBranchStats(): Promise<BranchStats> {
    const data = await this.getBranchData();
    return data.stats;
  }

  private calculateStats(branches: Branch[]): BranchStats {
    const totalBranches = branches.length;
    const activeBranches = branches.filter(b => b.is_active).length;
    const inactiveBranches = totalBranches - activeBranches;
    const totalTables = totalBranches * 15; // Mock: 15 tables per branch

    return {
      totalBranches,
      activeBranches,
      inactiveBranches,
      totalTables,
    };
  }

  async searchBranches(query: string): Promise<Branch[]> {
    const branches = await this.getBranches();
    
    if (!query.trim()) {
      return branches;
    }

    const searchTerm = query.toLowerCase();
    return branches.filter(branch =>
      branch.name.toLowerCase().includes(searchTerm) ||
      branch.address.toLowerCase().includes(searchTerm) ||
      branch.manager_name.toLowerCase().includes(searchTerm) ||
      branch.phone.includes(searchTerm) ||
      branch.email.toLowerCase().includes(searchTerm)
    );
  }

  async getActiveBranches(): Promise<Branch[]> {
    const branches = await this.getBranches();
    return branches.filter(branch => branch.is_active);
  }

  async getInactiveBranches(): Promise<Branch[]> {
    const branches = await this.getBranches();
    return branches.filter(branch => !branch.is_active);
  }

  // Sync with backend (optional - for when backend API is available)
  private async syncWithBackend(branch: Branch, operation: 'create' | 'update' | 'delete'): Promise<void> {
    try {
      const token = await storage.getItem('accessToken');
      if (!token) {
        console.log('No auth token, skipping backend sync');
        return;
      }

      let url = `${API_BASE_URL}/api/v1/branches`;
      let method = 'POST';
      let body: any = branch;

      switch (operation) {
        case 'update':
          url += `/${branch.id}`;
          method = 'PUT';
          break;
        case 'delete':
          url += `/${branch.id}`;
          method = 'DELETE';
          body = undefined;
          break;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        console.warn(`Backend sync failed for ${operation}:`, response.status);
      } else {
        console.log(`Backend sync successful for ${operation}`);
      }
    } catch (error) {
      console.warn('Backend sync error:', error);
      // Don't throw error - local operations should still work
    }
  }

  // Initialize with mock data
  async initializeMockData(): Promise<void> {
    try {
      const existingData = await this.getBranchData();
      
      // Only initialize if no data exists
      if (existingData.branches.length === 0) {
        await this.createMockBranches();
      }
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }
  }

  // Reset and recreate mock data (for testing/demo purposes)
  async resetMockData(): Promise<void> {
    try {
      await storage.removeItem(this.storageKey);
      await this.createMockBranches();
      console.log('Mock branch data reset and recreated');
    } catch (error) {
      console.error('Error resetting mock data:', error);
    }
  }

  private async createMockBranches(): Promise<void> {
    try {
      const mockBranches: Branch[] = [
          {
            id: 'branch-1',
            name: 'FoodStack Downtown',
            address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
            phone: '0901234567',
            email: 'downtown@foodstack.com',
            manager_name: 'Nguyễn Văn Minh',
            manager_phone: '0907654321',
            is_active: true,
            opening_hours: { open: '08:00', close: '22:00' },
            image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'branch-2',
            name: 'FoodStack Garden Plaza',
            address: '456 Võ Văn Tần, Quận 3, TP.HCM',
            phone: '0901234568',
            email: 'garden@foodstack.com',
            manager_name: 'Trần Thị Lan',
            manager_phone: '0907654322',
            is_active: true,
            opening_hours: { open: '09:00', close: '23:00' },
            image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop&crop=center',
            created_at: '2024-02-01T00:00:00Z',
            updated_at: '2024-02-01T00:00:00Z',
          },
          {
            id: 'branch-3',
            name: 'FoodStack Riverside',
            address: '789 Đại lộ Bình Dương, Thủ Đức, TP.HCM',
            phone: '0901234569',
            email: 'riverside@foodstack.com',
            manager_name: 'Lê Văn Hùng',
            manager_phone: '0907654323',
            is_active: false,
            opening_hours: { open: '08:30', close: '21:30' },
            image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop&crop=center',
            created_at: '2024-03-01T00:00:00Z',
            updated_at: '2024-03-01T00:00:00Z',
          },
          {
            id: 'branch-4',
            name: 'FoodStack Skyline',
            address: '321 Lê Lợi, Quận 1, TP.HCM',
            phone: '0901234570',
            email: 'skyline@foodstack.com',
            manager_name: 'Phạm Thị Mai',
            manager_phone: '0907654324',
            is_active: true,
            opening_hours: { open: '10:00', close: '24:00' },
            image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=250&fit=crop&crop=center',
            created_at: '2024-04-01T00:00:00Z',
            updated_at: '2024-04-01T00:00:00Z',
          },
          {
            id: 'branch-5',
            name: 'FoodStack Beachside',
            address: '654 Trần Hưng Đạo, Quận 5, TP.HCM',
            phone: '0901234571',
            email: 'beachside@foodstack.com',
            manager_name: 'Hoàng Văn Đức',
            manager_phone: '0907654325',
            is_active: true,
            opening_hours: { open: '07:00', close: '22:30' },
            image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=250&fit=crop&crop=center',
            created_at: '2024-05-01T00:00:00Z',
            updated_at: '2024-05-01T00:00:00Z',
          },
          {
            id: 'branch-6',
            name: 'FoodStack Urban Loft',
            address: '987 Pasteur, Quận 3, TP.HCM',
            phone: '0901234572',
            email: 'urbanloft@foodstack.com',
            manager_name: 'Vũ Thị Hoa',
            manager_phone: '0907654326',
            is_active: true,
            opening_hours: { open: '11:00', close: '23:30' },
            image_url: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=400&h=250&fit=crop&crop=center',
            created_at: '2024-06-01T00:00:00Z',
            updated_at: '2024-06-01T00:00:00Z',
          },
          {
            id: 'branch-7',
            name: 'FoodStack Heritage',
            address: '147 Bùi Viện, Quận 1, TP.HCM',
            phone: '0901234573',
            email: 'heritage@foodstack.com',
            manager_name: 'Đặng Văn Thành',
            manager_phone: '0907654327',
            is_active: false,
            opening_hours: { open: '09:30', close: '22:00' },
            image_url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&h=250&fit=crop&crop=center',
            created_at: '2024-07-01T00:00:00Z',
            updated_at: '2024-07-01T00:00:00Z',
          },
          {
            id: 'branch-8',
            name: 'FoodStack Modern',
            address: '258 Cách Mạng Tháng 8, Quận 10, TP.HCM',
            phone: '0901234574',
            email: 'modern@foodstack.com',
            manager_name: 'Bùi Thị Ngọc',
            manager_phone: '0907654328',
            is_active: true,
            opening_hours: { open: '08:00', close: '23:00' },
            image_url: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&h=250&fit=crop&crop=center',
            created_at: '2024-08-01T00:00:00Z',
            updated_at: '2024-08-01T00:00:00Z',
          },
        ];

      const mockData: BranchData = {
        branches: mockBranches,
        stats: this.calculateStats(mockBranches),
      };

      await this.saveBranchData(mockData);
      console.log('Mock branch data initialized with 8 branches');
    } catch (error) {
      console.error('Error creating mock branches:', error);
    }
  }
}

export default BranchManagementService.getInstance();