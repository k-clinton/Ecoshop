import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { validate } from '@/lib/validation';
import { orderSchema } from '@/lib/schemas';
import { sendSuccess, sendError, handleError, generateId } from '@/lib/utils';
import { Order, CartItem } from '@/lib/types';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  // GET - List orders (user's own or all if admin)
  if (req.method === 'GET') {
    try {
      const authUser = requireAuth(req);

      let query = `
        SELECT id, user_id as userId, subtotal, shipping, tax, total, status,
               shipping_address as shippingAddress, created_at as createdAt,
               updated_at as updatedAt
        FROM orders
      `;
      const params: any[] = [];

      // If not admin, only show user's own orders
      if (authUser.role !== 'admin') {
        query += ' WHERE user_id = ?';
        params.push(authUser.userId);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await pool.execute(query, params);
      const orders = rows as any[];

      // Get order items for each order
      for (const order of orders) {
        const [items] = await pool.execute(
          `SELECT product_id as productId, variant_id as variantId, quantity, price
           FROM order_items
           WHERE order_id = ?`,
          [order.id]
        );
        order.items = (items as any[]).map(item => ({
          ...item,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        }));

        // Parse shippingAddress if it's a string
        if (typeof order.shippingAddress === 'string') {
          try {
            order.shippingAddress = JSON.parse(order.shippingAddress);
          } catch (e) {
            // If parsing fails, keep it as is
            console.error('Error parsing shippingAddress:', e);
          }
        }
      }

      return sendSuccess(res, orders);
    } catch (error) {
      return handleError(res, error);
    }
  }

  // POST - Create new order
  if (req.method === 'POST') {
    try {
      const authUser = requireAuth(req);
      const { items, subtotal, shipping, tax, total, shippingAddress } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return sendError(res, 'Items are required');
      }

      if (!shippingAddress) {
        return sendError(res, 'Shipping address is required');
      }

      // SECURITY: Recalculate totals on backend
      const productIds = items.map(i => i.productId);
      const [products] = await pool.execute(
        `SELECT id, price FROM products WHERE id IN (${productIds.map(() => '?').join(',')})`,
        productIds
      );
      const productMap = (products as any[]).reduce((acc, p) => ({ ...acc, [p.id]: p.price }), {});

      let calculatedSubtotal = 0;
      for (const item of items) {
        const actualPrice = productMap[item.productId];
        if (actualPrice === undefined) {
          return sendError(res, `Product ${item.productId} not found`);
        }
        calculatedSubtotal += actualPrice * item.quantity;
      }

      // Basic mismatch check (tolerance for rounding ideally, but here we expect exact match or we trust backend)
      if (Math.abs(calculatedSubtotal - subtotal) > 0.01) {
        return sendError(res, 'Price mismatch detected. Please refresh your cart.', 400);
      }

      const orderId = generateId();
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        // Stringify shippingAddress if it's an object
        const shippingAddressStr = typeof shippingAddress === 'string'
          ? shippingAddress
          : JSON.stringify(shippingAddress);

        // Create order
        await connection.execute(
          `INSERT INTO orders (id, user_id, subtotal, shipping, tax, total, status, shipping_address)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            authUser.userId,
            subtotal,
            shipping,
            tax,
            total,
            'pending',
            shippingAddressStr
          ]
        );

        // Add order items and update stock
        for (const item of items) {
          await connection.execute(
            `INSERT INTO order_items (order_id, product_id, variant_id, quantity, price)
             VALUES (?, ?, ?, ?, ?)`,
            [orderId, item.productId, item.variantId || null, item.quantity, item.price]
          );

          // Update variant stock if variant specified
          if (item.variantId) {
            await connection.execute(
              'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
              [item.quantity, item.variantId]
            );
          }

          // Update product stock
          await connection.execute(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.productId]
          );
        }

        // Award loyalty points (10 points per $1)
        const pointsToAward = Math.round(total * 10);
        await connection.execute(
          'UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?',
          [pointsToAward, authUser.userId]
        );

        await connection.commit();

        // Fetch the created order
        const [orders] = await connection.execute(
          `SELECT id, user_id as userId, subtotal, shipping, tax, total, status,
                  shipping_address as shippingAddress, created_at as createdAt,
                  updated_at as updatedAt
           FROM orders WHERE id = ?`,
          [orderId]
        );

        const order = (orders as any[])[0];
        order.items = items;

        // Parse shippingAddress if it's a string
        if (typeof order.shippingAddress === 'string') {
          try {
            order.shippingAddress = JSON.parse(order.shippingAddress);
          } catch (e) {
            // If parsing fails, keep it as is
            console.error('Error parsing shippingAddress:', e);
          }
        }

        // Send confirmation email asynchronously (don't block response)
        try {
          if (authUser.email) {
            const [itemDetails] = await pool.execute(
              `SELECT oi.quantity, oi.price, p.name 
                   FROM order_items oi
                   JOIN products p ON oi.product_id = p.id
                   WHERE oi.order_id = ?`,
              [orderId]
            );

            const emailOrder = {
              subtotal,
              shipping,
              tax,
              total,
              id: orderId,
              items: itemDetails
            };

            const { sendOrderConfirmationEmail } = require('@/lib/email');
            sendOrderConfirmationEmail(authUser.email, emailOrder, authUser.email).catch((err: any) => console.error('Background email failed:', err));
          }
        } catch (e) {
          console.error('Email trigger error:', e);
        }

        return sendSuccess(res, order, 201);
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

    } catch (error) {
      return handleError(res, error);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return validate(orderSchema)(handler)(req, res);
  }
  return handler(req, res);
};
