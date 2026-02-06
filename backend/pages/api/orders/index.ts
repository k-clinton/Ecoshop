import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { sendSuccess, sendError, handleError, generateId } from '@/lib/utils';
import { Order, CartItem } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

      // Send confirmation email asynchronously (don't block response)
      try {
        // We know authUser.email is in the token payload if available,
        // but let's verify if we need to fetch it from DB or if it's already in authUser.
        // authUser from requireAuth returns JWTPayload which has email.
        if (authUser.email) {
          // Need to hydrate items with names for the email
          // We can do a quick lookup or just rely on what we inserted.
          // But we inserted by ID. We need the product names.
          // Let's refetch items details for the email or query them up front.
          // For simplicity/speed, let's fetch the items with names now.

          const [itemDetails] = await pool.execute(
            `SELECT oi.quantity, oi.price, p.name 
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
            [orderId]
          );

          const emailOrder = {
            ...req.body, // contains subtotal, shipping, tax, total
            id: orderId,
            items: itemDetails
          };

          const { sendOrderConfirmationEmail } = require('@/lib/email');
          sendOrderConfirmationEmail(authUser.email, emailOrder, authUser.userId /* using ID as name fallback or extract name from somewhere if possible */).catch((err: any) => console.error('Background email failed:', err));
        }
      } catch (e) {
        console.error('Email trigger error:', e);
      }

    } catch (error) {
      return handleError(res, error);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
