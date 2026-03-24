// src/routes/v1/restaurant-statistics.js

const express = require('express');

/**
 * Create restaurant statistics routes
 * @param {Object} restaurantStatisticsController - Restaurant statistics controller instance
 * @param {Function} authMiddleware - Auth middleware
 * @returns {express.Router} Express router
 */
function createRestaurantStatisticsRoutes(restaurantStatisticsController, authMiddleware) {
  const router = express.Router();

  if (!authMiddleware) {
    throw new Error('authMiddleware is required for restaurant statistics routes');
  }

  /**
   * @route   GET /api/v1/restaurants/me
   * @desc    Get my restaurants (Owner/Manager only)
   * @access  Private (OWNER, MANAGER)
   */
  router.get(
    '/me',
    authMiddleware,
    (req, res, next) => restaurantStatisticsController.getMyRestaurants(req, res, next)
  );

  /**
   * @route   GET /api/v1/restaurants/me/statistics
   * @desc    Get restaurant statistics (Owner/Manager only)
   * @access  Private (OWNER, MANAGER)
   * @query   from? - Start date (ISO string)
   * @query   to? - End date (ISO string)
   */
  router.get(
    '/me/statistics',
    authMiddleware,
    (req, res, next) => restaurantStatisticsController.getMyStatistics(req, res, next)
  );

  return router;
}

module.exports = { createRestaurantStatisticsRoutes };