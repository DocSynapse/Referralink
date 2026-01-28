// API Route: /api/auth/verify-email
// Step 2a: Email Verification (Gate 2: Integrity Check)

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ApiResponse } from '../types/registration';

import { verifyEmailWithToken, findUserById, logAuditEvent } from '../utils/db';
import { verifyMedicalLicense } from '../services/licenseVerification';
import { updateLicenseVerification } from '../utils/db';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse<ApiResponse>
) {

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST/GET requests are allowed'
      }
    });
  }

  try {
    const token = req.method === 'POST' ? req.body.token : req.query.token as string;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOKEN_REQUIRED',
          message: 'Token verifikasi diperlukan'
        }
      });
    }

    // Verify email with token
    const verified = await verifyEmailWithToken(token);

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token tidak valid atau sudah kadaluarsa'
        }
      });
    }

    const clientIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';

    // Log audit event
    await logAuditEvent(
      null,
      'EMAIL_VERIFIED',
      'email_verification',
      null,
      { token: token.substring(0, 8) + '...' },
      clientIp,
      req.headers['user-agent']
    );

    return res.status(200).json({
      success: true,
      data: {
        message: 'Email berhasil diverifikasi',
        nextStep: 'verify_license'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Email verification error:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan saat verifikasi email'
      }
    });
  }
}
