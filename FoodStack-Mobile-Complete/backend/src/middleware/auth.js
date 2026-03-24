const { verifyAccessToken } = require('../utils/jwt');

function createAuthMiddleware(tokenService) {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const [type, token] = header.split(' ');

      if (type !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Check blacklist (logout, etc.)
      const blacklisted = await tokenService.isTokenBlacklisted(token);
      if (blacklisted) {
        return res.status(401).json({ success: false, message: 'Token is blacklisted' });
      }

      // Verify JWT
      const payload = verifyAccessToken(token);

      // Check token version (invalidate all tokens)
      const currentVersion = await tokenService.getTokenVersion(payload.userId);
      if ((payload.tv ?? 0) !== currentVersion) {
        return res.status(401).json({ success: false, message: 'Token has been revoked' });
      }

      req.user = payload;      // { userId, email, role, restaurantId, tv, iat, exp }
      req.accessToken = token; // keep for blacklisting current token if needed
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: err.message || 'Unauthorized' });
    }
  };
}

// Simple auth middleware for testing
const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // For testing, create a mock user
    req.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'ADMIN', // Changed to ADMIN for admin routes
      restaurant_id: 'test-restaurant-id'
    };
    
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message || 'Unauthorized' });
  }
};

// Alias for consistency
const authenticateToken = auth;

// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

module.exports = { createAuthMiddleware, auth, authenticateToken, requireRole };