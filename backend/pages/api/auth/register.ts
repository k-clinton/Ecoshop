import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { sendSuccess, sendError, handleError, generateId } from '@/lib/utils';
import { handleCors } from '@/lib/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return sendError(res, 'Email, password, and name are required');
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      return sendError(res, 'User already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = generateId();
    await pool.execute(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, 'customer']
    );

    // Generate token
    const token = generateToken({ userId, email, role: 'customer' });

    return sendSuccess(res, {
      token,
      user: {
        id: userId,
        email,
        name,
        role: 'customer'
      }
    }, 201);
  } catch (error) {
    return handleError(res, error);
  }
}
