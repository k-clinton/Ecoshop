import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendSuccess, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (handleCors(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        requireAdmin(req);

        const { limit = '50', offset = '0' } = req.query;

        const [rows] = await pool.execute(
            `SELECT al.id, al.action, al.entity_type as entityType, al.entity_id as entityId, 
              al.details, al.ip_address as ipAddress, al.created_at as createdAt,
              u.name as userName, u.email as userEmail
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
            [String(limit), String(offset)]
        );

        return sendSuccess(res, rows);
    } catch (error) {
        return handleError(res, error);
    }
}
