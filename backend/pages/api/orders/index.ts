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

      if (orders.length > 0) {
        const orderIds = orders.map(o => o.id);
        const [allItems] = await pool.execute(
          `SELECT oi.order_id as orderId, oi.product_id as productId, oi.variant_id as variantId, 
                  oi.quantity, oi.price, p.name as productName
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})`,
          orderIds
        );

        const itemsMap = (allItems as any[]).reduce((acc, item) => {
          if (!acc[item.orderId]) acc[item.orderId] = [];
          acc[item.orderId].push({
            ...item,
            quantity: parseInt(item.quantity, 10),
            price: parseFloat(item.price)
          });
          return acc;
        }, {});

        for (const order of orders) {
          order.items = itemsMap[order.id] || [];

          // Parse shippingAddress if it's a string
          if (typeof order.shippingAddress === 'string') {
            try {
              order.shippingAddress = JSON.parse(order.shippingAddress);
            } catch (e) {
              console.error('Error parsing shippingAddress:', e);
            }
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
      const { items, subtotal, shipping, tax, total, shippingAddress, shippingMethod: method } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return sendError(res, 'Items are required');
      }

      if (!shippingAddress) {
        return sendError(res, 'Shipping address is required');
      }

      // SECURITY: Recalculate totals on backend
      let calculatedSubtotal = 0;
      const productMap = new Map();
      const variantMap = new Map();

      for (const item of items) {
        let price = 0;
        if (item.variantId) {
          const [variants] = await pool.execute(
            'SELECT price FROM product_variants WHERE id = ? AND product_id = ?',
            [item.variantId, item.productId]
          );
          const variant = (variants as any[])[0];
          if (!variant) return sendError(res, `Variant ${item.variantId} not found for product ${item.productId}`);
          price = parseFloat(variant.price);
          variantMap.set(item.variantId, price);
        } else {
          const [products] = await pool.execute(
            'SELECT price FROM products WHERE id = ?',
            [item.productId]
          );
          const product = (products as any[])[0];
          if (!product) return sendError(res, `Product ${item.productId} not found`);
          price = parseFloat(product.price);
          productMap.set(item.productId, price);
        }
        calculatedSubtotal += price * item.quantity;
      }

      // Fetch settings for shipping calculation
      const [settingsRows] = await pool.execute('SELECT * FROM settings WHERE id = "default"');
      const storeSettings = (settingsRows as any[])[0];
      const shippingFee = parseFloat(storeSettings?.shipping_fee || '5.99');
      const freeShippingThreshold = parseFloat(storeSettings?.free_shipping_threshold || '50.00');

      let calculatedShipping = shipping; 
      const shippingMethod = method || 'standard';
      
      if (shippingMethod === 'express') {
        calculatedShipping = 12.99;
      } else {
        calculatedShipping = calculatedSubtotal >= freeShippingThreshold ? 0 : shippingFee;
      }

      const calculatedTax = calculatedSubtotal * 0.08;
      const calculatedTotal = calculatedSubtotal + calculatedShipping + calculatedTax;

      // Mismatch check with 0.01 tolerance
      if (Math.abs(calculatedTotal - total) > 0.01) {
        return sendError(res, `Price mismatch detected. Expected total: ${calculatedTotal.toFixed(2)}, received: ${total.toFixed(2)}. Please refresh your cart.`, 400);
      }

      const orderId = generateId();
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        // Validate stock availability and Update stock
        for (const item of items) {
          if (item.variantId) {
            const [variantRows] = await connection.execute(
              'SELECT stock FROM product_variants WHERE id = ? FOR UPDATE',
              [item.variantId]
            );
            const variant = (variantRows as any[])[0];
            if (!variant || variant.stock < item.quantity) {
              await connection.rollback();
              return sendError(res, `Insufficient stock for product variant`, 400);
            }
            await connection.execute(
              'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
              [item.quantity, item.variantId]
            );
          } else {
            const [productRows] = await connection.execute(
              'SELECT stock FROM products WHERE id = ? FOR UPDATE',
              [item.productId]
            );
            const product = (productRows as any[])[0];
            if (!product || product.stock < item.quantity) {
              await connection.rollback();
              return sendError(res, `Insufficient stock for product`, 400);
            }
            await connection.execute(
              'UPDATE products SET stock = stock - ? WHERE id = ?',
              [item.quantity, item.productId]
            );
          }
        }

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
            calculatedSubtotal,
            calculatedShipping,
            calculatedTax,
            calculatedTotal,
            'pending',
            shippingAddressStr
          ]
        );

        // Add order items
        for (const item of items) {
          const actualPrice = item.variantId ? variantMap.get(item.variantId) : productMap.get(item.productId);
          await connection.execute(
            `INSERT INTO order_items (order_id, product_id, variant_id, quantity, price)
             VALUES (?, ?, ?, ?, ?)`,
            [orderId, item.productId, item.variantId || null, item.quantity, actualPrice]
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
