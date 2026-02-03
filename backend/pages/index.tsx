export default function Home() {
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      maxWidth: '800px', 
      margin: '50px auto', 
      padding: '20px',
      lineHeight: '1.6'
    }}>
      <h1>🌱 EcoShop API Backend</h1>
      <p>Welcome to the EcoShop API backend server. This API provides endpoints for managing products, orders, categories, and user authentication.</p>
      
      <h2>📚 API Documentation</h2>
      
      <h3>Authentication Endpoints</h3>
      <ul>
        <li><code>POST /api/auth/register</code> - Register a new user</li>
        <li><code>POST /api/auth/login</code> - Login and get JWT token</li>
        <li><code>GET /api/auth/me</code> - Get current user info (requires auth)</li>
      </ul>

      <h3>Category Endpoints</h3>
      <ul>
        <li><code>GET /api/categories</code> - Get all categories</li>
        <li><code>GET /api/categories/[slug]</code> - Get category by slug</li>
      </ul>

      <h3>Product Endpoints</h3>
      <ul>
        <li><code>GET /api/products</code> - Get all products (supports filtering)</li>
        <li><code>GET /api/products/featured</code> - Get featured products</li>
        <li><code>GET /api/products/[slug]</code> - Get product by slug</li>
      </ul>

      <h3>Order Endpoints</h3>
      <ul>
        <li><code>GET /api/orders</code> - Get user orders (requires auth)</li>
        <li><code>POST /api/orders</code> - Create new order (requires auth)</li>
        <li><code>GET /api/orders/[id]</code> - Get order by ID (requires auth)</li>
        <li><code>PATCH /api/orders/[id]</code> - Update order status (admin only)</li>
      </ul>

      <h3>Admin Endpoints</h3>
      <ul>
        <li><code>GET /api/admin/stats</code> - Get dashboard statistics (admin only)</li>
        <li><code>POST /api/admin/products</code> - Create new product (admin only)</li>
        <li><code>PUT /api/admin/products/[id]</code> - Update product (admin only)</li>
        <li><code>DELETE /api/admin/products/[id]</code> - Delete product (admin only)</li>
      </ul>

      <h2>🔑 Authentication</h2>
      <p>Protected endpoints require a JWT token in the Authorization header:</p>
      <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
        Authorization: Bearer YOUR_JWT_TOKEN
      </pre>

      <h2>🚀 Getting Started</h2>
      <p>See the README.md file for setup instructions.</p>
    </div>
  );
}
