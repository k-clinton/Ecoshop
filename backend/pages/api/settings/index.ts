import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { handleCors } from '@/lib/cors';
import { requireAdmin } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (handleCors(req, res)) return;

    try {
        if (req.method === 'GET') {
            // Allow anyone to read settings (public info)
            const [rows] = await pool.execute('SELECT * FROM settings WHERE id = "default"');
            const settings = (rows as any[])[0];

            if (!settings) {
                // Should not happen if seeded, but handle gracefully
                return sendSuccess(res, {
                    site_name: 'EcoShop',
                    support_email: 'support@ecoshop.com',
                    currency: 'USD',
                    exchange_rate: 1.0000,
                    shipping_fee: 5.99,
                    free_shipping_threshold: 50.00,
                    maintenance_mode: 0
                });
            }

            // Convert maintenance_mode to boolean
            return sendSuccess(res, {
                ...settings,
                maintenance_mode: !!settings.maintenance_mode,
                exchange_rate: parseFloat(settings.exchange_rate),
                shipping_fee: parseFloat(settings.shipping_fee),
                free_shipping_threshold: parseFloat(settings.free_shipping_threshold)
            });
        }

        if (req.method === 'PUT') {
            // Only admin can update settings
            requireAdmin(req);

            const {
                site_name,
                support_email,
                currency,
                exchange_rate,
                shipping_fee,
                free_shipping_threshold,
                maintenance_mode
            } = req.body;

            await pool.execute(
                `UPDATE settings SET 
         site_name = ?, 
         support_email = ?, 
         currency = ?, 
         exchange_rate = ?,
         shipping_fee = ?, 
         free_shipping_threshold = ?, 
         maintenance_mode = ? 
         WHERE id = "default"`,
                [
                    site_name,
                    support_email,
                    currency,
                    exchange_rate,
                    shipping_fee,
                    free_shipping_threshold,
                    maintenance_mode
                ]
            );

            return sendSuccess(res, { message: 'Settings updated successfully' });
        }

        return sendError(res, 'Method not allowed', 405);
    } catch (error) {
        return handleError(res, error);
    }
}
