// MINIMAL DATABASE TEST
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Step 1: Check env var exists
    if (!process.env.POSTGRES_URL) {
      return res.status(500).json({
        error: 'POSTGRES_URL not set',
        envKeys: Object.keys(process.env).filter(k => k.includes('POSTGRES') || k.includes('DATABASE'))
      });
    }

    // Step 2: Try to import neon
    const { neon } = await import('@neondatabase/serverless');

    // Step 3: Try to create client
    const sql = neon(process.env.POSTGRES_URL);

    // Step 4: Try simple query
    const result = await sql`SELECT 1 as test`;

    return res.status(200).json({
      success: true,
      test: result[0],
      message: 'Database connection works!'
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    });
  }
}
