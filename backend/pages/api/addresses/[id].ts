import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  const authUser = requireAuth(req);
  const { id } = req.query;

  // PATCH - Update address
  if (req.method === 'PATCH') {
    try {
      const { name, street, city, state, zip, country, isDefault } = req.body;

      // Verify ownership
      const [addresses] = await pool.execute(
        'SELECT user_id FROM addresses WHERE id = ?',
        [id]
      );

      if ((addresses as any[]).length === 0) {
        return sendError(res, 'Address not found', 404);
      }

      if ((addresses as any[])[0].user_id !== authUser.userId) {
        return sendError(res, 'Forbidden', 403);
      }

      // Build update query
      const updates: string[] = [];
      const values: any[] = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (street !== undefined) {
        updates.push('street = ?');
        values.push(street);
      }
      if (city !== undefined) {
        updates.push('city = ?');
        values.push(city);
      }
      if (state !== undefined) {
        updates.push('state = ?');
        values.push(state);
      }
      if (zip !== undefined) {
        updates.push('zip = ?');
        values.push(zip);
      }
      if (country !== undefined) {
        updates.push('country = ?');
        values.push(country);
      }
      if (isDefault !== undefined) {
        updates.push('is_default = ?');
        values.push(isDefault);

        // If setting as default, unset other defaults
        if (isDefault) {
          await pool.execute(
            'UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?',
            [authUser.userId, id]
          );
        }
      }

      if (updates.length === 0) {
        return sendError(res, 'No fields to update');
      }

      values.push(id);

      await pool.execute(
        `UPDATE addresses SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Fetch updated address
      const [rows] = await pool.execute(
        `SELECT id, name, street, city, state, zip, country, is_default as isDefault,
                created_at as createdAt
         FROM addresses WHERE id = ?`,
        [id]
      );

      return sendSuccess(res, (rows as any[])[0]);
    } catch (error) {
      return handleError(res, error);
    }
  }

  // DELETE - Delete address
  if (req.method === 'DELETE') {
    try {
      // Verify ownership
      const [addresses] = await pool.execute(
        'SELECT user_id FROM addresses WHERE id = ?',
        [id]
      );

      if ((addresses as any[]).length === 0) {
        return sendError(res, 'Address not found', 404);
      }

      if ((addresses as any[])[0].user_id !== authUser.userId) {
        return sendError(res, 'Forbidden', 403);
      }

      await pool.execute('DELETE FROM addresses WHERE id = ?', [id]);

      return sendSuccess(res, { message: 'Address deleted successfully' });
    } catch (error) {
      return handleError(res, error);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
