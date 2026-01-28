// API Route: /api/admin/users
// Admin endpoint untuk manage medical professionals

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import type { ApiResponse, MedicalProfessional } from '../types/registration';
import { validateSession, findUserById } from '../utils/db';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse<ApiResponse<{ users: MedicalProfessional[] }>>
) {

  // Verify admin authentication
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  const sessionToken = authHeader.substring(7);

  // Check for legacy simple admin token
  const isSimpleAdmin = sessionToken === 'simple-admin-session';

  if (!isSimpleAdmin) {
    // Validate session token
    const userId = await validateSession(sessionToken);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SESSION',
          message: 'Invalid or expired session'
        }
      });
    }

    // Verify user is admin
    const user = await findUserById(userId);

    if (!user || (user.role !== 'admin_user' && user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });
    }
  }

  // Handle GET request - List users
  if (req.method === 'GET') {
    try {
      const { status } = req.query;

      let query;

      if (status === 'pending') {
        query = sql`
          SELECT
            id, email, full_name, license_type, license_number,
            institution_name, phone_number, role,
            email_verified, license_verified, background_check_status,
            onboarding_completed, registration_status, created_at, last_login
          FROM medical_professionals
          WHERE email_verified = FALSE OR license_verified = FALSE
          ORDER BY created_at DESC
        `;
      } else if (status === 'verified') {
        query = sql`
          SELECT
            id, email, full_name, license_type, license_number,
            institution_name, phone_number, role,
            email_verified, license_verified, background_check_status,
            onboarding_completed, registration_status, created_at, last_login
          FROM medical_professionals
          WHERE email_verified = TRUE
            AND license_verified = TRUE
            AND onboarding_completed = FALSE
          ORDER BY created_at DESC
        `;
      } else if (status === 'active') {
        query = sql`
          SELECT
            id, email, full_name, license_type, license_number,
            institution_name, phone_number, role,
            email_verified, license_verified, background_check_status,
            onboarding_completed, registration_status, created_at, last_login
          FROM medical_professionals
          WHERE onboarding_completed = TRUE
          ORDER BY created_at DESC
        `;
      } else {
        // All users
        query = sql`
          SELECT
            id, email, full_name, license_type, license_number,
            institution_name, phone_number, role,
            email_verified, license_verified, background_check_status,
            onboarding_completed, registration_status, created_at, last_login
          FROM medical_professionals
          ORDER BY created_at DESC
        `;
      }

      const result = await query;

      // Map to MedicalProfessional type
      const users = result.rows.map(row => ({
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
        backgroundCheckStatus: row.background_check_status,
        onboardingCompleted: row.onboarding_completed,
        registrationStatus: row.registration_status,
        termsAccepted: row.terms_accepted,
        hipaaAcknowledged: row.hipaa_acknowledged,
        createdAt: row.created_at,
        lastLogin: row.last_login
      }));

      return res.status(200).json({
        success: true,
        data: { users },
        meta: {
          timestamp: new Date().toISOString(),
          count: users.length
        }
      });

    } catch (error: any) {
      console.error('Admin users fetch error:', error);

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch users'
        }
      });
    }
  }

  // Handle POST request - Update user status (optional feature)
  if (req.method === 'POST') {
    try {
      const { userId, action } = req.body;

      if (!userId || !action) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'userId and action are required'
          }
        });
      }

      // Actions: approve_license, suspend, activate, delete
      switch (action) {
        case 'approve_license':
          await sql`
            UPDATE medical_professionals
            SET
              license_verified = TRUE,
              license_verification_source = 'ADMIN_MANUAL_APPROVAL',
              license_verified_at = NOW()
            WHERE id = ${userId}
          `;
          break;

        case 'suspend':
          await sql`
            UPDATE medical_professionals
            SET registration_status = 'suspended'
            WHERE id = ${userId}
          `;
          break;

        case 'activate':
          await sql`
            UPDATE medical_professionals
            SET registration_status = 'active'
            WHERE id = ${userId}
          `;
          break;

        case 'delete':
          await sql`
            DELETE FROM medical_professionals
            WHERE id = ${userId}
          `;
          break;

        default:
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_ACTION',
              message: 'Invalid action specified'
            }
          });
      }

      return res.status(200).json({
        success: true,
        data: { message: `User ${action} successful` },
        meta: {
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('Admin action error:', error);

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to perform action'
        }
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Only GET and POST methods are allowed'
    }
  });
}
