import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  try {
    requireAdmin(req);
    const { id } = req.query;

    // PUT - Update product
    if (req.method === 'PUT') {
      const {
        name, slug, description, price, compareAtPrice, category,
        featured, rating, reviewCount, stock
      } = req.body;

      const [result] = await pool.execute(
        `UPDATE products SET name = ?, slug = ?, description = ?, price = ?, 
                compare_at_price = ?, category = ?, featured = ?, rating = ?,
                review_count = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          name, slug, description, price, compareAtPrice || null, category,
          featured, rating, reviewCount, stock, id
        ]
      );

      if ((result as any).affectedRows === 0) {
        return sendError(res, 'Product not found', 404);
      }

      return sendSuccess(res, { message: 'Product updated successfully' });
    }

    // DELETE - Delete product
    if (req.method === 'DELETE') {
      const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);

      if ((result as any).affectedRows === 0) {
        return sendError(res, 'Product not found', 404);
      }

      return sendSuccess(res, { message: 'Product deleted successfully' });
    }

    return sendError(res, 'Method not allowed', 405);
  } catch (error) {
    return handleError(res, error);
  }
}
