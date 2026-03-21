const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { validation } = require('../../middleware/validation');
const { CreateSubscriptionSchema } = require('../../dto/subscription/create-subscription');
const { UpdateSubscriptionSchema } = require('../../dto/subscription/update-subscription');

// Subscription Repository
const { SubscriptionRepository } = require('../../repository/subscription');
const subscriptionRepository = new SubscriptionRepository();

/**
 * @route GET /api/v1/subscriptions/plans
 * @desc Get all available subscription plans
 * @access Public
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = await subscriptionRepository.getAllPlans();

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription plans'
    });
  }
});

/**
 * @route GET /api/v1/subscriptions/restaurant/:restaurantId
 * @desc Get subscription details for a restaurant
 * @access Private (Owner, Manager)
 */
router.get('/restaurant/:restaurantId', auth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this restaurant
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const subscriptionStats = await subscriptionRepository.getSubscriptionStats(restaurantId);

    if (!subscriptionStats) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    res.json({
      success: true,
      data: subscriptionStats
    });
  } catch (error) {
    console.error('Get subscription details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription details'
    });
  }
});

/**
 * @route POST /api/v1/subscriptions
 * @desc Create new subscription
 * @access Private (Owner)
 */
router.post('/', auth, validation(CreateSubscriptionSchema), async (req, res) => {
  try {
    const {
      restaurantId,
      planId,
      billingCycle,
      paymentMethod,
      autoRenew,
      couponCode,
      notes
    } = req.body;

    // Check if user is owner of the restaurant
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Only restaurant owners can create subscriptions'
      });
    }

    // Check if restaurant already has active subscription
    const existingSubscription = await subscriptionRepository.findByRestaurantId(restaurantId);
    if (existingSubscription && existingSubscription.status === 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Restaurant already has an active subscription'
      });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = await subscriptionRepository.create({
      restaurant_id: restaurantId,
      plan_id: planId,
      status: 'PENDING',
      billing_cycle: billingCycle,
      payment_method: paymentMethod,
      auto_renew: autoRenew,
      starts_at: startDate,
      expires_at: endDate,
      coupon_code: couponCode,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription'
    });
  }
});

/**
 * @route PUT /api/v1/subscriptions/:subscriptionId
 * @desc Update subscription
 * @access Private (Owner)
 */
router.put('/:subscriptionId', auth, validation(UpdateSubscriptionSchema), async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const updateData = req.body;

    const subscription = await subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user has access
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== subscription.restaurant_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedSubscription = await subscriptionRepository.update(subscriptionId, updateData);

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: updatedSubscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription'
    });
  }
});

/**
 * @route GET /api/v1/subscriptions/check-limit/:restaurantId/:feature
 * @desc Check feature limit for restaurant
 * @access Private
 */
router.get('/check-limit/:restaurantId/:feature', auth, async (req, res) => {
  try {
    const { restaurantId, feature } = req.params;

    // Check if user has access
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const limitCheck = await subscriptionRepository.checkFeatureLimit(restaurantId, feature);

    res.json({
      success: true,
      data: limitCheck
    });
  } catch (error) {
    console.error('Check feature limit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check feature limit'
    });
  }
});

/**
 * @route POST /api/v1/subscriptions/:subscriptionId/cancel
 * @desc Cancel subscription
 * @access Private (Owner)
 */
router.post('/:subscriptionId/cancel', auth, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { reason } = req.body;

    const subscription = await subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user has access
    if (req.user.role !== 'ADMIN' && req.user.restaurant_id !== subscription.restaurant_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const cancelledSubscription = await subscriptionRepository.update(subscriptionId, {
      status: 'CANCELLED',
      cancelled_at: new Date(),
      cancellation_reason: reason
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: cancelledSubscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

module.exports = router;