import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { getAuthUser, refreshToken } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';
import { handleCors } from '@/lib/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    // Get current user from token
    const user = getAuthUser(req);
    
    if (!user) {
      return sendError(res, 'Unauthorized', 401);
    }

    // Update last activity
    await pool.execute(
      'UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = ?',
      [user.userId]
    );

    // Generate new token with extended expiry
    const newToken = refreshToken({
      userId: user.userId,
      email: user.email,
      role: user.role
    });

    return sendSuccess(res, {
      token: newToken
    });
  } catch (error) {
    return handleError(res, error);
  }
}
