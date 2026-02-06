# 🔗 Frontend Integration Guide

This guide shows how to integrate the EcoShop backend API with your frontend application.

## 🚀 Quick Integration

### 1. Configure API Base URL

Create an API configuration file in your frontend:

```typescript
// frontend/src/config/api.ts
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

### 2. Create API Service Layer

```typescript
// frontend/src/services/api.ts
const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }

  return result.data as T;
}

export default apiCall;
```

### 3. Authentication Service

```typescript
// frontend/src/services/auth.ts
import apiCall from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  // Register new user
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const data = await apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    localStorage.setItem('authToken', data.token);
    return data;
  },

  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    localStorage.setItem('authToken', data.token);
    return data;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    return apiCall<User>('/auth/me');
  },

  // Logout
  logout() {
    localStorage.removeItem('authToken');
  },

  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
};
```

### 4. Product Service

```typescript
// frontend/src/services/products.ts
import apiCall from './api';
import { Product } from '../types';

export interface ProductFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export const productService = {
  // Get all products with optional filters
  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    return apiCall<Product[]>(`/products?${params}`);
  },

  // Get featured products
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return apiCall<Product[]>(`/products/featured?limit=${limit}`);
  },

  // Get product by slug
  async getProductBySlug(slug: string): Promise<Product> {
    return apiCall<Product>(`/products/${slug}`);
  },

  // Get products by category
  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    const categories = await apiCall<any[]>('/categories');
    const category = categories.find(c => c.slug === categorySlug);
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    return this.getProducts({ category: category.id });
  }
};
```

### 5. Category Service

```typescript
// frontend/src/services/categories.ts
import apiCall from './api';
import { Category } from '../types';

export const categoryService = {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    return apiCall<Category[]>('/categories');
  },

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<Category> {
    return apiCall<Category>(`/categories/${slug}`);
  }
};
```

### 6. Order Service

```typescript
// frontend/src/services/orders.ts
import apiCall from './api';
import { Order, CartItem, Address } from '../types';

export interface CreateOrderRequest {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
}

export const orderService = {
  // Get user's orders
  async getOrders(): Promise<Order[]> {
    return apiCall<Order[]>('/orders');
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order> {
    return apiCall<Order>(`/orders/${orderId}`);
  },

  // Create new order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    return apiCall<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Update order status (admin only)
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return apiCall<Order>(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
};
```

### 7. Admin Service

```typescript
// frontend/src/services/admin.ts
import apiCall from './api';

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

export const adminService = {
  // Get dashboard statistics
  async getStats(): Promise<DashboardStats> {
    return apiCall<DashboardStats>('/admin/stats');
  },

  // Create product
  async createProduct(productData: any): Promise<any> {
    return apiCall<any>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  // Update product
  async updateProduct(productId: string, productData: any): Promise<any> {
    return apiCall<any>(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  // Delete product
  async deleteProduct(productId: string): Promise<any> {
    return apiCall<any>(`/admin/products/${productId}`, {
      method: 'DELETE',
    });
  }
};
```

## 🎣 React Hooks Examples

### useAuth Hook

```typescript
// frontend/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService, User } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    if (authService.isAuthenticated()) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        authService.logout();
      }
    }
    setLoading(false);
  }

  async function login(email: string, password: string) {
    const { user: userData } = await authService.login(email, password);
    setUser(userData);
  }

  async function register(email: string, password: string, name: string) {
    const { user: userData } = await authService.register(email, password, name);
    setUser(userData);
  }

  function logout() {
    authService.logout();
    setUser(null);
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };
}
```

### useProducts Hook

```typescript
// frontend/src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { productService, ProductFilters } from '../services/products';
import { Product } from '../types';

export function useProducts(filters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [JSON.stringify(filters)]);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await productService.getProducts(filters);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  return { products, loading, error, refetch: loadProducts };
}
```

### useProduct Hook

```typescript
// frontend/src/hooks/useProduct.ts
import { useState, useEffect } from 'react';
import { productService } from '../services/products';
import { Product } from '../types';

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  async function loadProduct() {
    try {
      setLoading(true);
      const data = await productService.getProductBySlug(slug);
      setProduct(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }

  return { product, loading, error, refetch: loadProduct };
}
```

## 📱 Usage Examples

### Login Component

```typescript
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard or home
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p>{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

### Products List Component

```typescript
import React from 'react';
import { useProducts } from '../hooks/useProducts';

export function ProductsList({ category }: { category?: string }) {
  const { products, loading, error } = useProducts({ category });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="products-grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <img src={product.images[0]} alt={product.name} />
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Checkout Component

```typescript
import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { orderService } from '../services/orders';

export function CheckoutPage() {
  const { items, total } = useCart();
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const order = await orderService.createOrder({
        items,
        subtotal: total,
        shipping: 5.00,
        tax: total * 0.08,
        total: total + 5.00 + (total * 0.08),
        shippingAddress
      });
      
      // Redirect to order confirmation
      console.log('Order created:', order);
    } catch (error) {
      console.error('Order failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Shipping address form fields */}
      <button type="submit">Place Order</button>
    </form>
  );
}
```

## 🔒 Protected Routes

```typescript
// frontend/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children, adminOnly = false }: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

// Usage in router:
<Route path="/orders" element={
  <ProtectedRoute>
    <OrdersPage />
  </ProtectedRoute>
} />

<Route path="/admin" element={
  <ProtectedRoute adminOnly>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

## ⚙️ Environment Variables

Create a `.env` file in your frontend:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

Or for Vite:
```env
VITE_API_URL=http://localhost:3001/api
```

## 🔄 State Management (Optional)

### Using Context API

```typescript
// frontend/src/context/CartContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(current => {
      const existing = current.find(
        i => i.productId === item.productId && i.variantId === item.variantId
      );
      
      if (existing) {
        return current.map(i =>
          i.productId === item.productId && i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      
      return [...current, item];
    });
  };

  const removeItem = (productId: string, variantId: string) => {
    setItems(current =>
      current.filter(i => !(i.productId === productId && i.variantId === variantId))
    );
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    setItems(current =>
      current.map(i =>
        i.productId === productId && i.variantId === variantId
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

## 📝 TypeScript Types

Copy these from the backend or create shared types:

```typescript
// frontend/src/types/index.ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  available: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  variants: ProductVariant[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  stock: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}
```

## 🚀 Getting Started

1. **Install dependencies in your frontend:**
   ```bash
   # No additional dependencies needed for basic fetch API
   # Or install axios if preferred:
   npm install axios
   ```

2. **Copy the service files** to your frontend project

3. **Configure the API URL** in your environment variables

4. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd Ecoshop/backend
   npm run dev

   # Terminal 2 - Frontend
   cd path/to/frontend
   npm start
   ```

## 🎯 Complete Integration Example

See your existing frontend code in `src/` directory. The mockData can now be replaced with API calls using the services above.

---

**Ready to connect your frontend! 🔌**
