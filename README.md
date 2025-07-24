# REST API Gateway for Microservices

A robust API Gateway built with Node.js, Express.js, Redis, and MongoDB that provides authentication, rate limiting, and microservice routing capabilities.

## Features

- **Authentication**: JWT tokens and API key support
- **Rate Limiting**: Redis-based rate limiting with tier-based limits
- **Microservice Routing**: Proxy requests to backend services
- **User Management**: Registration, login, and profile management
- **Security**: Helmet middleware, CORS, input validation
- **Monitoring**: Health checks and request logging
- **Docker Support**: Full containerization with Docker Compose

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │────│   API Gateway   │────│  Microservices  │
└─────────────────┘    │                 │    │                 │
                       │ • Authentication│    │ • User Service  │
                       │ • Rate Limiting │    │ • Order Service │
                       │ • Load Balancing│    │ • Product Svc   │
                       │ • Request Proxy │    └─────────────────┘
                       └─────────────────┘
                              │    │
                    ┌─────────┘    └─────────┐
                    │                        │
            ┌───────▼────────┐    ┌─────────▼─────────┐
            │     Redis      │    │     MongoDB       │
            │ (Rate Limiting)│    │ (User Storage)    │
            └────────────────┘    └───────────────────┘
```

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd rest-api-gateway
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **The API Gateway will be available at:**
   - Gateway: http://localhost:3000
   - MongoDB: localhost:27017
   - Redis: localhost:6379

### Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB and Redis:**
   ```bash
   # MongoDB
   mongod --dbpath /path/to/data

   # Redis
   redis-server
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start the gateway:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <your-jwt-token>
```

#### Generate API Key
```http
POST /auth/api-key
Authorization: Bearer <your-jwt-token>
```

### Microservice Routing

All microservice requests require authentication via JWT token or API key:

#### Using JWT Token
```http
GET /api/users
Authorization: Bearer <your-jwt-token>
```

#### Using API Key
```http
GET /api/products
X-API-Key: <your-api-key>
```

### Available Service Routes

- **User Service**: `/api/users/*` → `http://user-service:3001/users/*`
- **Order Service**: `/api/orders/*` → `http://order-service:3002/orders/*`
- **Product Service**: `/api/products/*` → `http://product-service:3003/products/*`

### Service Discovery
```http
GET /api/services
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

The gateway implements tier-based rate limiting:

| Tier | Requests per 15 minutes |
|------|------------------------|
| Basic | 100 |
| Premium | 1,000 |
| Enterprise | 10,000 |

Rate limits are applied per user (authenticated) or per IP (unauthenticated).

## Environment Variables

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
MONGODB_URI=mongodb://localhost:27017/api-gateway
REDIS_URL=redis://localhost:6379
NODE_ENV=development

# Microservice URLs
USER_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3002
PRODUCT_SERVICE_URL=http://localhost:3003
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Request data validation
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Rate Limiting**: Prevent abuse and DoS attacks

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Human readable message",
  "details": ["Additional error details"]
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `502` - Bad Gateway (service unavailable)

## Development

### Running Tests
```bash
npm test
```

### Development Mode
```bash
npm run dev
```

### Health Check
```bash
curl http://localhost:3000/health
```

## Docker Commands

### Build and run
```bash
docker-compose up --build
```

### Run in background
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs api-gateway
```

### Stop services
```bash
docker-compose down
```

## Production Deployment

1. **Update environment variables** in `.env` or docker-compose.yml
2. **Change JWT_SECRET** to a secure random string
3. **Configure microservice URLs** to point to actual services
4. **Set up monitoring** and logging
5. **Configure reverse proxy** (nginx/Apache) if needed
6. **Set up SSL/TLS** certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
