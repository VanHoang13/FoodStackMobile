/**
 * Token Service
 * Manages refresh tokens using mock Redis
 */

const jwt = require('jsonwebtoken');
const { redis } = require('../config/database.config'); // Use mock Redis

class TokenService {
  constructor() {
    this.redis = redis; // Use mock Redis from config
    console.log('✅ TokenService initialized with mock Redis');
  }

  /**
   * Save refresh token to Redis
   * @param {string} userId - User ID
   * @param {string} token - Refresh token
   * @param {number} ttl - Time to live in seconds (default: 30 days)
   */
  async saveRefreshToken(userId, token, ttl = 30 * 24 * 60 * 60) {
    const key = `refresh_token:${userId}`;
    await this.redis.setex(key, ttl, token);
  }

  /**
   * Get refresh token from Redis
   * @param {string} userId - User ID
   * @returns {Promise<string|null>} Refresh token or null
   */
  async getRefreshToken(userId) {
    const key = `refresh_token:${userId}`;
    return await this.redis.get(key);
  }

  /**
   * Delete refresh token from Redis
   * @param {string} userId - User ID
   */
  async deleteRefreshToken(userId) {
    const key = `refresh_token:${userId}`;
    await this.redis.del(key);
  }

  /**
   * Blacklist access token (for logout / immediate invalidation)
   * @param {string} token - Access token
   * @param {number} expiresIn - Expiration time in seconds
   */
  async blacklistAccessToken(token, expiresIn) {
    const ttl = Math.max(1, Number(expiresIn) || 1);
    const key = `blacklist:${token}`;
    await this.redis.setex(key, ttl, '1');
  }

  /**
   * Check if access token is blacklisted
   * @param {string} token - Access token
   * @returns {Promise<boolean>} True if blacklisted
   */
  async isTokenBlacklisted(token) {
    const key = `blacklist:${token}`;
    const result = await this.redis.get(key);
    return result !== null;
  }

  /**
   * Blacklist refresh token (token rotation)
   * @param {string} token - Refresh token
   * @param {number} expiresIn - Expiration time in seconds
   */
  async blacklistRefreshToken(token, expiresIn) {
    const ttl = Math.max(1, Number(expiresIn) || 1);
    const key = `refresh_blacklist:${token}`;
    await this.redis.setex(key, ttl, '1');
  }

  /**
   * Check if refresh token is blacklisted
   * @param {string} token - Refresh token
   * @returns {Promise<boolean>} True if blacklisted
   */
  async isRefreshTokenBlacklisted(token) {
    const key = `refresh_blacklist:${token}`;
    const result = await this.redis.get(key);
    return result !== null;
  }

  // =====================================================
  // ✅ NEW: Token Versioning (invalidate all tokens)
  // Key: token_version:<userId>
  // =====================================================

  /**
   * Get token version for a user (default 0)
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async getTokenVersion(userId) {
    const key = `token_version:${userId}`;
    const v = await this.redis.get(key);
    return v ? Number(v) : 0;
  }

  /**
   * Set token version explicitly (optional utility)
   * @param {string} userId
   * @param {number} version
   */
  async setTokenVersion(userId, version) {
    const key = `token_version:${userId}`;
    await this.redis.set(key, String(Number(version) || 0));
  }

  /**
   * Bump token version to invalidate all existing tokens
   * Returns new version
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async bumpTokenVersion(userId) {
    const key = `token_version:${userId}`;
    const newV = await this.redis.incr(key);
    return Number(newV);
  }

  /**
   * Close Redis connection
   */
  async close() {
    await this.redis.quit();
  }

  // =====================================================
  // JWT Token Generation and Validation
  // =====================================================

  /**
   * Generate access token
   * @param {Object} payload - Token payload
   * @param {string} expiresIn - Expiration time (e.g., '15m')
   * @returns {string} JWT token
   */
  generateAccessToken(payload, expiresIn = '15m') {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  /**
   * Generate refresh token
   * @param {Object} payload - Token payload
   * @param {string} expiresIn - Expiration time (e.g., '30d')
   * @returns {string} JWT token
   */
  generateRefreshToken(payload, expiresIn = '30d') {
    return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn });
  }

  /**
   * Verify access token
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  /**
   * Verify refresh token
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
  }

  /**
   * Decode token without verification (for getting payload)
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = { TokenService };