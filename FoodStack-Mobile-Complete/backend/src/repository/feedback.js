const { prisma } = require('../config/database.config');
const { v4: uuidv4 } = require('uuid');

class FeedbackRepository {
  async create(data) {
    const feedbackData = {
      id: uuidv4(),
      restaurant_id: data.restaurantId,
      branch_id: data.branchId,
      customer_name: data.customerInfo?.name,
      customer_email: data.customerInfo?.email,
      overall_rating: data.overallRating,
      food_rating: data.categoryRatings?.foodQuality,
      service_rating: data.categoryRatings?.service,
      ambiance_rating: data.categoryRatings?.atmosphere,
      comment: data.comment,
      dish_ratings: data.dishRatings || null,
      is_anonymous: data.isAnonymous || false,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Handle order_id requirement
    if (data.orderId) {
      feedbackData.order_id = data.orderId;
    } else {
      // For general restaurant feedback without specific order, 
      // find any order from the same branch to satisfy the constraint
      const anyOrder = await prisma.orders.findFirst({
        where: { branch_id: data.branchId },
        select: { id: true }
      });
      
      if (anyOrder) {
        feedbackData.order_id = anyOrder.id;
      } else {
        throw new Error('No orders found for this branch. Cannot create feedback without an order reference.');
      }
    }

    return await prisma.feedbacks.create({
      data: feedbackData
    });
  }

  async findById(id) {
    return await prisma.feedbacks.findUnique({
      where: { id }
    });
  }

  async findByOrderId(orderId) {
    return await prisma.feedbacks.findFirst({
      where: { order_id: orderId }
    });
  }

  async findByRestaurant(restaurantId, options = {}) {
    const {
      page = 1,
      limit = 10,
      rating = null,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    const where = {
      restaurant_id: restaurantId
    };

    if (rating) {
      where.overall_rating = rating;
    }

    const [feedback, total, summary] = await Promise.all([
      prisma.feedbacks.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.feedbacks.count({ where }),
      this.getFeedbackSummary(restaurantId)
    ]);

    return {
      feedback,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      summary
    };
  }

  async findByBranch(branchId, options = {}) {
    const {
      page = 1,
      limit = 10,
      rating = null,
      from = null,
      to = null,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    const where = {
      branch_id: branchId
    };

    if (rating) {
      where.overall_rating = rating;
    }

    if (from && to) {
      where.created_at = {
        gte: new Date(from),
        lte: new Date(to)
      };
    }

    const [feedback, total, summary] = await Promise.all([
      prisma.feedbacks.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.feedbacks.count({ where }),
      this.getFeedbackSummary(null, branchId)
    ]);

    return {
      feedback,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      summary
    };
  }

  async getFeedbackSummary(restaurantId = null, branchId = null) {
    const where = {};
    
    if (restaurantId) {
      where.restaurant_id = restaurantId;
    }
    
    if (branchId) {
      where.branch_id = branchId;
    }

    const [
      totalFeedback,
      averageRating,
      ratingDistribution
    ] = await Promise.all([
      prisma.feedbacks.count({ where }),
      prisma.feedbacks.aggregate({
        where,
        _avg: {
          overall_rating: true,
          food_rating: true,
          service_rating: true,
          ambiance_rating: true
        }
      }),
      prisma.feedbacks.groupBy({
        by: ['overall_rating'],
        where,
        _count: { overall_rating: true }
      })
    ]);

    return {
      totalFeedback,
      averageRating: averageRating._avg.overall_rating || 0,
      categoryAverages: {
        foodQuality: averageRating._avg.food_rating || 0,
        service: averageRating._avg.service_rating || 0,
        atmosphere: averageRating._avg.ambiance_rating || 0
      },
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item.overall_rating] = item._count.overall_rating;
        return acc;
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    };
  }

  async getStats(restaurantId, options = {}) {
    const { from, to, branchId } = options;
    
    const where = { 
      restaurant_id: restaurantId
    };

    if (branchId) {
      where.branch_id = branchId;
    }

    if (from && to) {
      where.created_at = {
        gte: new Date(from),
        lte: new Date(to)
      };
    }

    const summary = await this.getFeedbackSummary(restaurantId, branchId);

    // Get trends (monthly data for the last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await prisma.feedbacks.groupBy({
      by: ['created_at'],
      where: {
        ...where,
        created_at: {
          gte: sixMonthsAgo
        }
      },
      _avg: { overall_rating: true },
      _count: { id: true }
    });

    // Get common complaints and praises from comments
    const comments = await prisma.feedbacks.findMany({
      where: {
        ...where,
        comment: { not: null },
        overall_rating: { lte: 3 } // Low ratings for complaints
      },
      select: { comment: true, overall_rating: true },
      take: 100
    });

    const praises = await prisma.feedbacks.findMany({
      where: {
        ...where,
        comment: { not: null },
        overall_rating: { gte: 4 } // High ratings for praises
      },
      select: { comment: true, overall_rating: true },
      take: 100
    });

    return {
      ...summary,
      trends: this.processTrends(trends),
      topComplaints: this.extractKeywords(comments.map(c => c.comment)),
      topPraises: this.extractKeywords(praises.map(c => c.comment))
    };
  }

  async addResponse(id, responseData) {
    return await prisma.feedbacks.update({
      where: { id },
      data: {
        response: responseData.response,
        responded_at: new Date(),
        responded_by: responseData.respondedBy,
        updated_at: new Date()
      }
    });
  }

  async updateStatus(id, statusData) {
    return await prisma.feedbacks.update({
      where: { id },
      data: {
        ...statusData,
        updated_at: new Date()
      }
    });
  }

  processTrends(trends) {
    // Group by month and calculate averages
    const monthlyData = {};
    
    trends.forEach(trend => {
      const month = new Date(trend.created_at).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { totalRating: 0, count: 0 };
      }
      monthlyData[month].totalRating += trend._avg.overall_rating * trend._count.id;
      monthlyData[month].count += trend._count.id;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      averageRating: data.count > 0 ? data.totalRating / data.count : 0,
      feedbackCount: data.count
    }));
  }

  extractKeywords(comments) {
    // Simple keyword extraction - in production, use NLP libraries
    const keywords = {};
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'cannot', 'not', 'no', 'yes', 'very', 'too', 'so', 'just', 'only', 'even', 'also', 'still', 'more', 'most', 'much', 'many', 'some', 'any', 'all', 'each', 'every', 'this', 'that', 'these', 'those'];

    comments.forEach(comment => {
      if (comment) {
        const words = comment.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3 && !commonWords.includes(word));

        words.forEach(word => {
          keywords[word] = (keywords[word] || 0) + 1;
        });
      }
    });

    return Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  }
}

module.exports = { FeedbackRepository };