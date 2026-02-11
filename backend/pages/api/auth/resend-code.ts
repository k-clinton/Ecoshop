import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { sendSuccess, sendError, handleError } from '@/lib/utils';
import { handleCors } from '@/lib/cors';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 'Email is required');
    }

    // First, check if there's a pending registration
    const [pendingRegs] = await pool.execute(
      'SELECT id, name, email FROM pending_registrations WHERE email = ?',
      [email]
    );

    const pendingArray = pendingRegs as any[];
    
    if (pendingArray.length > 0) {
      // This is a pending registration - update the verification code
      const pending = pendingArray[0];

      // Generate new verification code
      const verificationCode = generateVerificationCode();
      const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Update the pending registration with new code
      await pool.execute(
        'UPDATE pending_registrations SET verification_code = ?, code_expires_at = ? WHERE id = ?',
        [verificationCode, codeExpiresAt, pending.id]
      );

      // Send verification email
      await sendVerificationEmail(email, verificationCode, pending.name);

      return sendSuccess(res, {
        message: 'Verification code sent successfully'
      });
    }

    // If not a pending registration, check for existing user
    const [users] = await pool.execute(
      'SELECT id, name, email_verified FROM users WHERE email = ?',
      [email]
    );

    const userArray = users as any[];
    if (userArray.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    const user = userArray[0];

    if (user.email_verified) {
      return sendError(res, 'Email is already verified', 400);
    }

    // Delete old verification codes
    await pool.execute(
      'DELETE FROM email_verification_codes WHERE user_id = ?',
      [user.id]
    );

    // Generate and store new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await pool.execute(
      'INSERT INTO email_verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)',
      [user.id, verificationCode, expiresAt]
    );

    // Send verification email
    await sendVerificationEmail(email, verificationCode, user.name);

    return sendSuccess(res, {
      message: 'Verification code sent successfully'
    });
  } catch (error) {
    return handleError(res, error);
  }
}
