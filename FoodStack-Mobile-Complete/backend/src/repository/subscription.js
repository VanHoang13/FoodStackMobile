const { prisma } = require('../config/database.config');
const { v4: uuidv4 } = require('uuid');

class SubscriptionRepository {
  async getAllPlans() {
    return await prisma.subscription_plans.findMany({
      include: {
        subscription_feature_limits: true
      },
      orderBy: {
        price: 'asc'
      }
    });
  }

  async create(subscriptionData) {
    return await prisma.subscriptions.create({
      data: {
        id: uuidv4(),
        ...subscriptionData,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        subscription_plans: true,
        restaurants: true
      }
    });
  }

  async findByRestaurantId(restaurantId) {
    return await prisma.subscriptions.findFirst({
      where: {
        restaurant_id: restaurantId,
        status: {
          in: ['ACTIVE', 'TRIAL', 'PAST_DUE']
        }
      },
      include: {
        subscription_plans: {
          include: {
            subscription_feature_limits: true
          }
        },
        restaurants: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async findById(subscriptionId) {
    return await prisma.subscriptions.findUnique({
      where: { id: subscriptionId },
      include: {
        subscription_plans: {
          include: {
            subscription_feature_limits: true
          }
        },
        restaurants: true
      }
    });
  }

  async update(subscriptionId, updateData) {
    return await prisma.subscriptions.update({
      where: { id: subscriptionId },
      data: {
        ...updateData,
        updated_at: new Date()
      },
      include: {
        subscription_plans: true,
        restaurants: true
      }
    });
  }

  async findExpiringSoon(days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await prisma.subscriptions.findMany({
      where: {
        expires_at: {
          lte: futureDate
        },
        status: 'ACTIVE'
      },
      include: {
        restaurants: true,
        subscription_plans: true
      }
    });
  }

  async getSubscriptionStats(restaurantId) {
    const subscription = await this.findByRestaurantId(restaurantId);
    if (!subscription) return null;

    // Get current usage
    const [branchCount, tableCount, menuItemCount, staffCount] = await Promise.all([
      prisma.branches.count({
        where: { 
          restaurant_id: restaurantId,
          deleted_at: null
        }
      }),
      prisma.tables.count({
        where: { 
          branches: {
            restaurant_id: restaurantId
          },
          deleted_at: null
        }
      }),
      prisma.menu_items.count({
        where: { 
          categories: {
            branches: {
              restaurant_id: restaurantId
            }
          },
          deleted_at: null
        }
      }),
      prisma.users.count({
        where: { 
          restaurant_id: restaurantId,
          role: {
            in: ['MANAGER', 'STAFF']
          },
          deleted_at: null
        }
      })
    ]);

    return {
      subscription,
      usage: {
        branches: branchCount,
        tables: tableCount,
        menuItems: menuItemCount,
        staff: staffCount
      }
    };
  }

  async checkFeatureLimit(restaurantId, featureName) {
    const subscription = await this.findByRestaurantId(restaurantId);
    if (!subscription) {
      return { allowed: false, reason: 'No active subscription' };
    }

    const featureLimit = subscription.subscription_plans.subscription_feature_limits.find(
      limit => limit.feature_name === featureName
    );

    if (!featureLimit) {
      return { allowed: true, reason: 'No limit defined' };
    }

    // Get current usage based on feature
    let currentUsage = 0;
    switch (featureName) {
      case 'max_branches':
        currentUsage = await prisma.branches.count({
          where: { 
            restaurant_id: restaurantId,
            deleted_at: null
          }
        });
        break;
      case 'max_tables':
        currentUsage = await prisma.tables.count({
          where: { 
            branches: {
              restaurant_id: restaurantId
            },
            deleted_at: null
          }
        });
        break;
      case 'max_menu_items':
        currentUsage = await prisma.menu_items.count({
          where: { 
            categories: {
              branches: {
                restaurant_id: restaurantId
              }
            },
            deleted_at: null
          }
        });
        break;
      case 'max_staff':
        currentUsage = await prisma.users.count({
          where: { 
            restaurant_id: restaurantId,
            role: {
              in: ['MANAGER', 'STAFF']
            },
            deleted_at: null
          }
        });
        break;
    }

    const allowed = currentUsage < featureLimit.limit_value;
    return {
      allowed,
      currentUsage,
      limit: featureLimit.limit_value,
      remaining: featureLimit.limit_value - currentUsage,
      reason: allowed ? null : `Feature limit exceeded (${currentUsage}/${featureLimit.limit_value})`
    };
  }
}

module.exports = { SubscriptionRepository };