import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendSuccess, sendError, handleError, generateId } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);

    // POST - Create new product
    if (req.method === 'POST') {
      const {
        name, slug, description, price, compareAtPrice, category,
        images, tags, variants, featured, rating, reviewCount, stock
      } = req.body;

      if (!name || !slug || !price || !category) {
        return sendError(res, 'Name, slug, price, and category are required');
      }

      const productId = generateId();
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        // Insert product
        await connection.execute(
          `INSERT INTO products (id, name, slug, description, price, compare_at_price, category,
                                 featured, rating, review_count, stock, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            productId, name, slug, description, price, compareAtPrice || null,
            category, featured || false, rating || 0, reviewCount || 0, stock || 0
          ]
        );

        // Insert images
        if (images && Array.isArray(images)) {
          for (let i = 0; i < images.length; i++) {
            await connection.execute(
              'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
              [productId, images[i], i]
            );
          }
        }

        // Insert tags
        if (tags && Array.isArray(tags)) {
          for (const tag of tags) {
            await connection.execute(
              'INSERT INTO product_tags (product_id, tag) VALUES (?, ?)',
              [productId, tag]
            );
          }
        }

        // Insert variants
        if (variants && Array.isArray(variants)) {
          for (const variant of variants) {
            const variantId = variant.id || generateId();
            await connection.execute(
              `INSERT INTO product_variants (id, product_id, name, sku, price, stock, available)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                variantId, productId, variant.name, variant.sku,
                variant.price, variant.stock, variant.available
              ]
            );
          }
        }

        await connection.commit();

        return sendSuccess(res, { id: productId, message: 'Product created successfully' }, 201);
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
