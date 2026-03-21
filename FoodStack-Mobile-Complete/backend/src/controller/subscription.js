/**
 * Subscription Controller
 * Handles subscription management for restaurants
 */

const { CreateSubscriptionSchema } = require('../dto/subscription/create-subscription');
const { UpdateSubscriptionSchema } = require('../dto/subscription/update-subscription');

class SubscriptionController {
  constructor(
    createSubscriptionUseCase,
    updateSubscriptionUseCase,
    getSubscriptionDetailsUseCase,
    listSubscriptionPlansUseCase,
    checkFeatureLimitUseCase,
    upgradeSubscriptionUseCase,
    cancelSubscriptionUseCase
  ) {
    this.createSubscriptionUseCase = createSubscriptionUseCase;
    this.updateSubscriptionUseCase = updateSubscriptionUseCase;
    this.getSubscriptionDetailsUseCase = getSubscriptionDetailsUseCase;
    this.listSubscriptionPlansUseCase = listSubscriptionPlansUseCase;
    this.checkFeatureLimitUseCase = checkFeatureLimitUseCase;
    this.upgradeSubscriptionUseCase = upgradeSubscriptionUseCase;
    this.cancelSubscriptionUseCase = cancelSubscriptionUseCase;
  }

  async createSubscription(req, res, next) {
    try {
      const dto = CreateSubscriptionSchema.parse(req.body);
      const userId = req.user.id;

      const result = await this.createSubscriptionUseCase.execute({
        ...dto,
        userId
      });

      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptionDetails(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const userId = req.user.id;

      const result = await this.getSubscriptionDetailsUseCase.execute({
        restaurantId,
        userId
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async listSubscriptionPlans(req, res, next) {
    try {
      const result = await this.listSubscriptionPlansUseCase.execute();

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async checkFeatureLimit(req, res, next) {
    try {
      const { restaurantId, feature } = req.params;
      const userId = req.user.id;

      const result = await this.checkFeatureLimitUseCase.execute({
        restaurantId,
        feature,
        userId
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async upgradeSubscription(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const dto = UpdateSubscriptionSchema.parse(req.body);
      const userId = req.user.id;

      const result = await this.upgradeSubscriptionUseCase.execute({
        restaurantId,
        ...dto,
        userId
      });

      res.json({
        success: true,
        message: 'Subscription upgraded successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const result = await this.cancelSubscriptionUseCase.execute({
        restaurantId,
        reason,
        userId
      });

      res.json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { SubscriptionController };