import apiCall from './api';

export interface AdminOrder {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    productName: string;
    productImage: string;
  }>;
  itemCount: number;
}

export const adminOrderService = {
  async getOrders(): Promise<AdminOrder[]> {
    const response = await apiCall<AdminOrder[]>('/admin/orders');
    return response;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<AdminOrder> {
    const response = await apiCall<AdminOrder>(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return response;
  }
};
