import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';
import { User } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const authUser = requireAuth(req);

    // Get user details
    const [users] = await pool.execute(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [authUser.userId]
    );

    const userArray = users as User[];
    if (userArray.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, userArray[0]);
  } catch (error) {
    return handleError(res, error);
  }
}
