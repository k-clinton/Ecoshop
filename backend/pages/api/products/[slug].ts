import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { sendSuccess, sendError, handleError } from '@/lib/utils';
import { Product } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const [rows] = await pool.execute(
        `SELECT p.id, p.name, p.slug, p.description, p.price, p.compare_at_price as compareAtPrice,
                p.category, p.featured, p.rating, p.review_count as reviewCount, p.stock,
                p.created_at as createdAt
         FROM products p
         WHERE p.slug = ?`,
        [slug]
      );

      const products = rows as any[];
      if (products.length === 0) {
        return sendError(res, 'Product not found', 404);
      }

      const product = products[0];

      // Get images
      const [images] = await pool.execute(
        'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order',
        [product.id]
      );
      product.images = (images as any[]).map(img => img.image_url);

      // Get tags
      const [tags] = await pool.execute(
        'SELECT tag FROM product_tags WHERE product_id = ?',
        [product.id]
      );
      product.tags = (tags as any[]).map(tag => tag.tag);

      // Get variants
      const [variants] = await pool.execute(
        'SELECT id, name, sku, price, stock, available FROM product_variants WHERE product_id = ?',
        [product.id]
      );
      product.variants = variants;

      return sendSuccess(res, product);
    } catch (error) {
      return handleError(res, error);
    }
  } else {
    return sendError(res, 'Method not allowed', 405);
  }
}
