import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { validate } from '@/lib/validation';
import { statusUpdateSchema } from '@/lib/schemas';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
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

      // Get order items enriched with product information
      const [items] = await pool.execute(
        `SELECT oi.product_id as productId, oi.variant_id as variantId, oi.quantity, oi.price,
                p.name as productName,
                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as productImage
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [id]
      );

      order.items = (items as any[]).map(item => ({
        ...item,
        quantity: parseInt(item.quantity, 10),
        price: parseFloat(item.price)
      }));

      // Safe JSON parsing for shippingAddress
      if (order.shippingAddress && typeof order.shippingAddress === 'string') {
        try {
          order.shippingAddress = JSON.parse(order.shippingAddress);
        } catch (e) {
          console.error('Error parsing shippingAddress:', e);
        }
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

      // Get order items enriched with product information
      const [items] = await pool.execute(
        `SELECT oi.product_id as productId, oi.variant_id as variantId, oi.quantity, oi.price,
                p.name as productName,
                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as productImage
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [id]
      );

      order.items = (items as any[]).map(item => ({
        ...item,
        quantity: parseInt(item.quantity, 10),
        price: parseFloat(item.price)
      }));

      // Safe JSON parsing for shippingAddress
      if (order.shippingAddress && typeof order.shippingAddress === 'string') {
        try {
          order.shippingAddress = JSON.parse(order.shippingAddress);
        } catch (e) {
          console.error('Error parsing shippingAddress:', e);
        }
      }

      return sendSuccess(res, order);
    } catch (error) {
      return handleError(res, error);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PATCH') {
    return validate(statusUpdateSchema)(handler)(req, res);
  }
  return handler(req, res);
};
