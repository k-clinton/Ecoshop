import { NextApiResponse } from 'next';

export function sendSuccess(res: NextApiResponse, data: any, status = 200) {
  return res.status(status).json({
    success: true,
    data
  });
}

export function sendError(res: NextApiResponse, message: string, status = 400) {
  return res.status(status).json({
    success: false,
    error: message
  });
}

export function handleError(res: NextApiResponse, error: any) {
  console.error('API Error:', error);
  
  // Use statusCode from error if available
  if (error.statusCode) {
    return sendError(res, error.message, error.statusCode);
  }
  
  if (error.message === 'Unauthorized') {
    return sendError(res, 'Unauthorized', 401);
  }
  
  if (error.message?.startsWith('Forbidden')) {
    return sendError(res, error.message, 403);
  }
  
  return sendError(res, error.message || 'Internal server error', 500);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
