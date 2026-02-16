import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { handleCors } from '@/lib/cors';
import { requireAuth } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (handleCors(req, res)) return;

    if (req.method !== 'POST') {
        return sendError(res, 'Method not allowed', 405);
    }

    try {
        const authUser = requireAuth(req);
        const { amount, currency = 'usd', orderId } = req.body;

        if (!amount || amount <= 0) {
            return sendError(res, 'Invalid amount');
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents
            currency,
            metadata: {
                userId: authUser.userId,
                orderId: orderId || 'temp_' + Date.now(),
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return sendSuccess(res, {
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        return handleError(res, error);
    }
}
