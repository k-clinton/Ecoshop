import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendSuccess, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (handleCors(req, res)) return;

    try {
        requireAdmin(req);

        // Get daily sales for the last 30 days
        const [dailySales] = await pool.execute(
            `SELECT 
        DATE(created_at) as date,
        SUM(total) as revenue,
        COUNT(*) as orders
       FROM orders
       WHERE status != "cancelled" 
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
        );

        // Get sales by category
        const [categorySales] = await pool.execute(
            `SELECT 
        c.name as category,
        SUM(oi.price * oi.quantity) as revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status != "cancelled"
       GROUP BY c.id
       ORDER BY revenue DESC`
        );

        return sendSuccess(res, {
            dailySales,
            categorySales
        });
    } catch (error) {
        return handleError(res, error);
    }
}
