const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authenticateToken, authenticateApiKey } = require('../middleware/auth');

const router = express.Router();

// Authentication middleware - supports both JWT and API key
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const apiKey = req.headers['x-api-key'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Use JWT authentication
    authenticateToken(req, res, next);
  } else if (apiKey) {
    // Use API key authentication
    authenticateApiKey(req, res, next);
  } else {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide either Bearer token or API key'
    });
  }
};

// Microservice proxy configuration
const createServiceProxy = (serviceUrl, pathRewrite = {}) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite,
    onError: (err, req, res) => {
      console.error(`Proxy error for ${req.url}:`, err.message);
      res.status(502).json({
        error: 'Service unavailable',
        message: 'The requested service is currently unavailable',
        service: req.baseUrl
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add user information to headers for downstream services
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user._id);
        proxyReq.setHeader('X-User-Role', req.user.role);
        proxyReq.setHeader('X-User-Email', req.user.email);
      }
      
      // Log proxy requests
      console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.getHeader('host')}${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add gateway headers
      proxyRes.headers['X-Gateway'] = 'REST-API-Gateway';
      proxyRes.headers['X-Gateway-Version'] = '1.0.0';
    }
  });
};

// User Service Routes
router.use('/users/*', 
  authenticate,
  createServiceProxy(process.env.USER_SERVICE_URL, {
    '^/api/users': '/users'
  })
);

// Order Service Routes
router.use('/orders/*', 
  authenticate,
  createServiceProxy(process.env.ORDER_SERVICE_URL, {
    '^/api/orders': '/orders'
  })
);

// Product Service Routes
router.use('/products/*', 
  authenticate,
  createServiceProxy(process.env.PRODUCT_SERVICE_URL, {
    '^/api/products': '/products'
  })
);

// Service discovery endpoint
router.get('/services', authenticate, (req, res) => {
  res.json({
    services: [
      {
        name: 'user-service',
        url: process.env.USER_SERVICE_URL,
        path: '/api/users',
        description: 'User management service'
      },
      {
        name: 'order-service',
        url: process.env.ORDER_SERVICE_URL,
        path: '/api/orders',
        description: 'Order processing service'
      },
      {
        name: 'product-service',
        url: process.env.PRODUCT_SERVICE_URL,
        path: '/api/products',
        description: 'Product catalog service'
      }
    ],
    user: {
      id: req.user._id,
      role: req.user.role,
      rateLimitTier: req.user.rateLimitTier
    }
  });
});

module.exports = router;
