import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { sendSuccess, sendError, handleError } from '@/lib/utils';
import { Product } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { category, featured, search, limit = '50', offset = '0' } = req.query;

    let query = `
      SELECT p.id, p.name, p.slug, p.description, p.price, p.compare_at_price as compareAtPrice,
             p.category, p.featured, p.rating, p.review_count as reviewCount, p.stock,
             p.created_at as createdAt
      FROM products p
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (featured === 'true') {
      query += ' AND p.featured = TRUE';
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const [rows] = await pool.execute(query, params);
    const products = rows as any[];

    // Fetch related data for each product
    for (const product of products) {
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
    }

    return sendSuccess(res, products);
  } catch (error) {
    return handleError(res, error);
  }
}
