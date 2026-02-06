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

  // Get all products (admin view)
  async getProducts(): Promise<any[]> {
    return apiCall<any[]>('/admin/products');
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
  },

  // Adjust product stock
  async adjustStock(productId: string, adjustment: number): Promise<any> {
    return apiCall<any>(`/admin/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ adjustment }),
    });
  },

  // Upload product image
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return apiCall<{ url: string }>('/admin/upload', {
      method: 'POST',
      body: formData,
    });
  }
};
