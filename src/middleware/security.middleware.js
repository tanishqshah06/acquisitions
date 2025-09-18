import aj from '#config/arcjet.js';
import { slidingWindow } from '@arcjet/node';
import logger from '#config/logger.js';

const securityMiddleware = async (req, res, next) => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const role = req.user?.role || 'guest';

    let limit;
    let message;

    // More lenient limits in development
    if (isDevelopment) {
      switch (role) {
        case 'admin':
          limit = 100;
          message = 'Admin request limit exceeded (100 per minute). Slow down.';
          break;
        case 'user':
          limit = 50;
          message = 'User request limit exceeded (50 per minute). Slow down.';
          break;
        case 'guest':
          limit = 25;
          message = 'Guest request limit exceeded (25 per minute). Slow down.';
          break;
      }
    } else {
      // Production limits
      switch (role) {
        case 'admin':
          limit = 20;
          message = 'Admin request limit exceeded (20 per minute). Slow down.';
          break;
        case 'user':
          limit = 10;
          message = 'User request limit exceeded (10 per minute). Slow down.';
          break;
        case 'guest':
          limit = 5;
          message = 'Guest request limit exceeded (5 per minute). Slow down.';
          break;
      }
    }

    const client = aj.withRule(
      slidingWindow({
        mode: isDevelopment ? 'DRY_RUN' : 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(req, {
      ip: req.ip,
      headers: req.headers,
    });

    // In development, log but don't block bot requests
    if (decision.isDenied() && decision.reason.isBot()) {
      const logLevel = isDevelopment ? 'info' : 'warn';
      logger[logLevel]('Bot request detected', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        blocked: !isDevelopment,
      });

      // Only block in production
      if (!isDevelopment) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Automated requests are not allowed.',
        });
      }
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      const logLevel = isDevelopment ? 'info' : 'warn';
      logger[logLevel]('Shield request detected', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        blocked: !isDevelopment,
      });

      // Only block in production
      if (!isDevelopment) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Request blocked by security policy.',
        });
      }
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });

      return res.status(429).json({ error: 'Too Many Requests', message });
    }

    next();
  } catch (e) {
    logger.error('Arcjet middleware error:', e);

    // In development, don't block on middleware errors
    if (process.env.NODE_ENV === 'development') {
      logger.warn(
        'Bypassing security middleware due to error in development mode'
      );
      return next();
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong with security middleware',
    });
  }
};

export default securityMiddleware;
