import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // GET - Get order by ID
  if (req.method === 'GET') {
    try {
      const authUser = requireAuth(req);

      const [rows] = await pool.execute(
        `SELECT id, user_id as userId, subtotal, shipping, tax, total, status,
                shipping_address as shippingAddress, created_at as createdAt,
                updated_at as updatedAt
         FROM orders
         WHERE id = ?`,
        [id]
      );

      const orders = rows as any[];
      if (orders.length === 0) {
        return sendError(res, 'Order not found', 404);
      }

      const order = orders[0];

      // Check if user owns this order or is admin
      if (order.userId !== authUser.userId && authUser.role !== 'admin') {
        return sendError(res, 'Forbidden', 403);
      }

      // Get order items
      const [items] = await pool.execute(
        `SELECT product_id as productId, variant_id as variantId, quantity, price
         FROM order_items
         WHERE order_id = ?`,
        [id]
      );

      order.items = items;
      order.shippingAddress = JSON.parse(order.shippingAddress);

      return sendSuccess(res, order);
    } catch (error) {
      return handleError(res, error);
    }
  }

  // PATCH - Update order status (admin only)
  if (req.method === 'PATCH') {
    try {
      requireAdmin(req);
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

      // Fetch updated order
      const [rows] = await pool.execute(
        `SELECT id, user_id as userId, subtotal, shipping, tax, total, status,
                shipping_address as shippingAddress, created_at as createdAt,
                updated_at as updatedAt
         FROM orders
         WHERE id = ?`,
        [id]
      );

      const order = (rows as any[])[0];

      // Get order items
      const [items] = await pool.execute(
        `SELECT product_id as productId, variant_id as variantId, quantity, price
         FROM order_items
         WHERE order_id = ?`,
        [id]
      );

      order.items = items;
      order.shippingAddress = JSON.parse(order.shippingAddress);

      return sendSuccess(res, order);
    } catch (error) {
      return handleError(res, error);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
