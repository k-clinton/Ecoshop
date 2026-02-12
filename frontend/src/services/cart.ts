import apiCall from './api';
import { CartItem } from '../data/types';

export const cartService = {
    // Get remote cart
    async getCart(): Promise<CartItem[]> {
        return apiCall<CartItem[]>('/cart');
    },

    // Sync cart to remote
    async syncCart(items: CartItem[]): Promise<{ message: string }> {
        return apiCall('/cart', {
            method: 'PUT',
            body: JSON.stringify({ items }),
        });
    },
};
