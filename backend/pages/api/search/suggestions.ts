import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (handleCors(req, res)) return;

    if (req.method !== 'GET') {
        return sendError(res, 'Method not allowed', 405);
    }

    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string' || q.trim().length < 2) {
            return sendSuccess(res, []);
        }

        const searchTerm = `%${q.trim()}%`;

        // Fetch top 5 matching products
        const [rows] = await pool.execute(
            `SELECT p.id, p.name, p.slug
       FROM products p
       WHERE MATCH(p.name, p.description) AGAINST(? IN NATURAL LANGUAGE MODE)
       LIMIT 5`,
            [q.trim()]
        );

        const suggestions = rows as any[];

        // Fetch thumbnail for each suggestion
        for (const item of suggestions) {
            const [images] = await pool.execute(
                'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order LIMIT 1',
                [item.id]
            );
            item.image = (images as any[])[0]?.image_url || '';
        }

        return sendSuccess(res, suggestions);
    } catch (error) {
        return handleError(res, error);
    }
}
