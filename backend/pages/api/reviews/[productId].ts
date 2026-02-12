import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (handleCors(req, res)) return;

    const { productId } = req.query;

    if (req.method === 'GET') {
        try {
            const [rows] = await pool.execute(
                `SELECT pr.id, pr.rating, pr.comment, pr.created_at as createdAt,
                u.name as userName
         FROM product_reviews pr
         JOIN users u ON pr.user_id = u.id
         WHERE pr.product_id = ?
         ORDER BY pr.created_at DESC`,
                [productId]
            );

            return sendSuccess(res, rows);
        } catch (error) {
            return handleError(res, error);
        }
    }

    if (req.method === 'POST') {
        try {
            const authUser = requireAuth(req);
            const { rating, comment } = req.body;

            if (!rating || rating < 1 || rating > 5) {
                return sendError(res, 'Invalid rating');
            }

            await pool.execute(
                'INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
                [productId, authUser.userId, rating, comment]
            );

            // Update product aggregate rating
            const [stats]: any = await pool.execute(
                'SELECT AVG(rating) as avgRating, COUNT(*) as reviewCount FROM product_reviews WHERE product_id = ?',
                [productId]
            );
            const { avgRating, reviewCount } = stats[0];

            await pool.execute(
                'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
                [avgRating, reviewCount, productId]
            );

            return sendSuccess(res, { message: 'Review submitted successfully' }, 201);
        } catch (error) {
            return handleError(res, error);
        }
    }

    return sendError(res, 'Method not allowed', 405);
}
