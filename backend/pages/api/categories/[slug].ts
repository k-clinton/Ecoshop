import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { sendSuccess, sendError, handleError } from '@/lib/utils';
import { Category } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { slug } = req.query;

    const [rows] = await pool.execute(
      'SELECT id, name, slug, image, description FROM categories WHERE slug = ?',
      [slug]
    );

    const categories = rows as Category[];
    if (categories.length === 0) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, categories[0]);
  } catch (error) {
    return handleError(res, error);
  }
}
