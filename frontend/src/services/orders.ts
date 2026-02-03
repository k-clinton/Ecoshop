import apiCall from './api';
import { Order, CartItem, Address } from '../data/types';

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
