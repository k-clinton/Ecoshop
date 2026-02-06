import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { sendSuccess, sendError, handleError, generateId } from '@/lib/utils';
import { handleCors } from '@/lib/cors';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/email';

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

    // Create user (not verified yet)
    const userId = generateId();
    // Determine role (check if email matches admin email in env)
    const isAdmin = process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    const role = isAdmin ? 'admin' : 'customer';

    await pool.execute(
      'INSERT INTO users (id, email, password, name, role, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, role, false]
    );

    // Generate and store verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await pool.execute(
      'INSERT INTO email_verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)',
      [userId, verificationCode, expiresAt]
    );

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode, name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - user can request a new code
    }

    return sendSuccess(res, {
      message: 'Registration successful. Please check your email for verification code.',
      userId,
      email,
      requiresVerification: true
    }, 201);
  } catch (error) {
    return handleError(res, error);
  }
}
