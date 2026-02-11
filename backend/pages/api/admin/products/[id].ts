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
        featured, rating, reviewCount, stock, images, tags, variants
      } = req.body;

      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        // Update product
        const [result] = await connection.execute(
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
          await connection.rollback();
          connection.release();
          return sendError(res, 'Product not found', 404);
        }

        // Update images - delete old ones and insert new ones
        if (images && Array.isArray(images)) {
          await connection.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
          for (let i = 0; i < images.length; i++) {
            await connection.execute(
              'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
              [id, images[i], i]
            );
          }
        }

        // Update tags - delete old ones and insert new ones
        if (tags && Array.isArray(tags)) {
          await connection.execute('DELETE FROM product_tags WHERE product_id = ?', [id]);
          for (const tag of tags) {
            await connection.execute(
              'INSERT INTO product_tags (product_id, tag) VALUES (?, ?)',
              [id, tag]
            );
          }
        }

        // Update variants - delete old ones and insert new ones
        if (variants && Array.isArray(variants)) {
          await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [id]);
          for (const variant of variants) {
            const variantId = variant.id || require('@/lib/utils').generateId();
            await connection.execute(
              `INSERT INTO product_variants (id, product_id, name, sku, price, stock, available)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                variantId, id, variant.name, variant.sku,
                variant.price, variant.stock, variant.available
              ]
            );
          }
        }

        await connection.commit();
        connection.release();

        return sendSuccess(res, { message: 'Product updated successfully' });
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
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
