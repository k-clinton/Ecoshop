import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  // GET - List all orders (admin only)
  if (req.method === 'GET') {
    try {
      requireAdmin(req);

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
        ORDER BY o.created_at DESC
      `;

      const [rows] = await pool.execute(query);
      const orders = rows as any[];

      // Get order items count for each order
      for (const order of orders) {
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
          [order.id]
        );
        
        // Get product images separately
        for (const item of items as any[]) {
          const [images] = await pool.execute(
            `SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order LIMIT 1`,
            [item.productId]
          );
          item.productImage = (images as any[])[0]?.image_url || '';
        }
        order.items = items;
        order.itemCount = (items as any[]).reduce((sum, item) => sum + item.quantity, 0);

        // Parse shippingAddress if it's a string
        if (typeof order.shippingAddress === 'string') {
          try {
            order.shippingAddress = JSON.parse(order.shippingAddress);
          } catch (e) {
            console.error('Error parsing shippingAddress:', e);
          }
        }
      }

      return sendSuccess(res, orders);
    } catch (error) {
      return handleError(res, error);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
