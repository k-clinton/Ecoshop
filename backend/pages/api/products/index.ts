import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { sendSuccess, sendError, handleError } from '@/lib/utils';
import { Product } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { category, featured, search, minPrice, maxPrice, sort, tags, inStock, limit = '50', offset = '0' } = req.query;

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

    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(parseFloat(minPrice as string));
    }

    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(maxPrice as string));
    }

    if (tags) {
      const tagList = (tags as string).split(',');
      query += ` AND p.id IN (SELECT product_id FROM product_tags WHERE tag IN (${tagList.map(() => '?').join(',')}))`;
      params.push(...tagList);
    }

    if (inStock === 'true') {
      query += ' AND p.stock > 0';
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'rating':
        query += ' ORDER BY p.rating DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY p.created_at DESC';
    }

    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    query += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;

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
      product.variants = (variants as any[]).map(v => ({
        ...v,
        available: Boolean(v.available)
      }));
    }

    return sendSuccess(res, products);
  } catch (error) {
    return handleError(res, error);
  }
}
