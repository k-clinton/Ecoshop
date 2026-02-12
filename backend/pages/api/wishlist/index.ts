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
                `SELECT p.id, p.name, p.slug, p.description, p.price, p.compare_at_price as compareAtPrice,
                        p.category, p.featured, p.rating, p.review_count as reviewCount, p.stock,
                        p.created_at as createdAt
                 FROM wishlists w
                 JOIN products p ON w.product_id = p.id
                 WHERE w.user_id = ?`,
                [authUser.userId]
            );

            const products = rows as any[];

            // Fetch related data for each product to match the frontend expectations
            for (const product of products) {
                // Get images
                const [images] = await pool.execute(
                    'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order',
                    [product.id]
                );
                product.images = (images as any[]).map(img => img.image_url);

                // Get tags
                const [tags] = await pool.execute(
                    'SELECT tag FROM product_tags WHERE product_id = ?',
                    [product.id]
                );
                product.tags = (tags as any[]).map(t => t.tag);

                // Get variants
                const [variants] = await pool.execute(
                    'SELECT id, name, sku, price, stock, available FROM product_variants WHERE product_id = ?',
                    [product.id]
                );
                product.variants = (variants as any[]).map(v => ({
                    ...v,
                    available: Boolean(v.available)
                }));
            }

            return sendSuccess(res, products);
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
