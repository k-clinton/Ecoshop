import type { NextApiRequest, NextApiResponse } from 'next';
import { sendSuccess } from '@/lib/utils';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return sendSuccess(res, {
        message: 'EcoShop API is running',
        version: '1.0.0',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
}
