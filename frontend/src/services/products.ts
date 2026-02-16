import apiCall from './api';
import { Product } from '../data/types';

export interface ProductFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  tags?: string;
  inStock?: boolean;
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

    const queryString = params.toString();
    return apiCall<Product[]>(`/products${queryString ? `?${queryString}` : ''}`);
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
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.getProducts({ category: categoryId });
  }
};
