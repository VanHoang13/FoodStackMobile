const SubscriptionRepository = require('../repository/subscription');

class SubscriptionMiddleware {
  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
  }

  // Middleware to check feature limits
  checkFeatureLimit(featureName) {
    return async (req, res, next) => {
      try {
        // Skip check for admin users
        if (req.user && req.user.role === 'ADMIN') {
          return next();
        }

        // Get restaurant ID from user or request
        const restaurantId = req.user?.restaurant_id || req.body?.restaurant_id || req.params?.restaurantId;
        
        if (!restaurantId) {
          return res.status(400).json({
            success: false,
            message: 'Restaurant ID is required'
          });
        }

        // Check feature limit
        const limitCheck = await this.subscriptionRepository.checkFeatureLimit(restaurantId, featureName);
        
        if (!limitCheck.allowed) {
          return res.status(403).json({
            success: false,
            message: limitCheck.reason,
            data: {
              feature: featureName,
              currentUsage: limitCheck.currentUsage,
              limit: limitCheck.limit,
              upgradeRequired: true
            }
          });
        }

        // Add limit info to request for reference
        req.featureLimit = limitCheck;
        next();
      } catch (error) {
        console.error('Subscription middleware error:', error);
        // Don't block request on middleware error, just log it
        next();
      }
    };
  }

  // Middleware to check active subscription
  checkActiveSubscription() {
    return async (req, res, next) => {
      try {
        // Skip check for admin users
        if (req.user && req.user.role === 'ADMIN') {
          return next();
        }

        const restaurantId = req.user?.restaurant_id || req.body?.restaurant_id || req.params?.restaurantId;
        
        if (!restaurantId) {
          return res.status(400).json({
            success: false,
            message: 'Restaurant ID is required'
          });
        }

        const subscription = await this.subscriptionRepository.findByRestaurantId(restaurantId);
        
        if (!subscription) {
          return res.status(403).json({
            success: false,
            message: 'No active subscription found',
            data: {
              subscriptionRequired: true
            }
          });
        }

        // Check if subscription is expired
        if (subscription.status === 'EXPIRED' || new Date(subscription.expires_at) < new Date()) {
          return res.status(403).json({
            success: false,
            message: 'Subscription has expired',
            data: {
              subscriptionExpired: true,
              expiresAt: subscription.expires_at
            }
          });
        }

        // Check if subscription is cancelled
        if (subscription.status === 'CANCELLED') {
          return res.status(403).json({
            success: false,
            message: 'Subscription has been cancelled',
            data: {
              subscriptionCancelled: true
            }
          });
        }

        // Add subscription info to request
        req.subscription = subscription;
        next();
      } catch (error) {
        console.error('Subscription check error:', error);
        // Don't block request on middleware error, just log it
        next();
      }
    };
  }

  // Middleware to warn about upcoming expiry
  checkSubscriptionExpiry(warningDays = 7) {
    return async (req, res, next) => {
      try {
        const restaurantId = req.user?.restaurant_id;
        
        if (!restaurantId || req.user?.role === 'ADMIN') {
          return next();
        }

        const subscription = await this.subscriptionRepository.findByRestaurantId(restaurantId);
        
        if (subscription && subscription.status === 'ACTIVE') {
          const expiryDate = new Date(subscription.expires_at);
          const warningDate = new Date();
          warningDate.setDate(warningDate.getDate() + warningDays);

          if (expiryDate <= warningDate) {
            const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            // Add warning to response headers
            res.set('X-Subscription-Warning', 'true');
            res.set('X-Subscription-Days-Left', daysLeft.toString());
            res.set('X-Subscription-Expires-At', subscription.expires_at);
          }
        }

        next();
      } catch (error) {
        console.error('Subscription expiry check error:', error);
        next();
      }
    };
  }
}

// Create singleton instance
const subscriptionMiddleware = new SubscriptionMiddleware();

// Export middleware functions
module.exports = {
  SubscriptionMiddleware,
  checkFeatureLimit: (featureName) => subscriptionMiddleware.checkFeatureLimit(featureName),
  checkActiveSubscription: () => subscriptionMiddleware.checkActiveSubscription(),
  checkSubscriptionExpiry: (warningDays) => subscriptionMiddleware.checkSubscriptionExpiry(warningDays),
};