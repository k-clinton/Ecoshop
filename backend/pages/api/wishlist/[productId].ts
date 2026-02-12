import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (handleCors(req, res)) return;

    const authUser = requireAuth(req);
    const { productId } = req.query;

    // DELETE - Remove from wishlist
    if (req.method === 'DELETE') {
        try {
            await pool.execute(
                'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
                [authUser.userId, productId]
            );
            return sendSuccess(res, { message: 'Removed from wishlist' });
        } catch (error) {
            return handleError(res, error);
        }
    }

    return sendError(res, 'Method not allowed', 405);
}
