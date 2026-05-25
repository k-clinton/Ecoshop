import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCors } from '@/lib/cors';
import pool from '@/lib/db';
import { requireAdmin, getAuthUser } from '@/lib/auth';
import { sendSuccess, sendError, handleError, generateId } from '@/lib/utils';
import { logActivity } from '@/lib/activity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  try {
    requireAdmin(req);

    // GET - List all products (admin view)
    if (req.method === 'GET') {
      const [rows] = await pool.execute(`
        SELECT p.id, p.name, p.slug, p.description, p.price, p.compare_at_price as compareAtPrice,
               p.category, p.featured, p.rating, p.review_count as reviewCount, p.stock,
               p.created_at as createdAt
        FROM products p
        ORDER BY p.created_at DESC
      `);
      const products = rows as any[];

      if (products.length > 0) {
        const productIds = products.map(p => p.id);
        const placeholders = productIds.map(() => '?').join(',');

        // Get images
        const [allImages] = await pool.execute(
          `SELECT product_id as productId, image_url FROM product_images WHERE product_id IN (${placeholders}) ORDER BY sort_order`,
          productIds
        );
        const imagesMap = (allImages as any[]).reduce((acc, img) => {
          if (!acc[img.productId]) acc[img.productId] = [];
          acc[img.productId].push(img.image_url);
          return acc;
        }, {});

        // Get tags
        const [allTags] = await pool.execute(
          `SELECT product_id as productId, tag FROM product_tags WHERE product_id IN (${placeholders})`,
          productIds
        );
        const tagsMap = (allTags as any[]).reduce((acc, t) => {
          if (!acc[t.productId]) acc[t.productId] = [];
          acc[t.productId].push(t.tag);
          return acc;
        }, {});

        // Get variants
        const [allVariants] = await pool.execute(
          `SELECT id, product_id as productId, name, sku, price, stock, available FROM product_variants WHERE product_id IN (${placeholders})`,
          productIds
        );
        const variantsMap = (allVariants as any[]).reduce((acc, v) => {
          if (!acc[v.productId]) acc[v.productId] = [];
          acc[v.productId].push(v);
          return acc;
        }, {});

        for (const product of products) {
          product.images = imagesMap[product.id] || [];
          product.tags = tagsMap[product.id] || [];
          product.variants = variantsMap[product.id] || [];
        }
      }

      return sendSuccess(res, products);
    }

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

        // Log the activity
        const adminUser = getAuthUser(req);
        if (adminUser) {
          await logActivity(
            adminUser.userId,
            'CREATE_PRODUCT',
            'product',
            productId,
            { name, category, price },
            req.socket.remoteAddress
          );
        }

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
