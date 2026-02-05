import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const authUser = requireAuth(req);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return sendError(res, 'New password must be at least 6 characters');
    }

    // Get user's current password hash
    const [users] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [authUser.userId]
    );

    const userArray = users as any[];
    if (userArray.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, userArray[0].password);
    if (!validPassword) {
      return sendError(res, 'Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, authUser.userId]
    );

    return sendSuccess(res, { message: 'Password updated successfully' });
  } catch (error) {
    return handleError(res, error);
  }
}
