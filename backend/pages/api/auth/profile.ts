import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';
import { User } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'PATCH') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const authUser = requireAuth(req);
    const { name, email } = req.body;

    if (!name && !email) {
      return sendError(res, 'Name or email is required');
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (email) {
      // Check if email is already taken by another user
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, authUser.userId]
      );

      if ((existingUsers as any[]).length > 0) {
        return sendError(res, 'Email already in use', 400);
      }

      updates.push('email = ?');
      values.push(email);
    }

    values.push(authUser.userId);

    // Update user
    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated user
    const [users] = await pool.execute(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [authUser.userId]
    );

    const userArray = users as User[];
    if (userArray.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, { user: userArray[0] });
  } catch (error) {
    return handleError(res, error);
  }
}
