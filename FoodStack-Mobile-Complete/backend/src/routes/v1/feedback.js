const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { validation } = require('../../middleware/validation');
const { CreateFeedbackDto } = require('../../dto/feedback/create-feedback');

// Feedback Repository
const { FeedbackRepository } = require('../../repository/feedback');
const { OrderRepository } = require('../../repository/order');
const { prisma } = require('../../config/database.config');
const feedbackRepository = new FeedbackRepository();
const orderRepository = new OrderRepository(prisma);

/**
 * @route POST /api/v1/feedback
 * @desc Create feedback for an order or restaurant
 * @access Public
 */
router.post('/', validation(CreateFeedbackDto), async (req, res) => {
  try {
    const {
      orderId,
      branchId,
      restaurantId,
      overallRating,
      categoryRatings,
      comment,
      customerInfo,
      isAnonymous = false
    } = req.body;

    // Validate that order exists if orderId is provided
    if (orderId) {
      const order = await orderRepository.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    }

    // Create feedback
    const feedback = await feedbackRepository.create({
      orderId: orderId || null,
      branchId: branchId,
      restaurantId: restaurantId,
      overallRating: overallRating,
      categoryRatings: {
        foodQuality: categoryRatings?.foodQuality || null,
        service: categoryRatings?.service || null,
        atmosphere: categoryRatings?.atmosphere || null
      },
      comment: comment || null,
      customerInfo: isAnonymous ? null : customerInfo,
      isAnonymous: isAnonymous
    });

    // Update order feedback status if applicable
    if (orderId) {
      await orderRepository.updateFeedbackStatus(orderId, true);
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: feedback.id,
        overallRating: feedback.overall_rating,
        comment: feedback.comment,
        createdAt: feedback.created_at,
      }
    });
  } catch (error) {
    console.error('❌ Create feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/feedback/order/:orderId
 * @desc Get feedback for a specific order
 * @access Public
 */
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const feedback = await feedbackRepository.findByOrderId(orderId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: feedback.id,
        overallRating: feedback.overall_rating,
        categoryRatings: {
          foodQuality: feedback.food_quality_rating,
          service: feedback.service_rating,
          atmosphere: feedback.atmosphere_rating,
          price: feedback.price_rating,
          cleanliness: feedback.cleanliness_rating,
        },
        comment: feedback.comment,
        customerName: feedback.is_anonymous ? 'Khách hàng ẩn danh' : feedback.customer_name,
        createdAt: feedback.created_at,
        isAnonymous: feedback.is_anonymous,
      }
    });
  } catch (error) {
    console.error('❌ Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feedback',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/feedback/restaurant/:restaurantId
 * @desc Get feedback for a restaurant
 * @access Public
 */
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      rating, 
      sortBy = 'created_at',
      sortOrder = 'desc' 
    } = req.query;

    const result = await feedbackRepository.findByRestaurant(restaurantId, {
      page: parseInt(page),
      limit: parseInt(limit),
      rating: rating ? parseInt(rating) : null,
      sortBy,
      sortOrder,
    });

    res.json({
      success: true,
      data: {
        feedback: result.feedback.map(fb => ({
          id: fb.id,
          overallRating: fb.overall_rating,
          categoryRatings: {
            foodQuality: fb.food_quality_rating,
            service: fb.service_rating,
            atmosphere: fb.atmosphere_rating,
            price: fb.price_rating,
            cleanliness: fb.cleanliness_rating,
          },
          comment: fb.comment,
          customerName: fb.is_anonymous ? 'Khách hàng ẩn danh' : fb.customer_name,
          createdAt: fb.created_at,
          orderNumber: fb.order?.order_number || null,
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        summary: result.summary,
      }
    });
  } catch (error) {
    console.error('❌ Get restaurant feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get restaurant feedback',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/feedback/branch/:branchId
 * @desc Get feedback for a branch
 * @access Private (Staff+)
 */
router.get('/branch/:branchId', auth, async (req, res) => {
  try {
    const { branchId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      rating, 
      from, 
      to,
      sortBy = 'created_at',
      sortOrder = 'desc' 
    } = req.query;

    const result = await feedbackRepository.findByBranch(branchId, {
      page: parseInt(page),
      limit: parseInt(limit),
      rating: rating ? parseInt(rating) : null,
      from,
      to,
      sortBy,
      sortOrder,
    });

    res.json({
      success: true,
      data: {
        feedback: result.feedback.map(fb => ({
          id: fb.id,
          overallRating: fb.overall_rating,
          categoryRatings: {
            foodQuality: fb.food_quality_rating,
            service: fb.service_rating,
            atmosphere: fb.atmosphere_rating,
            price: fb.price_rating,
            cleanliness: fb.cleanliness_rating,
          },
          comment: fb.comment,
          customerName: fb.is_anonymous ? 'Khách hàng ẩn danh' : fb.customer_name,
          customerEmail: fb.is_anonymous ? null : fb.customer_email,
          customerPhone: fb.is_anonymous ? null : fb.customer_phone,
          createdAt: fb.created_at,
          orderNumber: fb.order?.order_number || null,
          table: fb.order?.table ? {
            name: fb.order.table.table_number,
            area: fb.order.table.areas?.name || 'Unknown'
          } : null,
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        summary: result.summary,
      }
    });
  } catch (error) {
    console.error('❌ Get branch feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get branch feedback',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/feedback/stats/:restaurantId
 * @desc Get feedback statistics for a restaurant
 * @access Private (Manager+)
 */
router.get('/stats/:restaurantId', auth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { from, to, branchId } = req.query;

    const stats = await feedbackRepository.getStats(restaurantId, {
      from,
      to,
      branchId,
    });

    res.json({
      success: true,
      data: {
        totalFeedback: stats.totalFeedback,
        averageRating: stats.averageRating,
        ratingDistribution: stats.ratingDistribution,
        categoryAverages: {
          foodQuality: stats.avgFoodQuality,
          service: stats.avgService,
          atmosphere: stats.avgAtmosphere,
          price: stats.avgPrice,
          cleanliness: stats.avgCleanliness,
        },
        trends: stats.trends,
        topComplaints: stats.topComplaints,
        topPraises: stats.topPraises,
      }
    });
  } catch (error) {
    console.error('❌ Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feedback statistics',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/v1/feedback/:id/response
 * @desc Respond to feedback (for restaurant management)
 * @access Private (Manager+)
 */
router.put('/:id/response', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const staffId = req.user.id;

    const feedback = await feedbackRepository.addResponse(id, {
      management_response: response,
      responded_by: staffId,
      responded_at: new Date(),
      updated_at: new Date(),
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Response added successfully',
      data: {
        id: feedback.id,
        response: feedback.management_response,
        respondedAt: feedback.responded_at,
      }
    });
  } catch (error) {
    console.error('❌ Add feedback response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/v1/feedback/:id/status
 * @desc Update feedback status (hide/show)
 * @access Private (Manager+)
 */
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const feedback = await feedbackRepository.updateStatus(id, {
      status,
      moderation_reason: reason,
      moderated_by: req.user.id,
      moderated_at: new Date(),
      updated_at: new Date(),
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback status updated successfully'
    });
  } catch (error) {
    console.error('❌ Update feedback status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback status',
      error: error.message
    });
  }
});

module.exports = router;