/**
 * Admin Routes
 * Comprehensive admin management endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { prisma } = require('../../config/database.config');

// Admin middleware - require ADMIN role for all routes
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

/**
 * GET /api/v1/admin/dashboard
 * Get admin dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    console.log('📊 Admin dashboard stats requested');

    // Get comprehensive system statistics
    const [
      totalRestaurants,
      totalUsers,
      totalOrders,
      totalRevenue,
      activeOrders,
      pendingApprovals,
      recentActivity
    ] = await Promise.all([
      // Total restaurants
      prisma.restaurant.count(),
      
      // Total users
      prisma.user.count(),
      
      // Total orders
      prisma.order.count(),
      
      // Total revenue
      prisma.order.aggregate({
        _sum: { total_amount: true },
        where: { payment_status: 'SUCCESS' }
      }),
      
      // Active orders
      prisma.order.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] }
        }
      }),
      
      // Pending approvals (restaurants waiting for approval)
      prisma.restaurant.count({
        where: { status: 'PENDING' }
      }),
      
      // Recent activity (last 10 orders)
      prisma.order.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          branch: {
            include: { restaurant: true }
          },
          table: true
        }
      })
    ]);

    // Calculate growth rates (mock for now - would need historical data)
    const revenueGrowth = 15.2;
    const userGrowth = 8.5;

    const stats = {
      totalRestaurants,
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.total_amount || 0,
      activeOrders,
      pendingApprovals,
      revenueGrowth,
      userGrowth,
      recentActivity: recentActivity.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        total: order.total_amount,
        restaurant: order.branch.restaurant.name,
        createdAt: order.created_at
      }))
    };

    console.log('✅ Admin dashboard stats loaded successfully');
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải thống kê admin'
    });
  }
});

/**
 * GET /api/v1/admin/restaurants
 * Get all restaurants with pagination and filters
 */
router.get('/restaurants', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          branches: {
            include: {
              _count: {
                select: { orders: true }
              }
            }
          },
          _count: {
            select: { 
              branches: true,
              users: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.restaurant.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        restaurants: restaurants.map(restaurant => ({
          id: restaurant.id,
          name: restaurant.name,
          email: restaurant.email,
          phone: restaurant.phone,
          address: restaurant.address,
          status: restaurant.status,
          logoUrl: restaurant.logo_url,
          branchCount: restaurant._count.branches,
          userCount: restaurant._count.users,
          totalOrders: restaurant.branches.reduce((sum, branch) => sum + branch._count.orders, 0),
          createdAt: restaurant.created_at,
          updatedAt: restaurant.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Admin restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách nhà hàng'
    });
  }
});

/**
 * PUT /api/v1/admin/restaurants/:id/status
 * Update restaurant status (approve/reject)
 */
router.put('/restaurants/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        status,
        status_reason: reason || null,
        updated_at: new Date()
      }
    });

    // Log admin activity
    await prisma.activityLog.create({
      data: {
        user_id: req.user.id,
        action: 'UPDATE_RESTAURANT_STATUS',
        entity_type: 'RESTAURANT',
        entity_id: id,
        details: { status, reason }
      }
    });

    res.json({
      success: true,
      data: restaurant,
      message: `Trạng thái nhà hàng đã được cập nhật thành ${status}`
    });

  } catch (error) {
    console.error('❌ Update restaurant status error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái nhà hàng'
    });
  }
});

/**
 * GET /api/v1/admin/users
 * Get all users with pagination and filters
 */
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          restaurant: {
            select: { id: true, name: true }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          restaurant: user.restaurant,
          emailVerified: user.email_verified,
          lastLogin: user.last_login,
          createdAt: user.created_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách người dùng'
    });
  }
});

/**
 * PUT /api/v1/admin/users/:id/status
 * Update user status
 */
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        status,
        status_reason: reason || null,
        updated_at: new Date()
      }
    });

    // Log admin activity
    await prisma.activityLog.create({
      data: {
        user_id: req.user.id,
        action: 'UPDATE_USER_STATUS',
        entity_type: 'USER',
        entity_id: id,
        details: { status, reason }
      }
    });

    res.json({
      success: true,
      data: user,
      message: `Trạng thái người dùng đã được cập nhật thành ${status}`
    });

  } catch (error) {
    console.error('❌ Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái người dùng'
    });
  }
});

/**
 * GET /api/v1/admin/orders
 * Get all orders with pagination and filters
 */
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, restaurant_id, date_from, date_to } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (restaurant_id) {
      where.branch = {
        restaurant_id
      };
    }
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          branch: {
            include: { restaurant: true }
          },
          table: {
            include: { area: true }
          },
          order_items: {
            include: { menu_item: true }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        orders: orders.map(order => ({
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          paymentStatus: order.payment_status,
          subtotal: order.sub_total,
          total: order.total_amount,
          customerCount: order.customer_count,
          restaurant: order.branch.restaurant.name,
          branch: order.branch.name,
          table: `${order.table.name} - ${order.table.area.name}`,
          itemCount: order.order_items.length,
          createdAt: order.created_at,
          updatedAt: order.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách đơn hàng'
    });
  }
});

/**
 * GET /api/v1/admin/reports/overview
 * Get system overview reports
 */
router.get('/reports/overview', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const [
      orderStats,
      revenueStats,
      userStats,
      restaurantStats,
      topRestaurants,
      orderTrends
    ] = await Promise.all([
      // Order statistics
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
          created_at: { gte: startDate }
        }
      }),
      
      // Revenue statistics
      prisma.order.aggregate({
        _sum: { total_amount: true },
        _avg: { total_amount: true },
        _count: { id: true },
        where: {
          payment_status: 'SUCCESS',
          created_at: { gte: startDate }
        }
      }),
      
      // User statistics
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      }),
      
      // Restaurant statistics
      prisma.restaurant.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      
      // Top restaurants by revenue
      prisma.restaurant.findMany({
        include: {
          branches: {
            include: {
              orders: {
                where: {
                  payment_status: 'SUCCESS',
                  created_at: { gte: startDate }
                }
              }
            }
          }
        }
      }),
      
      // Order trends (daily)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as order_count,
          SUM(total_amount) as revenue
        FROM orders 
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `
    ]);

    // Process top restaurants
    const processedTopRestaurants = topRestaurants
      .map(restaurant => {
        const totalRevenue = restaurant.branches.reduce((sum, branch) => 
          sum + branch.orders.reduce((orderSum, order) => orderSum + order.total_amount, 0), 0
        );
        const totalOrders = restaurant.branches.reduce((sum, branch) => sum + branch.orders.length, 0);
        
        return {
          id: restaurant.id,
          name: restaurant.name,
          totalRevenue,
          totalOrders,
          averageOrder: totalOrders > 0 ? totalRevenue / totalOrders : 0
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        period,
        orderStats: orderStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.id;
          return acc;
        }, {}),
        revenueStats: {
          total: revenueStats._sum.total_amount || 0,
          average: revenueStats._avg.total_amount || 0,
          orderCount: revenueStats._count
        },
        userStats: userStats.reduce((acc, stat) => {
          acc[stat.role] = stat._count.id;
          return acc;
        }, {}),
        restaurantStats: restaurantStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.id;
          return acc;
        }, {}),
        topRestaurants: processedTopRestaurants,
        orderTrends: orderTrends.map(trend => ({
          date: trend.date,
          orderCount: parseInt(trend.order_count),
          revenue: parseFloat(trend.revenue) || 0
        }))
      }
    });

  } catch (error) {
    console.error('❌ Admin reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải báo cáo tổng quan'
    });
  }
});

/**
 * GET /api/v1/admin/activity-logs
 * Get system activity logs
 */
router.get('/activity-logs', async (req, res) => {
  try {
    const { page = 1, limit = 20, action, entity_type, user_id } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (action) where.action = action;
    if (entity_type) where.entity_type = entity_type;
    if (user_id) where.user_id = user_id;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          user: {
            select: { id: true, full_name: true, email: true, role: true }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.activityLog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        logs: logs.map(log => ({
          id: log.id,
          action: log.action,
          entityType: log.entity_type,
          entityId: log.entity_id,
          details: log.details,
          user: log.user,
          createdAt: log.created_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Admin activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải nhật ký hoạt động'
    });
  }
});

module.exports = router;