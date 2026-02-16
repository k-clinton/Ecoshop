import apiCall from './api';

export interface CreateIntentResponse {
    clientSecret: string;
}

export const paymentService = {
    async createPaymentIntent(amount: number, orderId?: string): Promise<CreateIntentResponse> {
        return apiCall<CreateIntentResponse>('/payments/create-intent', {
            method: 'POST',
            body: JSON.stringify({ amount, orderId }),
        });
    },
};
