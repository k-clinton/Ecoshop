import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { sendSuccess, sendError, handleError, generateId } from '@/lib/utils';
import { Order, CartItem } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
