const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { AnalyticsService } = require('../../service/analytics');

const analyticsService = new AnalyticsService();

/**
 * @route GET /api/v1/analytics/dashboard/:restaurantId
 * @desc Get comprehensive dashboard analytics
 * @access Private (Owner, Manager)
 */
router.get('/dashboard/:restaurantId', auth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { branchId, period = '7d' } = req.query;

    // Check access permissions
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const dashboardData = await analyticsService.getDashboardData(
      restaurantId, 
      branchId || null, 
      period
    );

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard analytics'
    });
  }
});

/**
 * @route GET /api/v1/analytics/revenue/:restaurantId
 * @desc Get revenue analytics
 * @access Private (Owner, Manager)
 */
router.get('/revenue/:restaurantId', auth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { branchId, startDate, endDate } = req.query;

    // Check access permissions
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Default to last 30 days if no dates provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const revenueData = await analyticsService.getRevenueAnalytics(
      restaurantId,
      branchId || null,
      start,
      end
    );

    res.json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue analytics'
    });
  }
});

/**
 * @route GET /api/v1/analytics/orders/:restaurantId
 * @desc Get order analytics
 * @access Private (Owner, Manager)
 */
router.get('/orders/:restaurantId', auth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { branchId, startDate, endDate } = req.query;

    // Check access permissions
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const orderData = await analyticsService.getOrderAnalytics(
      restaurantId,
      branchId || null,
      start,
      end
    );

    res.json({
      success: true,
      data: orderData
    });
  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order analytics'
    });
  }
});

/**
 * @route GET /api/v1/analytics/menu/:restaurantId
 * @desc Get menu performance analytics
 * @access Private (Owner, Manager)
 */
router.get('/menu/:restaurantId', auth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { branchId, startDate, endDate } = req.query;

    // Check access permissions
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const menuData = await analyticsService.getMenuAnalytics(
      restaurantId,
      branchId || null,
      start,
      end
    );

    res.json({
      success: true,
      data: menuData
    });
  } catch (error) {
    console.error('Get menu analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get menu analytics'
    });
  }
});

/**
 * @route GET /api/v1/analytics/customers/:restaurantId
 * @desc Get customer analytics
 * @access Private (Owner, Manager)
 */
router.get('/customers/:restaurantId', auth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { branchId, startDate, endDate } = req.query;

    // Check access permissions
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const customerData = await analyticsService.getCustomerAnalytics(
      restaurantId,
      branchId || null,
      start,
      end
    );

    res.json({
      success: true,
      data: customerData
    });
  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer analytics'
    });
  }
});

/**
 * @route GET /api/v1/analytics/staff/:restaurantId
 * @desc Get staff performance analytics
 * @access Private (Owner, Manager)
 */
router.get('/staff/:restaurantId', auth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { branchId, startDate, endDate } = req.query;

    // Check access permissions
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const staffData = await analyticsService.getStaffAnalytics(
      restaurantId,
      branchId || null,
      start,
      end
    );

    res.json({
      success: true,
      data: staffData
    });
  } catch (error) {
    console.error('Get staff analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staff analytics'
    });
  }
});

/**
 * @route GET /api/v1/analytics/feedback/:restaurantId
 * @desc Get feedback analytics
 * @access Private (Owner, Manager)
 */
router.get('/feedback/:restaurantId', auth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { branchId, startDate, endDate } = req.query;

    // Check access permissions
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const feedbackData = await analyticsService.getFeedbackAnalytics(
      restaurantId,
      branchId || null,
      start,
      end
    );

    res.json({
      success: true,
      data: feedbackData
    });
  } catch (error) {
    console.error('Get feedback analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feedback analytics'
    });
  }
});

/**
 * @route GET /api/v1/analytics/export/:restaurantId
 * @desc Export analytics data to CSV/Excel
 * @access Private (Owner, Manager)
 */
router.get('/export/:restaurantId', auth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { branchId, startDate, endDate, format = 'csv', type = 'dashboard' } = req.query;

    // Check access permissions
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let data;
    switch (type) {
      case 'revenue':
        data = await analyticsService.getRevenueAnalytics(restaurantId, branchId || null, start, end);
        break;
      case 'orders':
        data = await analyticsService.getOrderAnalytics(restaurantId, branchId || null, start, end);
        break;
      case 'menu':
        data = await analyticsService.getMenuAnalytics(restaurantId, branchId || null, start, end);
        break;
      case 'customers':
        data = await analyticsService.getCustomerAnalytics(restaurantId, branchId || null, start, end);
        break;
      case 'feedback':
        data = await analyticsService.getFeedbackAnalytics(restaurantId, branchId || null, start, end);
        break;
      default:
        data = await analyticsService.getDashboardData(restaurantId, branchId || null, '30d');
    }

    // Set appropriate headers for file download
    const filename = `analytics_${type}_${restaurantId}_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.${format}`;
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Convert data to CSV format (simplified)
      const csvData = JSON.stringify(data, null, 2);
      res.send(csvData);
    } else {
      res.json({
        success: true,
        data,
        filename,
        exportedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data'
    });
  }
});

module.exports = router;