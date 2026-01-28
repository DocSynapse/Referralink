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
    if (!process.env.POSTGRES_URL) {
      return res.status(500).json({
        success: false,
        error: { code: 'NO_DB', message: 'Database not configured' }
      });
    }

    const sql = neon(process.env.POSTGRES_URL);
    const rows = await sql`SELECT * FROM medical_professionals ORDER BY created_at DESC LIMIT 10`;

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
    return res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: error.message }
    });
  }
}
