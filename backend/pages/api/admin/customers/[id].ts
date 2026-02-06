import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAdmin, getAuthUser } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (handleCors(req, res)) return;

    try {
        requireAdmin(req);
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return sendError(res, 'Customer ID is required', 400);
        }

        // GET - Get customer details
        if (req.method === 'GET') {
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
        WHERE u.id = ?
        GROUP BY u.id, u.name, u.email, u.role, u.email_verified, u.created_at
      `;

            const [rows] = await pool.execute(query, [id]);
            const customers = rows as any[];

            if (customers.length === 0) {
                return sendError(res, 'Customer not found', 404);
            }

            return sendSuccess(res, customers[0]);
        }

        // PUT - Update customer (role change)
        if (req.method === 'PUT') {
            const { role } = req.body;

            if (!role || !['customer', 'admin'].includes(role)) {
                return sendError(res, 'Invalid role. Must be "customer" or "admin"', 400);
            }

            // Prevent admin from changing their own role
            const currentUser = getUserFromToken(req);
            if (currentUser?.userId === id) {
                return sendError(res, 'You cannot change your own role', 403);
            }

            const updateQuery = 'UPDATE users SET role = ? WHERE id = ?';
            await pool.execute(updateQuery, [role, id]);

            // Get updated customer data
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
        WHERE u.id = ?
        GROUP BY u.id, u.name, u.email, u.role, u.email_verified, u.created_at
      `;

            const [rows] = await pool.execute(query, [id]);
            const customers = rows as any[];

            return sendSuccess(res, customers[0]);
        }

        // DELETE - Delete customer
        if (req.method === 'DELETE') {
            // Prevent admin from deleting themselves
            const currentUser = getUserFromToken(req);
            if (currentUser?.userId === id) {
                return sendError(res, 'You cannot delete your own account', 403);
            }

            // Check if customer exists
            const [checkRows] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
            const users = checkRows as any[];

            if (users.length === 0) {
                return sendError(res, 'Customer not found', 404);
            }

            // Delete customer (cascade will handle related records)
            await pool.execute('DELETE FROM users WHERE id = ?', [id]);

            return sendSuccess(res, { message: 'Customer deleted successfully' });
        }

        return sendError(res, 'Method not allowed', 405);
    } catch (error) {
        return handleError(res, error);
    }
}
