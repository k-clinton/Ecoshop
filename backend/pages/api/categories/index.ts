import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { sendSuccess, sendError, handleError } from '@/lib/utils';
import { Category } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, name, slug, image, description FROM categories ORDER BY name ASC'
    );

    return sendSuccess(res, rows);
  } catch (error) {
    return handleError(res, error);
  }
}
