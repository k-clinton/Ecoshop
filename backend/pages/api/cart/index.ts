import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (handleCors(req, res)) return;

    let authUser;
    try {
        authUser = requireAuth(req);
    } catch (err) {
        return sendError(res, 'Unauthorized', 401);
    }

    // GET - Get user's cart items
    if (req.method === 'GET') {
        try {
            const [rows] = await pool.execute(
                `SELECT ci.product_id as productId, ci.variant_id as variantId, ci.quantity,
                p.name as productName, p.price, pv.price as variantPrice,
                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as productImage
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         JOIN product_variants pv ON ci.variant_id = pv.id
         WHERE ci.user_id = ?`,
                [authUser.userId]
            );

            // Map to frontend CartItem structure
            const cartItems = (rows as any[]).map(row => ({
                productId: row.productId,
                variantId: row.variantId,
                quantity: row.quantity,
                price: row.variantPrice || row.price,
                productName: row.productName,
                productImage: row.productImage
            }));

            return sendSuccess(res, cartItems);
        } catch (error) {
            return handleError(res, error);
        }
    }

    // PUT - Sync entire cart (Batch replace)
    if (req.method === 'PUT') {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const { items } = req.body; // Array of { productId, variantId, quantity }

            // Clear existing cart
            await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [authUser.userId]);

            // Insert new items
            if (items && items.length > 0) {
                const values = items.map((item: any) => [authUser.userId, item.productId, item.variantId, item.quantity]);
                await connection.query(
                    'INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES ?',
                    [values]
                );
            }

            await connection.commit();
            return sendSuccess(res, { message: 'Cart synced successfully' });
        } catch (error) {
            await connection.rollback();
            return handleError(res, error);
        } finally {
            connection.release();
        }
    }

    return sendError(res, 'Method not allowed', 405);
}
