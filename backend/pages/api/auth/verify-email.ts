import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';
import { handleCors } from '@/lib/cors';
import { DBUser } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return sendError(res, 'User ID and verification code are required');
    }

    // Find verification code
    const [codes] = await pool.execute(
      'SELECT * FROM email_verification_codes WHERE user_id = ? AND code = ? ORDER BY created_at DESC LIMIT 1',
      [userId, code]
    );

    const codeArray = codes as any[];
    if (codeArray.length === 0) {
      return sendError(res, 'Invalid verification code', 400);
    }

    const verificationRecord = codeArray[0];

    // Check if code is expired
    if (new Date() > new Date(verificationRecord.expires_at)) {
      return sendError(res, 'Verification code has expired', 400);
    }

    // Get user details
    const [users] = await pool.execute(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [userId]
    );

    const userArray = users as DBUser[];
    if (userArray.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    const user = userArray[0];

    // Update user as verified
    await pool.execute(
      'UPDATE users SET email_verified = ? WHERE id = ?',
      [true, userId]
    );

    // Delete used verification code
    await pool.execute(
      'DELETE FROM email_verification_codes WHERE user_id = ?',
      [userId]
    );

    // Generate token with 10-minute expiry
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    }, '10m');

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
