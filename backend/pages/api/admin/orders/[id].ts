import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (handleCors(req, res)) return;

    const { id } = req.query;

    try {
        requireAdmin(req);

        // GET - Get order detail for admin
        if (req.method === 'GET') {
            const query = `
        SELECT 
          o.id,
          o.user_id as userId,
          u.name as customerName,
          u.email as customerEmail,
          o.subtotal,
          o.shipping,
          o.tax,
          o.total,
          o.status,
          o.shipping_address as shippingAddress,
          o.created_at as createdAt,
          o.updated_at as updatedAt
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `;

            const [rows] = await pool.execute(query, [id]);
            const orders = rows as any[];

            if (orders.length === 0) {
                return sendError(res, 'Order not found', 404);
            }

            const order = orders[0];

            // Get enriched order items
            const [items] = await pool.execute(
                `SELECT 
          oi.product_id as productId, 
          oi.variant_id as variantId, 
          oi.quantity, 
          oi.price,
          p.name as productName
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
                [id]
            );

            // Get product images
            for (const item of items as any[]) {
                const [images] = await pool.execute(
                    `SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order LIMIT 1`,
                    [item.productId]
                );
                item.productImage = (images as any[])[0]?.image_url || '';
            }

            order.items = items;
            order.itemCount = (items as any[]).reduce((sum, item) => sum + item.quantity, 0);

            // Safe JSON parsing for shippingAddress
            if (order.shippingAddress && typeof order.shippingAddress === 'string') {
                try {
                    order.shippingAddress = JSON.parse(order.shippingAddress);
                } catch (e) {
                    console.error('Error parsing shippingAddress:', e);
                }
            }

            return sendSuccess(res, order);
        }

        // PATCH - Update order status (admin)
        if (req.method === 'PATCH') {
            const { status } = req.body;

            if (!status) {
                return sendError(res, 'Status is required');
            }

            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return sendError(res, 'Invalid status');
            }

            const [result] = await pool.execute(
                'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [status, id]
            );

            if ((result as any).affectedRows === 0) {
                return sendError(res, 'Order not found', 404);
            }

            // Return the full enriched order after update
            // Re-use the same query as GET
            const enrichmentQuery = `
        SELECT 
          o.id,
          o.user_id as userId,
          u.name as customerName,
          u.email as customerEmail,
          o.subtotal,
          o.shipping,
          o.tax,
          o.total,
          o.status,
          o.shipping_address as shippingAddress,
          o.created_at as createdAt,
          o.updated_at as updatedAt
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `;

            const [rows] = await pool.execute(enrichmentQuery, [id]);
            const order = (rows as any[])[0];

            // Get enriched order items
            const [items] = await pool.execute(
                `SELECT 
          oi.product_id as productId, 
          oi.variant_id as variantId, 
          oi.quantity, 
          oi.price,
          p.name as productName
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
                [id]
            );

            for (const item of items as any[]) {
                const [images] = await pool.execute(
                    `SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order LIMIT 1`,
                    [item.productId]
                );
                item.productImage = (images as any[])[0]?.image_url || '';
            }

            order.items = items;
            order.itemCount = (items as any[]).reduce((sum, item) => sum + item.quantity, 0);

            // Safe JSON parsing for shippingAddress
            if (order.shippingAddress && typeof order.shippingAddress === 'string') {
                try {
                    order.shippingAddress = JSON.parse(order.shippingAddress);
                } catch (e) {
                    console.error('Error parsing shippingAddress:', e);
                }
            }

            return sendSuccess(res, order);
        }

        return sendError(res, 'Method not allowed', 405);
    } catch (error) {
        return handleError(res, error);
    }
}
