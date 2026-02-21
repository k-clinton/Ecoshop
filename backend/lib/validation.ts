import { z } from 'zod';
import { NextApiRequest, NextApiResponse } from 'next';

export function validate(schema: z.ZodSchema) {
    return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any> | any) => {
        return async (req: NextApiRequest, res: NextApiResponse) => {
            try {
                const data = req.method === 'GET' ? req.query : req.body;
                const validatedData = await schema.parseAsync(data);

                // Replace req.body or req.query with validated data
                if (req.method === 'GET') {
                    req.query = validatedData as any;
                } else {
                    req.body = validatedData;
                }

                return handler(req, res);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const issues = error.issues.map(issue => ({
                        path: issue.path.join('.'),
                        message: issue.message
                    }));
                    return res.status(400).json({
                        success: false,
                        error: 'Validation failed',
                        issues
                    });
                }
                throw error;
            }
        };
    };
}
