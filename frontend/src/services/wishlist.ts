import apiCall from './api';
import { Product } from '../data/types';

export const wishlistService = {
    // Get user's wishlist
    async getWishlist(): Promise<Product[]> {
        return apiCall<Product[]>('/wishlist');
    },

    // Add product to wishlist
    async addToWishlist(productId: string): Promise<{ message: string }> {
        return apiCall('/wishlist', {
            method: 'POST',
            body: JSON.stringify({ productId }),
        });
    },

    // Remove product from wishlist
    async removeFromWishlist(productId: string): Promise<{ message: string }> {
        return apiCall(`/wishlist/${productId}`, {
            method: 'DELETE',
        });
    },
};
