import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (handleCors(req, res)) return;

    const authUser = requireAuth(req);

    // GET - List user's wishlist
    if (req.method === 'GET') {
        try {
            const [rows] = await pool.execute(
                `SELECT p.id, p.name, p.slug, p.price, p.rating,
                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as image
         FROM wishlists w
         JOIN products p ON w.product_id = p.id
         WHERE w.user_id = ?`,
                [authUser.userId]
            );
            return sendSuccess(res, rows);
        } catch (error) {
            return handleError(res, error);
        }
    }

    // POST - Add to wishlist
    if (req.method === 'POST') {
        try {
            const { productId } = req.body;
            if (!productId) {
                return sendError(res, 'Product ID is required');
            }

            await pool.execute(
                'INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)',
                [authUser.userId, productId]
            );

            return sendSuccess(res, { message: 'Added to wishlist' }, 201);
        } catch (error) {
            return handleError(res, error);
        }
    }

    return sendError(res, 'Method not allowed', 405);
}
