import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    requireAdmin(req);

    // Get total products
    const [productCount] = await pool.execute('SELECT COUNT(*) as count FROM products');
    
    // Get total orders
    const [orderCount] = await pool.execute('SELECT COUNT(*) as count FROM orders');
    
    // Get total revenue
    const [revenue] = await pool.execute('SELECT SUM(total) as total FROM orders WHERE status != "cancelled"');
    
    // Get total customers
    const [customerCount] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
    
    // Get recent orders
    const [recentOrders] = await pool.execute(
      `SELECT id, user_id as userId, total, status, created_at as createdAt
       FROM orders
       ORDER BY created_at DESC
       LIMIT 10`
    );

    // Get low stock products
    const [lowStockProducts] = await pool.execute(
      `SELECT id, name, slug, stock
       FROM products
       WHERE stock < 10
       ORDER BY stock ASC
       LIMIT 10`
    );

    const stats = {
      totalProducts: (productCount as any[])[0].count,
      totalOrders: (orderCount as any[])[0].count,
      totalRevenue: (revenue as any[])[0].total || 0,
      totalCustomers: (customerCount as any[])[0].count,
      recentOrders,
      lowStockProducts
    };

    return sendSuccess(res, stats);
  } catch (error) {
    return handleError(res, error);
  }
}
