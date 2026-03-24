/**
 * Staff Dashboard Routes
 * API routes for staff dashboard and operations
 */

const express = require('express');

/**
 * Create staff dashboard routes
 * @param {Function} authMiddleware - Auth middleware for protected routes
 * @returns {express.Router} Express router
 */
function createStaffDashboardRoutes(authMiddleware) {
  const router = express.Router();

  if (!authMiddleware) {
    throw new Error('authMiddleware is required for staff dashboard routes');
  }

  /**
   * @route   GET /api/v1/staff/dashboard/stats
   * @desc    Get staff dashboard statistics
   * @access  Private (Staff+)
   */
  router.get('/stats', authMiddleware, async (req, res) => {
    try {
      const staffId = req.user.userId;
      const branchId = req.user.branchId; // Assuming staff is assigned to a branch

      // TODO: Implement actual database queries
      // Mock data for now
      const stats = {
        ordersToday: 24,
        ordersCompleted: 18,
        averageTime: 12,
        activeOrders: 6,
        pendingRequests: 3,
        tablesAssigned: 8,
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Get staff dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard stats',
        error: error.message
      });
    }
  });

  /**
   * @route   GET /api/v1/staff/profile
   * @desc    Get staff profile information
   * @access  Private (Staff+)
   */
  router.get('/profile', authMiddleware, async (req, res) => {
    try {
      const staffId = req.user.userId;

      // TODO: Implement actual database query
      // Mock data for now
      const profile = {
        id: staffId,
        fullName: req.user.fullName || 'Staff Member',
        email: req.user.email,
        phone: '0123456789',
        role: req.user.role,
        status: 'ACTIVE',
        joinDate: '2024-01-15',
        branch: 'Chi nhánh Quận 1',
        restaurant: 'FoodStack Restaurant',
      };

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('❌ Get staff profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get staff profile',
        error: error.message
      });
    }
  });

  /**
   * @route   GET /api/v1/staff/performance
   * @desc    Get staff performance statistics
   * @access  Private (Staff+)
   */
  router.get('/performance', authMiddleware, async (req, res) => {
    try {
      const staffId = req.user.userId;

      // TODO: Implement actual performance calculation
      // Mock data for now
      const performance = {
        ordersProcessed: 156,
        averageTime: 12,
        customerRating: 4.8,
        shiftsCompleted: 24,
      };

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      console.error('❌ Get staff performance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get staff performance',
        error: error.message
      });
    }
  });

  /**
   * @route   GET /api/v1/staff/tables
   * @desc    Get tables for staff management
   * @access  Private (Staff+)
   */
  router.get('/tables', authMiddleware, async (req, res) => {
    try {
      const branchId = req.query.branchId || req.user.branchId;

      // TODO: Implement actual database query
      // Mock data for now
      const tables = [
        {
          id: '1',
          number: 'A01',
          area: 'Khu A',
          capacity: 4,
          status: 'OCCUPIED',
          currentOrder: {
            id: '1',
            orderNumber: 'ORD-001',
            customerCount: 3,
            startTime: '10:30',
            totalAmount: 250000,
          },
        },
        {
          id: '2',
          number: 'A02',
          area: 'Khu A',
          capacity: 2,
          status: 'AVAILABLE',
        },
        // Add more mock tables...
      ];

      res.json({
        success: true,
        data: tables
      });
    } catch (error) {
      console.error('❌ Get staff tables error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get tables',
        error: error.message
      });
    }
  });

  /**
   * @route   PATCH /api/v1/staff/tables/:tableId/status
   * @desc    Update table status
   * @access  Private (Staff+)
   */
  router.patch('/tables/:tableId/status', authMiddleware, async (req, res) => {
    try {
      const { tableId } = req.params;
      const { status, notes } = req.body;
      const staffId = req.user.userId;

      // TODO: Implement actual database update
      console.log(`Staff ${staffId} updating table ${tableId} to ${status}`);

      res.json({
        success: true,
        message: 'Table status updated successfully'
      });
    } catch (error) {
      console.error('❌ Update table status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update table status',
        error: error.message
      });
    }
  });

  /**
   * @route   GET /api/v1/staff/service-requests
   * @desc    Get service requests for staff
   * @access  Private (Staff+)
   */
  router.get('/service-requests', authMiddleware, async (req, res) => {
    try {
      const { status } = req.query;
      const branchId = req.user.branchId;

      // TODO: Implement actual database query
      // Mock data for now
      const requests = [
        {
          id: '1',
          table: 'B02',
          type: 'WATER',
          priority: 'NORMAL',
          time: '10:32',
          message: 'Cần thêm nước',
          status: 'PENDING',
        },
        {
          id: '2',
          table: 'A05',
          type: 'ASSISTANCE',
          priority: 'HIGH',
          time: '10:28',
          message: 'Cần hỗ trợ thanh toán',
          status: 'PENDING',
        },
        // Add more mock requests...
      ];

      const filteredRequests = status 
        ? requests.filter(req => req.status === status)
        : requests;

      res.json({
        success: true,
        data: filteredRequests
      });
    } catch (error) {
      console.error('❌ Get service requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service requests',
        error: error.message
      });
    }
  });

  /**
   * @route   PATCH /api/v1/staff/service-requests/:requestId/status
   * @desc    Update service request status
   * @access  Private (Staff+)
   */
  router.patch('/service-requests/:requestId/status', authMiddleware, async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status, response } = req.body;
      const staffId = req.user.userId;

      // TODO: Implement actual database update
      console.log(`Staff ${staffId} updating service request ${requestId} to ${status}`);

      res.json({
        success: true,
        message: 'Service request status updated successfully'
      });
    } catch (error) {
      console.error('❌ Update service request status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update service request status',
        error: error.message
      });
    }
  });

  /**
   * @route   GET /api/v1/staff/kitchen/orders
   * @desc    Get kitchen orders for staff
   * @access  Private (Staff+)
   */
  router.get('/kitchen/orders', authMiddleware, async (req, res) => {
    try {
      const { status } = req.query;
      const branchId = req.user.branchId;

      // TODO: Implement actual database query
      // Mock data for now
      const orders = [
        {
          id: '1',
          orderNumber: 'ORD-20240322-001',
          status: 'PENDING',
          priority: 'HIGH',
          createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
          estimatedTime: 15,
          elapsedTime: 5,
          table: { name: 'B01', area: 'VIP' },
          customerCount: 4,
          items: [
            { id: '1', name: 'Phở Bò Tái', quantity: 2, notes: 'Ít hành' },
            { id: '2', name: 'Bún Chả', quantity: 1 },
          ],
        },
        // Add more mock orders...
      ];

      const filteredOrders = status 
        ? orders.filter(order => order.status === status)
        : orders;

      res.json({
        success: true,
        data: filteredOrders
      });
    } catch (error) {
      console.error('❌ Get kitchen orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get kitchen orders',
        error: error.message
      });
    }
  });

  return router;
}

module.exports = { createStaffDashboardRoutes };