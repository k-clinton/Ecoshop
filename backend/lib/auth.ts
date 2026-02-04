import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload, expiresIn: string = '10m'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    // Check if token is expired (10 minute session timeout)
    if (decoded.iat && decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (now > decoded.exp) {
        return null;
      }
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

export function refreshToken(payload: JWTPayload): string {
  // Generate new token with 10 minute expiry for session extension
  return generateToken(payload, '10m');
}

export function getAuthUser(req: NextApiRequest): JWTPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export function requireAuth(req: NextApiRequest): JWTPayload {
  const user = getAuthUser(req);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export function requireAdmin(req: NextApiRequest): JWTPayload {
  const user = requireAuth(req);
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}
