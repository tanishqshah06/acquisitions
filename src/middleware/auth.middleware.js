import logger from '#config/logger.js';
import { jwtToken } from '#utils/jwt.js';

export const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided',
      });
    }

    const decoded = jwtToken.verify(token);
    req.user = decoded;

    logger.info(`User authenticated: ${decoded.email} (${decoded.role})`);
    next();
  } catch (e) {
    logger.error('Authentication failed:', e.message);
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid or expired token',
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    logger.error('Admin access attempted without authentication');
    return res.status(401).json({
      error: 'Authentication required',
      message: 'User not authenticated',
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn(
      `Non-admin user ${req.user.email} (${req.user.role}) attempted admin operation on ${req.path}`
    );
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required',
    });
  }

  logger.info(
    `Admin access granted to ${req.user.email} for ${req.method} ${req.path}`
  );
  next();
};
