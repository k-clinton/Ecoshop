import type { NextApiRequest, NextApiResponse } from 'next';

export function handleCors(req: NextApiRequest, res: NextApiResponse): boolean {
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
