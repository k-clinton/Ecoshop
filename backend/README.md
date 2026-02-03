# 🌱 EcoShop Backend API

A comprehensive Next.js-based REST API backend for the EcoShop e-commerce platform, featuring MySQL database integration, JWT authentication, and full CRUD operations for products, orders, and user management.

## 📋 Features

- ✅ RESTful API with Next.js API routes
- ✅ MySQL database with connection pooling
- ✅ JWT-based authentication and authorization
- ✅ Role-based access control (Customer & Admin)
- ✅ Complete product management system
- ✅ Order processing with inventory management
- ✅ Category management
- ✅ Admin dashboard statistics
- ✅ CORS enabled for frontend integration
- ✅ TypeScript for type safety

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed and running
- npm or yarn package manager

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd Ecoshop/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your database credentials:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=ecoshop_db
   JWT_SECRET=your_secure_random_string
   API_PORT=3001
   NODE_ENV=development
   ```

5. **Set up the database:**
   ```bash
   npm run db:setup
   ```

6. **Seed the database with initial data:**
   ```bash
   npm run db:seed
   ```

7. **Start the development server:**
   ```bash
   npm run dev
   ```

The API will be available at: `http://localhost:3001`

## 🗄️ Database Schema

### Tables

- **categories** - Product categories
- **products** - Main product information
- **product_images** - Product image URLs
- **product_tags** - Product tags for filtering
- **product_variants** - Product variants (size, color, etc.)
- **users** - User accounts (customers and admins)
- **orders** - Customer orders
- **order_items** - Individual items in orders

## 🔐 Default Users

After seeding, you can use these test accounts:

**Admin Account:**
- Email: `admin@ecoshop.com`
- Password: `admin123`

**Customer Account:**
- Email: `customer@ecoshop.com`
- Password: `customer123`

## 📚 API Endpoints

### Authentication

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer"
    }
  }
}
```

#### Get current user
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### Categories

#### Get all categories
```http
GET /api/categories
```

#### Get category by slug
```http
GET /api/categories/eco-fashion
```

### Products

#### Get all products
```http
GET /api/products?category=cat-eco-fashion&featured=true&search=organic&limit=50&offset=0
```

Query Parameters:
- `category` - Filter by category ID
- `featured` - Filter featured products (true/false)
- `search` - Search in product name and description
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

#### Get featured products
```http
GET /api/products/featured?limit=10
```

#### Get product by slug
```http
GET /api/products/organic-cotton-tshirt
```

### Orders

#### Get user orders
```http
GET /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create new order
```http
POST /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "productId": "prod-organic-tshirt",
      "variantId": "var-tshirt-m",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "subtotal": 59.98,
  "shipping": 5.00,
  "tax": 5.20,
  "total": 70.18,
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  }
}
```

#### Get order by ID
```http
GET /api/orders/order-id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update order status (Admin only)
```http
PATCH /api/orders/order-id
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "status": "shipped"
}
```

Valid statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

### Admin Endpoints

#### Get dashboard statistics
```http
GET /api/admin/stats
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Create new product
```http
POST /api/admin/products
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "name": "New Product",
  "slug": "new-product",
  "description": "Product description",
  "price": 29.99,
  "compareAtPrice": 39.99,
  "category": "cat-eco-fashion",
  "images": ["/images/product.jpg"],
  "tags": ["organic", "eco-friendly"],
  "variants": [
    {
      "name": "Small",
      "sku": "PROD-S",
      "price": 29.99,
      "stock": 50,
      "available": true
    }
  ],
  "featured": false,
  "rating": 0,
  "reviewCount": 0,
  "stock": 50
}
```

#### Update product
```http
PUT /api/admin/products/prod-id
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 34.99,
  ...
}
```

#### Delete product
```http
DELETE /api/admin/products/prod-id
Authorization: Bearer ADMIN_JWT_TOKEN
```

## 🔒 Authentication

Protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The token is returned from the login or register endpoints and is valid for 7 days.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:setup` - Create database schema
- `npm run db:seed` - Seed database with initial data

### Project Structure

```
Ecoshop/backend/
├── lib/
│   ├── db.ts              # MySQL connection pool
│   ├── auth.ts            # Authentication utilities
│   ├── types.ts           # TypeScript interfaces
│   └── utils.ts           # Helper functions
├── pages/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── categories/    # Category endpoints
│   │   ├── products/      # Product endpoints
│   │   ├── orders/        # Order endpoints
│   │   └── admin/         # Admin endpoints
│   └── index.tsx          # API documentation page
├── scripts/
│   ├── setup-database.js  # Database schema script
│   └── seed-database.js   # Database seeding script
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

## 🔄 Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## ⚠️ Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `405` - Method Not Allowed
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

## 🌐 CORS Configuration

CORS is configured to allow requests from any origin. For production, update `next.config.js` to restrict origins:

```javascript
{
  key: 'Access-Control-Allow-Origin',
  value: 'https://your-frontend-domain.com'
}
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | localhost |
| `DB_PORT` | MySQL port | 3306 |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | (empty) |
| `DB_NAME` | Database name | ecoshop_db |
| `JWT_SECRET` | Secret for JWT signing | (required) |
| `API_PORT` | API server port | 3001 |
| `NODE_ENV` | Environment | development |

## 🚢 Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a strong `JWT_SECRET` (minimum 32 characters)
3. Configure proper database credentials
4. Update CORS settings in `next.config.js`
5. Enable SSL/TLS for database connections
6. Set up proper logging and monitoring
7. Run `npm run build` to create optimized build
8. Use `npm start` to run the production server

## 🤝 Integration with Frontend

The frontend can connect to this API by setting the base URL:

```typescript
const API_BASE_URL = 'http://localhost:3001/api';

// Example: Login request
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password })
});

// Example: Authenticated request
const response = await fetch(`${API_BASE_URL}/orders`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
```

## 📄 License

This project is part of the EcoShop e-commerce platform.

## 🐛 Troubleshooting

**Database connection errors:**
- Ensure MySQL is running
- Check credentials in `.env` file
- Verify database user has proper permissions

**Port already in use:**
- Change `API_PORT` in `.env` file
- Or stop the process using port 3001

**JWT authentication errors:**
- Ensure `JWT_SECRET` is set in `.env`
- Check token is being sent in Authorization header
- Verify token hasn't expired (7 day validity)

## 📞 Support

For issues or questions, please refer to the main project documentation.
