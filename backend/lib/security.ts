import { NextApiRequest, NextApiResponse } from 'next';
import helmet from 'helmet';
import { setCorsHeaders } from './cors';

// Simple wrapper for helmet as Next.js middleware
export function securityHeaders(handler: Function) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        // Set CORS headers early so even error responses have them
        setCorsHeaders(req, res);

        // Handle OPTIONS preflight early
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Run helmet
        await new Promise((resolve, reject) => {
            helmet({
                contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
            })(req as any, res as any, (err: any) => {
                if (err) return reject(err);
                resolve(true);
            });
        });

        return handler(req, res);
    };
}

// Simple in-memory rate limiter
const counts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(limit: number, windowMs: number) {
    return (handler: Function) => {
        return async (req: NextApiRequest, res: NextApiResponse) => {
            // Bypass rate limit for OPTIONS requests
            if (req.method === 'OPTIONS') {
                return handler(req, res);
            }

            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous';
            const key = `${req.url}:${ip}`;
            const now = Date.now();

            let record = counts.get(key as string);

            if (!record || now > record.resetTime) {
                record = { count: 0, resetTime: now + windowMs };
            }

            record.count++;
            counts.set(key as string, record);

            if (record.count > limit) {
                return res.status(429).json({
                    success: false,
                    error: 'Too many requests, please try again later.'
                });
            }

            return handler(req, res);
        };
    };
}
