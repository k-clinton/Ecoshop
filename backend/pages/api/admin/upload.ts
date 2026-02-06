import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { handleCors } from '@/lib/cors';
import { requireAdmin } from '@/lib/auth';
import { sendSuccess, sendError, handleError } from '@/lib/utils';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (handleCors(req, res)) return;

    if (req.method !== 'POST') {
        return sendError(res, 'Method not allowed', 405);
    }

    try {
        const authUser = requireAdmin(req);

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = new IncomingForm({
            uploadDir,
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            filename: (name, ext, part, form) => {
                const timestamp = Date.now();
                const safeName = part.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, '') || 'upload';
                return `${timestamp}-${safeName}`;
            }
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Upload error:', err);
                return handleError(res, err);
            }

            const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

            if (!uploadedFile) {
                return sendError(res, 'No file uploaded', 400);
            }

            // Return the public URL
            const publicUrl = `/uploads/${uploadedFile.newFilename}`;

            return sendSuccess(res, { url: publicUrl });
        });
    } catch (error) {
        return handleError(res, error);
    }
}
