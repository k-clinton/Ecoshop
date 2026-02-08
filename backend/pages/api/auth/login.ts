import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';
import { DBUser } from '@/lib/types';
import { handleCors } from '@/lib/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required');
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, password, name, role, email_verified, oauth_provider FROM users WHERE email = ?',
      [email]
    );

    const userArray = users as any[];
    if (userArray.length === 0) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const user = userArray[0];

    // Verify password (only if password is set)
    if (!user.password) {
      return sendError(res, `This account was created with ${user.oauth_provider || 'OAuth'}. Please sign in with ${user.oauth_provider || 'your OAuth provider'}, or contact support to set a password.`, 400);
    }
    
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Check email verification
    if (!user.email_verified) {
      return sendError(res, 'Please verify your email before logging in', 403);
    }

    // Update last activity
    await pool.execute(
      'UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate token with 15-minute expiry
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    }, '15m');

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    return handleError(res, error);
  }
}
