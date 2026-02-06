# 🧪 API Testing Guide

This guide provides example requests for testing all API endpoints.

## Base URL
```
http://localhost:3001/api
```

## Testing with curl

### 1. Authentication Endpoints

#### Register New User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ecoshop.com",
    "password": "admin123"
  }'
```

**Save the token from the response for authenticated requests!**

#### Get Current User
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Category Endpoints

#### Get All Categories
```bash
curl http://localhost:3001/api/categories
```

#### Get Category by Slug
```bash
curl http://localhost:3001/api/categories/eco-fashion
```

### 3. Product Endpoints

#### Get All Products
```bash
curl http://localhost:3001/api/products
```

#### Get Products with Filters
```bash
# Filter by category
curl "http://localhost:3001/api/products?category=cat-eco-fashion"

# Search products
curl "http://localhost:3001/api/products?search=organic"

# Get featured products only
curl "http://localhost:3001/api/products?featured=true"

# Pagination
curl "http://localhost:3001/api/products?limit=10&offset=0"

# Combined filters
curl "http://localhost:3001/api/products?category=cat-eco-fashion&featured=true&limit=5"
```

#### Get Featured Products
```bash
curl "http://localhost:3001/api/products/featured?limit=10"
```

#### Get Product by Slug
```bash
curl http://localhost:3001/api/products/organic-cotton-tshirt
```

### 4. Order Endpoints

#### Get User Orders
```bash
curl http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Create New Order
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

#### Get Order by ID
```bash
curl http://localhost:3001/api/orders/ORDER_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Update Order Status (Admin Only)
```bash
curl -X PATCH http://localhost:3001/api/orders/ORDER_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped"
  }'
```

### 5. Admin Endpoints

#### Get Dashboard Statistics
```bash
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

#### Create New Product
```bash
curl -X POST http://localhost:3001/api/admin/products \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Eco-Friendly Notebook",
    "slug": "eco-friendly-notebook",
    "description": "100% recycled paper notebook",
    "price": 15.99,
    "compareAtPrice": 19.99,
    "category": "cat-books",
    "images": ["/images/product-notebook.jpg"],
    "tags": ["recycled", "eco-friendly", "stationery"],
    "variants": [
      {
        "name": "A5 Size",
        "sku": "NOTE-ECO-A5",
        "price": 15.99,
        "stock": 100,
        "available": true
      }
    ],
    "featured": false,
    "rating": 0,
    "reviewCount": 0,
    "stock": 100
  }'
```

#### Update Product
```bash
curl -X PUT http://localhost:3001/api/admin/products/PRODUCT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "price": 34.99,
    "stock": 150
  }'
```

#### Delete Product
```bash
curl -X DELETE http://localhost:3001/api/admin/products/PRODUCT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Testing with Postman

### Import Collection

Create a new Postman collection with these requests:

1. **Environment Variables:**
   - `base_url`: `http://localhost:3001/api`
   - `token`: (set after login)
   - `admin_token`: (set after admin login)

2. **Pre-request Script for Authenticated Requests:**
   ```javascript
   pm.request.headers.add({
     key: 'Authorization',
     value: 'Bearer ' + pm.environment.get('token')
   });
   ```

3. **Test Script for Login:**
   ```javascript
   if (pm.response.code === 200) {
     var jsonData = pm.response.json();
     pm.environment.set('token', jsonData.data.token);
   }
   ```

### Sample Postman Requests

#### 1. Login (Save Token)
- **Method:** POST
- **URL:** `{{base_url}}/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "admin@ecoshop.com",
    "password": "admin123"
  }
  ```
- **Tests:**
  ```javascript
  pm.environment.set('token', pm.response.json().data.token);
  ```

#### 2. Get Products
- **Method:** GET
- **URL:** `{{base_url}}/products`
- **Headers:** None required

#### 3. Create Order
- **Method:** POST
- **URL:** `{{base_url}}/orders`
- **Headers:** `Authorization: Bearer {{token}}`
- **Body:** See curl example above

## Testing with JavaScript/Fetch

```javascript
// Base configuration
const API_BASE_URL = 'http://localhost:3001/api';
let authToken = null;

// 1. Login
async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    authToken = data.data.token;
    console.log('Login successful!');
    return data.data;
  }
  throw new Error(data.error);
}

// 2. Get Products
async function getProducts(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/products?${params}`);
  const data = await response.json();
  return data.data;
}

// 3. Create Order (requires auth)
async function createOrder(orderData) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(orderData)
  });
  
  const data = await response.json();
  return data.data;
}

// 4. Get User Orders
async function getUserOrders() {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  return data.data;
}

// Example usage:
(async () => {
  try {
    // Login
    await login('customer@ecoshop.com', 'customer123');
    
    // Get products
    const products = await getProducts({ category: 'cat-eco-fashion', limit: 10 });
    console.log('Products:', products);
    
    // Create order
    const order = await createOrder({
      items: [{
        productId: 'prod-organic-tshirt',
        variantId: 'var-tshirt-m',
        quantity: 1,
        price: 29.99
      }],
      subtotal: 29.99,
      shipping: 5.00,
      tax: 2.80,
      total: 37.79,
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA'
      }
    });
    console.log('Order created:', order);
    
    // Get user orders
    const orders = await getUserOrders();
    console.log('User orders:', orders);
    
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Common HTTP Status Codes

- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `405` - Method Not Allowed
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

## Testing Checklist

- [ ] User can register with valid credentials
- [ ] User cannot register with duplicate email
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong credentials
- [ ] All categories are returned
- [ ] Products can be filtered by category
- [ ] Products can be searched by keyword
- [ ] Featured products are returned correctly
- [ ] Product details include images, tags, and variants
- [ ] Authenticated user can create orders
- [ ] Orders update product stock correctly
- [ ] User can view their own orders
- [ ] User cannot view other users' orders
- [ ] Admin can view all orders
- [ ] Admin can update order status
- [ ] Admin can create, update, and delete products
- [ ] Admin endpoints reject non-admin users
- [ ] Protected endpoints reject requests without token

## Performance Testing

### Load Test Example (using Apache Bench)
```bash
# Test GET products endpoint
ab -n 1000 -c 10 http://localhost:3001/api/products

# Test with authentication (save token to file first)
ab -n 100 -c 5 -H "Authorization: Bearer YOUR_TOKEN" \
   http://localhost:3001/api/orders
```

## Security Testing

1. **Test without authentication:**
   ```bash
   # Should return 401
   curl http://localhost:3001/api/orders
   ```

2. **Test with invalid token:**
   ```bash
   # Should return 401
   curl http://localhost:3001/api/orders \
     -H "Authorization: Bearer invalid_token"
   ```

3. **Test admin endpoint as regular user:**
   ```bash
   # Should return 403
   curl http://localhost:3001/api/admin/stats \
     -H "Authorization: Bearer CUSTOMER_TOKEN"
   ```

4. **Test SQL injection prevention:**
   ```bash
   # Should handle safely
   curl "http://localhost:3001/api/products?search='; DROP TABLE products; --"
   ```

## Troubleshooting

### CORS Errors
If testing from a browser, you might see CORS errors. The API is configured to allow all origins in development. For production, update `next.config.js`.

### Token Expiration
Tokens expire after 7 days. If you get 401 errors, try logging in again to get a fresh token.

### Database Errors
If you see database connection errors:
1. Ensure MySQL is running
2. Check credentials in `.env` file
3. Verify database exists and tables are created

---

**Happy Testing! 🧪**
