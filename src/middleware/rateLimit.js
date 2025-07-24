const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');

const rateLimitConfig = {
  basic: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
  premium: { windowMs: 15 * 60 * 1000, max: 1000 }, // 1000 requests per 15 minutes
  enterprise: { windowMs: 15 * 60 * 1000, max: 10000 } // 10000 requests per 15 minutes
};

const createRateLimiter = (tier = 'basic') => {
  const config = rateLimitConfig[tier];
  
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => getRedisClient().sendCommand(args),
    }),
    windowMs: config.windowMs,
    max: config.max,
    message: {
      error: 'Too many requests',
      message: `Rate limit exceeded. Max ${config.max} requests per ${config.windowMs / 60000} minutes for ${tier} tier.`,
      retryAfter: Math.ceil(config.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user ? `user:${req.user._id}` : `ip:${req.ip}`;
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    }
  });
};

const dynamicRateLimit = (req, res, next) => {
  const tier = req.user?.rateLimitTier || 'basic';
  const limiter = createRateLimiter(tier);
  limiter(req, res, next);
};

// Default rate limiter for unauthenticated requests
const defaultRateLimit = createRateLimiter('basic');

// Export both default and dynamic rate limiters
module.exports = (req, res, next) => {
  if (req.user) {
    dynamicRateLimit(req, res, next);
  } else {
    defaultRateLimit(req, res, next);
  }
};

module.exports.createRateLimiter = createRateLimiter;
module.exports.dynamicRateLimit = dynamicRateLimit;
