import apiCall from './api';

export interface Review {
    id: number;
    rating: number;
    comment: string;
    userName: string;
    createdAt: string;
}

export const reviewService = {
    // Get reviews for a product
    async getReviews(productId: string): Promise<Review[]> {
        return apiCall<Review[]>(`/reviews/${productId}`);
    },

    // Submit a new review
    async submitReview(productId: string, rating: number, comment: string): Promise<{ message: string }> {
        return apiCall(`/reviews/${productId}`, {
            method: 'POST',
            body: JSON.stringify({ rating, comment }),
        });
    },
};
