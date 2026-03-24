// src/controller/restaurant-statistics.js

class RestaurantStatisticsController {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getMyStatistics(req, res, next) {
    try {
      // Validate current user is OWNER or MANAGER
      if (!['OWNER', 'MANAGER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Owner or Manager can view restaurant statistics'
        });
      }

      const restaurantId = req.user.restaurantId || req.user.restaurant_id;
      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Current user does not have a restaurantId'
        });
      }

      console.log('📊 Fetching restaurant statistics for:', restaurantId);

      // Get date range (default to today)
      const { from, to } = req.query;
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Calculate statistics from mock data
      const statistics = await this.calculateStatistics(restaurantId, startOfDay, endOfDay);

      console.log('✅ Restaurant statistics calculated:', statistics);

      res.status(200).json({
        success: true,
        message: 'Restaurant statistics retrieved successfully',
        data: statistics,
      });
    } catch (error) {
      console.error('❌ Error getting restaurant statistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async getMyRestaurants(req, res, next) {
    try {
      // Validate current user is OWNER or MANAGER
      if (!['OWNER', 'MANAGER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Owner or Manager can view restaurants'
        });
      }

      const restaurantId = req.user.restaurantId || req.user.restaurant_id;
      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Current user does not have a restaurantId'
        });
      }

      console.log('🏪 Fetching restaurant info for:', restaurantId);

      // Get restaurant data from mock data
      const mockData = require('../data/mockData');
      const restaurant = mockData.mockRestaurants.find(r => r.id === restaurantId);

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found',
        });
      }

      console.log('✅ Restaurant info loaded:', restaurant.name);

      res.status(200).json({
        success: true,
        message: 'Restaurant info retrieved successfully',
        data: [restaurant], // Return as array to match API expectation
      });
    } catch (error) {
      console.error('❌ Error getting restaurant info:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async calculateStatistics(restaurantId, startDate, endDate) {
    try {
      const mockData = require('../data/mockData');
      
      // Get all data for the restaurant
      // Note: mockMenuItems doesn't have restaurant_id, so we'll use all items
      const menuItems = mockData.mockMenuItems || [];
      const orders = mockData.mockOrders.filter(order => order.restaurant_id === restaurantId);
      const branches = mockData.mockBranches.filter(branch => branch.restaurant_id === restaurantId);
      const tables = mockData.mockTables.filter(table => 
        branches.some(branch => branch.id === table.branch_id)
      );

      // Calculate today's orders (simulate some orders for today)
      const todayOrders = Math.floor(Math.random() * 20) + 5; // 5-25 orders
      
      // Calculate today's revenue based on menu items and orders
      const avgOrderValue = menuItems.length > 0 
        ? menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length 
        : 50000;
      const todayRevenue = Math.floor(todayOrders * avgOrderValue * (0.8 + Math.random() * 0.4)); // 80-120% of avg

      // Calculate pending orders (simulate)
      const pendingOrders = Math.floor(Math.random() * 8) + 1; // 1-8 pending orders

      // Get total menu items - use all available menu items
      let totalMenuItems = menuItems.filter(item => item.available !== false).length;
      console.log('📊 Menu items count from data:', totalMenuItems);

      // Calculate active tables
      const activeTables = Math.floor(tables.length * (0.3 + Math.random() * 0.4)); // 30-70% occupied

      // Calculate average service time (simulate)
      const avgServiceTimeMinutes = Math.floor(Math.random() * 10) + 8; // 8-18 minutes
      const avgServiceTime = `${avgServiceTimeMinutes}m ${Math.floor(Math.random() * 60)}s`;

      // Calculate changes (simulate growth)
      const revenueChange = (Math.random() * 30) - 5; // -5% to +25%
      const ordersChange = (Math.random() * 25) - 2; // -2% to +23%

      return {
        todayOrders,
        todayRevenue,
        pendingOrders,
        totalMenuItems,
        activeTables,
        avgServiceTime,
        revenueChange: Math.round(revenueChange * 10) / 10,
        ordersChange: Math.round(ordersChange * 10) / 10,
        // Additional statistics
        totalTables: tables.length,
        totalBranches: branches.length,
        avgOrderValue: Math.round(avgOrderValue),
        // Weekly/Monthly stats (simulated)
        weeklyOrders: todayOrders * 7 + Math.floor(Math.random() * 50),
        weeklyRevenue: todayRevenue * 7 + Math.floor(Math.random() * 1000000),
        monthlyOrders: todayOrders * 30 + Math.floor(Math.random() * 200),
        monthlyRevenue: todayRevenue * 30 + Math.floor(Math.random() * 5000000),
      };
    } catch (error) {
      console.error('❌ Error calculating statistics:', error);
      throw error;
    }
  }
}

module.exports = { RestaurantStatisticsController };