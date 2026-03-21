const { prisma } = require('../config/database.config');

class AnalyticsService {
  // Revenue Analytics
  async getRevenueAnalytics(restaurantId, branchId = null, startDate, endDate) {
    const whereClause = {
      branches: {
        restaurant_id: restaurantId
      },
      payment_status: 'PAID',
      created_at: {
        gte: startDate,
        lte: endDate
      }
    };

    if (branchId) {
      whereClause.branch_id = branchId;
    }

    const [totalRevenue, orderCount, avgOrderValue, revenueByDay] = await Promise.all([
      // Total revenue
      prisma.orders.aggregate({
        where: whereClause,
        _sum: { total: true }
      }),

      // Order count
      prisma.orders.count({
        where: whereClause
      }),

      // Average order value
      prisma.orders.aggregate({
        where: whereClause,
        _avg: { total: true }
      }),

      // Revenue by day - use simpler query
      prisma.orders.findMany({
        where: whereClause,
        select: {
          created_at: true,
          total: true
        }
      })
    ]);

    // Process revenue by day manually
    const revenueByDayMap = new Map();
    revenueByDay.forEach(order => {
      const date = order.created_at.toISOString().split('T')[0];
      if (!revenueByDayMap.has(date)) {
        revenueByDayMap.set(date, { revenue: 0, orders: 0 });
      }
      const dayData = revenueByDayMap.get(date);
      dayData.revenue += parseFloat(order.total);
      dayData.orders += 1;
    });

    const revenueByDayArray = Array.from(revenueByDayMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders
    }));

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      orderCount,
      avgOrderValue: avgOrderValue._avg.total || 0,
      revenueByDay: revenueByDayArray
    };
  }

  // Order Analytics
  async getOrderAnalytics(restaurantId, branchId = null, startDate, endDate) {
    const whereClause = {
      branches: {
        restaurant_id: restaurantId
      },
      created_at: {
        gte: startDate,
        lte: endDate
      }
    };

    if (branchId) {
      whereClause.branch_id = branchId;
    }

    const [ordersByStatus, orders] = await Promise.all([
      // Orders by status
      prisma.orders.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true
      }),

      // Get all orders for processing
      prisma.orders.findMany({
        where: whereClause,
        select: {
          created_at: true,
          updated_at: true,
          status: true
        }
      })
    ]);

    // Process orders by hour manually
    const ordersByHourMap = new Map();
    orders.forEach(order => {
      const hour = order.created_at.getHours();
      ordersByHourMap.set(hour, (ordersByHourMap.get(hour) || 0) + 1);
    });

    const ordersByHour = Array.from(ordersByHourMap.entries()).map(([hour, orders]) => ({
      hour: parseInt(hour),
      orders
    }));

    // Calculate average preparation time
    const completedOrders = orders.filter(o => o.status === 'COMPLETED');
    const avgPreparationTime = completedOrders.length > 0 
      ? completedOrders.reduce((sum, order) => {
          const prepTime = (order.updated_at.getTime() - order.created_at.getTime()) / (1000 * 60);
          return sum + prepTime;
        }, 0) / completedOrders.length
      : 0;

    return {
      ordersByStatus: ordersByStatus.map(item => ({
        status: item.status,
        count: item._count
      })),
      ordersByHour,
      avgPreparationTime
    };
  }

  // Menu Performance Analytics
  async getMenuAnalytics(restaurantId, branchId = null, startDate, endDate) {
    const whereClause = {
      orders: {
        branches: {
          restaurant_id: restaurantId
        },
        payment_status: 'PAID',
        created_at: {
          gte: startDate,
          lte: endDate
        }
      }
    };

    if (branchId) {
      whereClause.orders.branch_id = branchId;
    }

    // Get top selling items using simpler approach
    const topSellingItems = await prisma.order_items.groupBy({
      by: ['menu_item_id'],
      where: whereClause,
      _sum: { quantity: true },
      _count: true,
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    // Get menu item details for top selling items
    const menuItemIds = topSellingItems.map(item => item.menu_item_id);
    const menuItems = await prisma.menu_items.findMany({
      where: { id: { in: menuItemIds } },
      select: { id: true, name: true, price: true }
    });

    const topSellingWithDetails = topSellingItems.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
      return {
        ...item,
        itemName: menuItem?.name || 'Unknown',
        itemPrice: menuItem?.price || 0,
        totalQuantity: item._sum.quantity
      };
    });

    // Get category performance - simplified
    const categoryPerformance = await prisma.categories.findMany({
      where: {
        branches: {
          restaurant_id: restaurantId,
          ...(branchId && { id: branchId })
        }
      },
      select: {
        id: true,
        name: true,
        menu_items: {
          select: {
            order_items: {
              where: {
                orders: {
                  payment_status: 'PAID',
                  created_at: {
                    gte: startDate,
                    lte: endDate
                  }
                }
              },
              select: {
                quantity: true,
                subtotal: true
              }
            }
          }
        }
      }
    });

    const categoryPerformanceFormatted = categoryPerformance.map(category => {
      let totalQuantity = 0;
      let totalRevenue = 0;
      
      category.menu_items.forEach(item => {
        item.order_items.forEach(orderItem => {
          totalQuantity += orderItem.quantity;
          totalRevenue += parseFloat(orderItem.subtotal);
        });
      });

      return {
        categoryName: category.name,
        totalQuantity,
        totalRevenue,
        orderCount: category.menu_items.reduce((sum, item) => sum + item.order_items.length, 0)
      };
    });

    return {
      topSellingItems: topSellingWithDetails,
      categoryPerformance: categoryPerformanceFormatted,
      itemRevenue: topSellingWithDetails.map(item => ({
        itemId: item.menu_item_id,
        itemName: item.itemName,
        totalQuantity: item.totalQuantity,
        totalRevenue: parseFloat(item.itemPrice) * item.totalQuantity,
        avgPrice: parseFloat(item.itemPrice)
      }))
    };
  }

  // Customer Analytics
  async getCustomerAnalytics(restaurantId, branchId = null, startDate, endDate) {
    const whereClause = {
      branches: {
        restaurant_id: restaurantId
      },
      created_at: {
        gte: startDate,
        lte: endDate
      }
    };

    if (branchId) {
      whereClause.branch_id = branchId;
    }

    const [customerCount, avgPartySize, orders] = await Promise.all([
      // Total customers (sum of customer_count)
      prisma.orders.aggregate({
        where: whereClause,
        _sum: { customer_count: true }
      }),

      // Average party size
      prisma.orders.aggregate({
        where: whereClause,
        _avg: { customer_count: true }
      }),

      // Get orders for processing peak hours
      prisma.orders.findMany({
        where: whereClause,
        select: {
          created_at: true,
          customer_count: true,
          table_id: true
        }
      })
    ]);

    // Process peak hours manually
    const hourlyStats = new Map();
    orders.forEach(order => {
      const hour = order.created_at.getHours();
      if (!hourlyStats.has(hour)) {
        hourlyStats.set(hour, { orderCount: 0, customerCount: 0 });
      }
      const stats = hourlyStats.get(hour);
      stats.orderCount += 1;
      stats.customerCount += order.customer_count || 1;
    });

    const peakHours = Array.from(hourlyStats.entries())
      .map(([hour, stats]) => ({
        hour: parseInt(hour),
        orderCount: stats.orderCount,
        customerCount: stats.customerCount
      }))
      .sort((a, b) => b.customerCount - a.customerCount);

    // Get table utilization - simplified since we don't have direct relations
    const tableUtilization = await prisma.tables.findMany({
      where: {
        areas: {
          branches: {
            restaurant_id: restaurantId,
            ...(branchId && { id: branchId })
          }
        }
      },
      select: {
        id: true,
        table_number: true,
        capacity: true,
        orders: {
          where: {
            created_at: {
              gte: startDate,
              lte: endDate
            }
          },
          select: {
            customer_count: true,
            created_at: true,
            updated_at: true
          }
        }
      }
    });

    const tableStats = tableUtilization.map(table => {
      const orderCount = table.orders.length;
      const totalCustomers = table.orders.reduce((sum, order) => sum + (order.customer_count || 1), 0);
      const avgDuration = table.orders.length > 0 
        ? table.orders.reduce((sum, order) => {
            const duration = (order.updated_at.getTime() - order.created_at.getTime()) / (1000 * 60);
            return sum + duration;
          }, 0) / table.orders.length
        : 0;

      return {
        tableName: table.table_number,
        capacity: table.capacity,
        orderCount,
        totalCustomers,
        avgDuration: Math.round(avgDuration),
        utilizationRate: table.capacity > 0 ? (totalCustomers / table.capacity) * 100 : 0
      };
    });

    return {
      totalCustomers: customerCount._sum.customer_count || 0,
      avgPartySize: avgPartySize._avg.customer_count || 0,
      peakHours,
      tableUtilization: tableStats
    };
  }

  // Staff Performance Analytics
  async getStaffAnalytics(restaurantId, branchId = null, startDate, endDate) {
    const whereClause = {
      restaurant_id: restaurantId,
      created_at: {
        gte: startDate,
        lte: endDate
      }
    };

    if (branchId) {
      whereClause.branch_id = branchId;
    }

    // Get staff performance from activity logs (simplified)
    const activityLogs = await prisma.activity_logs.findMany({
      where: {
        restaurant_id: restaurantId,
        entity_type: 'ORDER',
        action: {
          in: ['UPDATE_STATUS', 'CONFIRM_ORDER']
        },
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        user_id: true,
        entity_id: true,
        created_at: true
      }
    });

    // Process staff performance manually
    const staffStats = new Map();
    activityLogs.forEach(log => {
      if (!log.user_id) return;
      
      if (!staffStats.has(log.user_id)) {
        staffStats.set(log.user_id, {
          ordersHandled: new Set(),
          totalActions: 0
        });
      }
      
      const stats = staffStats.get(log.user_id);
      stats.ordersHandled.add(log.entity_id);
      stats.totalActions += 1;
    });

    // Get user names for staff
    const userIds = Array.from(staffStats.keys());
    const users = await prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, full_name: true }
    });

    const staffPerformance = Array.from(staffStats.entries()).map(([userId, stats]) => {
      const user = users.find(u => u.id === userId);
      return {
        staffId: userId,
        staffName: user?.full_name || 'Unknown',
        ordersHandled: stats.ordersHandled.size,
        avgResponseTime: 0 // Would need more complex calculation
      };
    });

    // Service request stats - using notifications as proxy
    const serviceNotifications = await prisma.notifications.findMany({
      where: {
        type: 'SERVICE_REQUEST',
        ...(branchId && { branch_id: branchId }),
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        user_id: true,
        data: true
      }
    });

    const serviceStats = new Map();
    serviceNotifications.forEach(notif => {
      const assignedTo = notif.data?.assignedTo || notif.user_id;
      if (!assignedTo) return;

      if (!serviceStats.has(assignedTo)) {
        serviceStats.set(assignedTo, { requestsHandled: 0 });
      }
      serviceStats.get(assignedTo).requestsHandled += 1;
    });

    const serviceRequestStats = Array.from(serviceStats.entries()).map(([userId, stats]) => {
      const user = users.find(u => u.id === userId);
      return {
        staffId: userId,
        staffName: user?.full_name || 'Unassigned',
        requestsHandled: stats.requestsHandled,
        avgResolutionTime: 0 // Would need more complex calculation
      };
    });

    return {
      staffPerformance,
      serviceRequestStats
    };
  }

  // Feedback Analytics
  async getFeedbackAnalytics(restaurantId, branchId = null, startDate, endDate) {
    const whereClause = {
      restaurant_id: restaurantId,
      created_at: {
        gte: startDate,
        lte: endDate
      }
    };

    if (branchId) {
      whereClause.branch_id = branchId;
    }

    const [ratingStats, feedbacks, categoryRatings] = await Promise.all([
      // Overall rating statistics
      prisma.feedbacks.aggregate({
        where: whereClause,
        _avg: {
          overall_rating: true,
          food_rating: true,
          service_rating: true,
          ambiance_rating: true
        },
        _count: true
      }),

      // Get feedbacks for trends processing
      prisma.feedbacks.findMany({
        where: whereClause,
        select: {
          created_at: true,
          overall_rating: true
        }
      }),

      // Rating distribution
      prisma.feedbacks.groupBy({
        by: ['overall_rating'],
        where: whereClause,
        _count: true,
        orderBy: {
          overall_rating: 'desc'
        }
      })
    ]);

    // Process feedback trends by day manually
    const trendMap = new Map();
    feedbacks.forEach(feedback => {
      const date = feedback.created_at.toISOString().split('T')[0];
      if (!trendMap.has(date)) {
        trendMap.set(date, { totalRating: 0, count: 0 });
      }
      const dayData = trendMap.get(date);
      dayData.totalRating += feedback.overall_rating;
      dayData.count += 1;
    });

    const feedbackTrends = Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      avgRating: data.count > 0 ? data.totalRating / data.count : 0,
      feedbackCount: data.count
    }));

    return {
      averageRatings: {
        overall: ratingStats._avg.overall_rating || 0,
        foodQuality: ratingStats._avg.food_rating || 0,
        service: ratingStats._avg.service_rating || 0,
        atmosphere: ratingStats._avg.ambiance_rating || 0
      },
      totalFeedbacks: ratingStats._count,
      feedbackTrends,
      ratingDistribution: categoryRatings.map(item => ({
        rating: item.overall_rating,
        count: item._count
      }))
    };
  }

  // Comprehensive dashboard data
  async getDashboardData(restaurantId, branchId = null, period = '7d') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    const [revenue, orders, menu, customers, feedback] = await Promise.all([
      this.getRevenueAnalytics(restaurantId, branchId, startDate, endDate),
      this.getOrderAnalytics(restaurantId, branchId, startDate, endDate),
      this.getMenuAnalytics(restaurantId, branchId, startDate, endDate),
      this.getCustomerAnalytics(restaurantId, branchId, startDate, endDate),
      this.getFeedbackAnalytics(restaurantId, branchId, startDate, endDate)
    ]);

    return {
      period,
      startDate,
      endDate,
      revenue,
      orders,
      menu,
      customers,
      feedback,
      generatedAt: new Date()
    };
  }
}

module.exports = { AnalyticsService };