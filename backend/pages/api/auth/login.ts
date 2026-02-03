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
      'SELECT id, email, password, name, role FROM users WHERE email = ?',
      [email]
    );

    const userArray = users as DBUser[];
    if (userArray.length === 0) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const user = userArray[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

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
