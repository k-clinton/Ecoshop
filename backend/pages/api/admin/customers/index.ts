import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  // GET - List all customers (admin only)
  if (req.method === 'GET') {
    try {
      requireAdmin(req);

      // Get all users with their order statistics
      const query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          u.email_verified as emailVerified,
          u.created_at as joinDate,
          COUNT(DISTINCT o.id) as orders,
          COALESCE(SUM(o.total), 0) as totalSpent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.role = 'customer'
        GROUP BY u.id, u.name, u.email, u.role, u.email_verified, u.created_at
        ORDER BY u.created_at DESC
      `;

      const [rows] = await pool.execute(query);
      const customers = rows as any[];

      return sendSuccess(res, customers);
    } catch (error) {
      return handleError(res, error);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
