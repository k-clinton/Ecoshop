import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sendSuccess, sendError, handleError, generateId } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  const authUser = requireAuth(req);

  // GET - Get all addresses for user
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.execute(
        `SELECT id, name, street, city, state, zip, country, is_default as isDefault, 
                created_at as createdAt
         FROM addresses
         WHERE user_id = ?
         ORDER BY is_default DESC, created_at DESC`,
        [authUser.userId]
      );

      return sendSuccess(res, rows);
    } catch (error) {
      return handleError(res, error);
    }
  }

  // POST - Create new address
  if (req.method === 'POST') {
    try {
      const { name, street, city, state, zip, country, isDefault } = req.body;

      if (!name || !street || !city || !state || !zip || !country) {
        return sendError(res, 'All address fields are required');
      }

      const addressId = generateId();

      // If this is set as default, unset other defaults
      if (isDefault) {
        await pool.execute(
          'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
          [authUser.userId]
        );
      }

      await pool.execute(
        `INSERT INTO addresses (id, user_id, name, street, city, state, zip, country, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [addressId, authUser.userId, name, street, city, state, zip, country, isDefault || false]
      );

      const [rows] = await pool.execute(
        `SELECT id, name, street, city, state, zip, country, is_default as isDefault,
                created_at as createdAt
         FROM addresses WHERE id = ?`,
        [addressId]
      );

      return sendSuccess(res, (rows as any[])[0], 201);
    } catch (error) {
      return handleError(res, error);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
