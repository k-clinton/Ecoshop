import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

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

      // Safe JSON parsing for shippingAddress
      if (order.shippingAddress && typeof order.shippingAddress === 'string') {
        try {
          order.shippingAddress = JSON.parse(order.shippingAddress);
        } catch (e) {
          console.error('Error parsing shippingAddress:', e);
        }
      }

      // Enrich items with product information
      for (const item of order.items as any[]) {
        const [productRows] = await pool.execute(
          'SELECT name FROM products WHERE id = ?',
          [item.productId]
        );
        item.productName = (productRows as any[])[0]?.name || 'Unknown Product';

        const [imageRows] = await pool.execute(
          'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order LIMIT 1',
          [item.productId]
        );
        item.productImage = (imageRows as any[])[0]?.image_url || '';
      }

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

      // Fetch updated order enriched with product data
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

      // Safe JSON parsing for shippingAddress
      if (order.shippingAddress && typeof order.shippingAddress === 'string') {
        try {
          order.shippingAddress = JSON.parse(order.shippingAddress);
        } catch (e) {
          console.error('Error parsing shippingAddress:', e);
        }
      }

      // Enrich items with product information
      for (const item of order.items as any[]) {
        const [productRows] = await pool.execute(
          'SELECT name FROM products WHERE id = ?',
          [item.productId]
        );
        item.productName = (productRows as any[])[0]?.name || 'Unknown Product';

        const [imageRows] = await pool.execute(
          'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order LIMIT 1',
          [item.productId]
        );
        item.productImage = (imageRows as any[])[0]?.image_url || '';
      }

      return sendSuccess(res, order);
    } catch (error) {
      return handleError(res, error);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
