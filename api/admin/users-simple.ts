// SIMPLIFIED VERSION - Minimal auth, direct query
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Content-Type', 'application/json');

  // Simple auth check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Auth required' }
    });
  }

  const token = authHeader.substring(7);
  if (token !== 'simple-admin-session') {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid token' }
    });
  }

  // Query database
  try {
    console.log('=== DATABASE CONNECTION ATTEMPT ===');
    console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);

    if (!process.env.POSTGRES_URL) {
      console.error('POSTGRES_URL is not set!');
      return res.status(500).json({
        success: false,
        error: { code: 'NO_DB', message: 'Database not configured' }
      });
    }

    console.log('POSTGRES_URL format check:', process.env.POSTGRES_URL.substring(0, 30) + '...');
    console.log('Initializing Neon client...');

    const sql = neon(process.env.POSTGRES_URL);

    console.log('Executing query...');
    const rows = await sql`SELECT * FROM medical_professionals ORDER BY created_at DESC LIMIT 10`;

    console.log('Query successful! Rows returned:', rows.length);

    const users = rows.map(row => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      licenseType: row.license_type,
      licenseNumber: row.license_number,
      institutionName: row.institution_name,
      phoneNumber: row.phone_number,
      role: row.role,
      emailVerified: row.email_verified,
      licenseVerified: row.license_verified,
      registrationStatus: row.registration_status,
      onboardingCompleted: row.onboarding_completed,
      createdAt: row.created_at
    }));

    return res.status(200).json({
      success: true,
      data: { users }
    });

  } catch (error: any) {
    console.error('=== DATABASE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);

    // Check for common database errors
    let userMessage = error.message;
    let errorCode = 'DB_ERROR';

    if (error.message?.includes('password authentication failed')) {
      errorCode = 'AUTH_FAILED';
      userMessage = 'Database authentication failed - check POSTGRES_URL password';
    } else if (error.message?.includes('does not exist')) {
      errorCode = 'TABLE_NOT_FOUND';
      userMessage = 'Database table not found - schema not uploaded?';
    } else if (error.message?.includes('connection')) {
      errorCode = 'CONNECTION_ERROR';
      userMessage = 'Cannot connect to database - check POSTGRES_URL';
    }

    return res.status(500).json({
      success: false,
      error: {
        code: errorCode,
        message: userMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
}
