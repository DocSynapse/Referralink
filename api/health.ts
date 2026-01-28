// Simple health check endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      nodeVersion: process.version
    }
  });
}
