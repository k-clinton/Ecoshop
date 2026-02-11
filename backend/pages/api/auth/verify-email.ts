import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { sendSuccess, sendError, handleError, generateId } from '@/lib/utils';
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

    // First, check if this is a pending registration
    const [pendingRegs] = await pool.execute(
      'SELECT * FROM pending_registrations WHERE id = ? AND verification_code = ?',
      [userId, code]
    );

    const pendingArray = pendingRegs as any[];
    
    if (pendingArray.length > 0) {
      // This is a new registration - create the user
      const pending = pendingArray[0];

      // Check if code is expired
      if (new Date() > new Date(pending.code_expires_at)) {
        return sendError(res, 'Verification code has expired', 400);
      }

      // Create the actual user account
      const newUserId = generateId();
      await pool.execute(
        'INSERT INTO users (id, email, password, name, role, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
        [newUserId, pending.email, pending.password, pending.name, pending.role, true]
      );

      // Delete the pending registration
      await pool.execute(
        'DELETE FROM pending_registrations WHERE id = ?',
        [userId]
      );

      // Generate token with 15-minute expiry
      const token = generateToken({
        userId: newUserId,
        email: pending.email,
        role: pending.role
      }, '15m');

      return sendSuccess(res, {
        token,
        user: {
          id: newUserId,
          email: pending.email,
          name: pending.name,
          role: pending.role
        }
      });
    }

    // If not a pending registration, check if it's an existing user verification code
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
