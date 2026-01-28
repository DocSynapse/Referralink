// API Route: /api/auth/complete-onboarding
// Step 4: Complete Onboarding (Terms + HIPAA + API Key Generation)

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ApiResponse, OnboardingData } from '../../lib/api/types/registration';

import { generateApiKey } from '../../lib/api/utils/auth';
import {
  completeOnboarding,
  findUserById,
  validateSession,
  logAuditEvent
} from '../../lib/api/utils/db';
import { sendWelcomeEmail } from '../../lib/api/services/email';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST requests are allowed'
      }
    });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Session token diperlukan'
        }
      });
    }

    const sessionToken = authHeader.substring(7);
    const userId = await validateSession(sessionToken);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SESSION',
          message: 'Session tidak valid atau sudah kadaluarsa'
        }
      });
    }

    // Get user data
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User tidak ditemukan'
        }
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Email harus diverifikasi terlebih dahulu'
        }
      });
    }

    // Check if license is verified
    if (!user.licenseVerified) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'LICENSE_NOT_VERIFIED',
          message: 'Lisensi harus diverifikasi terlebih dahulu'
        }
      });
    }

    // Check if already completed onboarding
    if (user.onboardingCompleted) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_COMPLETED',
          message: 'Onboarding sudah diselesaikan'
        }
      });
    }

    // Validate terms acceptance
    const { termsAccepted, hipaaAcknowledged } = req.body;

    if (!termsAccepted || !hipaaAcknowledged) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TERMS_NOT_ACCEPTED',
          message: 'Anda harus menyetujui Terms of Service dan HIPAA acknowledgment'
        }
      });
    }

    // Generate API key
    const apiKey = generateApiKey();

    // Optional: Generate MCP token (if needed)
    const mcpToken = undefined; // TODO: Implement MCP token generation if needed

    // Complete onboarding
    await completeOnboarding(userId, apiKey, mcpToken);

    // Send welcome email
    await sendWelcomeEmail(
      user.email,
      user.fullName,
      user.role,
      apiKey
    );

    const clientIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';

    // Log audit event
    await logAuditEvent(
      userId,
      'ONBOARDING_COMPLETED',
      'medical_professional',
      userId,
      { role: user.role },
      clientIp,
      req.headers['user-agent']
    );

    return res.status(200).json({
      success: true,
      data: {
        termsAccepted: true,
        hipaaAcknowledged: true,
        apiKey,
        mcpToken
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Complete onboarding error:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan saat menyelesaikan onboarding'
      }
    });
  }
}
