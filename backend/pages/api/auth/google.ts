import type { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';
import pool from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { sendSuccess, sendError, handleError, generateId } from '@/lib/utils';
import { handleCors } from '@/lib/cors';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { credential } = req.body;

    if (!credential) {
      return sendError(res, 'Google credential is required');
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return sendError(res, 'Invalid Google token', 400);
    }

    const { sub: googleId, email, name, email_verified } = payload;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id, email, name, role, oauth_provider, oauth_id FROM users WHERE email = ?',
      [email]
    );

    const userArray = existingUsers as any[];
    let user;

    if (userArray.length > 0) {
      user = userArray[0];
      
      // If user exists but not with OAuth, return error
      if (!user.oauth_provider) {
        return sendError(res, 'An account with this email already exists. Please sign in with email and password.', 400);
      }

      // Update last activity
      await pool.execute(
        'UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );
    } else {
      // Create new user with Google OAuth
      const userId = generateId();
      await pool.execute(
        'INSERT INTO users (id, email, name, role, email_verified, oauth_provider, oauth_id, last_activity) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [userId, email, name || 'User', 'customer', email_verified || true, 'google', googleId]
      );

      user = {
        id: userId,
        email,
        name: name || 'User',
        role: 'customer'
      };
    }

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
    console.error('Google auth error:', error);
    return handleError(res, error);
  }
}
