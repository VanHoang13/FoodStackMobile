import apiClient from './api';
import AuthService from './authService';

export interface RestaurantStatistics {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  totalMenuItems: number;
  activeTables: number;
  avgServiceTime: string;
  revenueChange: number;
  ordersChange: number;
  totalTables: number;
  totalBranches: number;
  avgOrderValue: number;
  weeklyOrders: number;
  weeklyRevenue: number;
  monthlyOrders: number;
  monthlyRevenue: number;
}

export interface RestaurantInfo {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

class RestaurantStatisticsService {
  private static instance: RestaurantStatisticsService;

  public static getInstance(): RestaurantStatisticsService {
    if (!RestaurantStatisticsService.instance) {
      RestaurantStatisticsService.instance = new RestaurantStatisticsService();
    }
    return RestaurantStatisticsService.instance;
  }

  async getRestaurantInfo(): Promise<RestaurantInfo[]> {
    try {
      console.log('🏪 Attempting to fetch restaurant info from API...');
      
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: RestaurantInfo[];
      }>('/restaurants/me');

      console.log('✅ Restaurant info loaded from API:', response.data);
      return response.data.data || [];
    } catch (error: any) {
      console.error('❌ Error getting restaurant info from API:', error?.message || error);
      
      if (error?.response?.status === 401) {
        console.log('🔐 Authentication failed - user needs to login again');
        await AuthService.logout();
      }
      
      return [];
    }
  }

  async getRestaurantStatistics(from?: string, to?: string): Promise<RestaurantStatistics> {
    try {
      console.log('📊 Attempting to fetch restaurant statistics from API...');

      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: RestaurantStatistics;
      }>('/restaurants/me/statistics', { params });

      console.log('✅ Restaurant statistics loaded from API:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error getting restaurant statistics from API:', error?.message || error);
      
      if (error?.response?.status === 401) {
        console.log('🔐 Authentication failed - user needs to login again');
        await AuthService.logout();
      }
      
      throw error;
    }
  }

  private getMockRestaurantInfo(): RestaurantInfo[] {
    return [
      {
        id: 'restaurant-1',
        name: 'Nhà Hàng Phố Cổ',
        description: 'Nhà hàng phục vụ các món ăn truyền thống Việt Nam',
        address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
        phone: '0901234567',
        email: 'info@phoco.com',
        logo_url: 'https://via.placeholder.com/200x200?text=Pho+Co',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      }
    ];
  }

  private getMockStatistics(): RestaurantStatistics {
    // Generate realistic mock data
    const todayOrders = Math.floor(Math.random() * 20) + 8; // 8-28 orders
    const avgOrderValue = 75000 + Math.floor(Math.random() * 50000); // 75k-125k VND
    const todayRevenue = todayOrders * avgOrderValue;
    
    return {
      todayOrders,
      todayRevenue,
      pendingOrders: Math.floor(Math.random() * 8) + 1, // 1-8 pending
      totalMenuItems: 18, // From menu management service
      activeTables: Math.floor(Math.random() * 12) + 4, // 4-15 active tables
      avgServiceTime: `${Math.floor(Math.random() * 10) + 8}m ${Math.floor(Math.random() * 60)}s`,
      revenueChange: (Math.random() * 30) - 5, // -5% to +25%
      ordersChange: (Math.random() * 25) - 2, // -2% to +23%
      totalTables: 20,
      totalBranches: 3,
      avgOrderValue,
      weeklyOrders: todayOrders * 7 + Math.floor(Math.random() * 50),
      weeklyRevenue: todayRevenue * 7 + Math.floor(Math.random() * 1000000),
      monthlyOrders: todayOrders * 30 + Math.floor(Math.random() * 200),
      monthlyRevenue: todayRevenue * 30 + Math.floor(Math.random() * 5000000),
    };
  }
}

export default RestaurantStatisticsService.getInstance();