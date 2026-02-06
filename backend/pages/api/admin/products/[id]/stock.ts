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

    // PATCH - Adjust stock
    if (req.method === 'PATCH') {
      const { adjustment } = req.body;

      if (typeof adjustment !== 'number') {
        return sendError(res, 'Adjustment must be a number');
      }

      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        // Update product stock
        const [result] = await connection.execute(
          `UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [adjustment, id]
        );

        if ((result as any).affectedRows === 0) {
          await connection.rollback();
          return sendError(res, 'Product not found', 404);
        }

        // Get the updated stock value
        const [rows] = await connection.execute(
          'SELECT stock FROM products WHERE id = ?',
          [id]
        );

        await connection.commit();

        const newStock = (rows as any[])[0]?.stock;

        return sendSuccess(res, { 
          message: 'Stock adjusted successfully',
          newStock,
          adjustment
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }

    return sendError(res, 'Method not allowed', 405);
  } catch (error) {
    return handleError(res, error);
  }
}
