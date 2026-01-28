// API Route: /api/auth/login
// User Login with email and password

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ApiResponse, LoginResponse } from '../_types/registration';

import {
  verifyPassword,
  generateSessionToken,
  checkRateLimit
} from '../_utils/auth';

import {
  findUserByEmailWithPassword,
  createSession,
  updateLastLogin,
  logAuditEvent
} from '../_utils/db';

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email dan password diperlukan'
        }
      });
    }

    // Rate limiting: 5 login attempts per IP per 15 minutes
    const clientIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';

    if (!checkRateLimit(`login:${clientIp}`, 5, 900000)) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.'
        }
      });
    }

    // Find user by email (with password hash for verification)
    const user = await findUserByEmailWithPassword(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email atau password salah'
        }
      });
    }

    // Verify password
    const isValidPassword = verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      await logAuditEvent(
        user.id,
        'LOGIN_FAILED',
        'authentication',
        user.id,
        { reason: 'invalid_password' },
        clientIp,
        req.headers['user-agent']
      );

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email atau password salah'
        }
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Silakan verifikasi email Anda terlebih dahulu'
        }
      });
    }

    // Check registration status
    if (user.registrationStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Akun Anda telah ditangguhkan. Hubungi administrator.'
        }
      });
    }

    if (user.registrationStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_REJECTED',
          message: 'Registrasi Anda ditolak. Hubungi administrator untuk informasi lebih lanjut.'
        }
      });
    }

    // Generate session token
    const sessionToken = generateSessionToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create session
    await createSession(
      user.id,
      sessionToken,
      expiresAt,
      clientIp,
      req.headers['user-agent'] as string
    );

    // Update last login
    await updateLastLogin(user.id);

    // Log successful login
    await logAuditEvent(
      user.id,
      'LOGIN_SUCCESS',
      'authentication',
      user.id,
      null,
      clientIp,
      req.headers['user-agent']
    );

    // Remove sensitive data
    const { apiKey, ...userWithoutApiKey } = user;

    return res.status(200).json({
      success: true,
      data: {
        user: userWithoutApiKey as any,
        sessionToken,
        expiresAt: expiresAt.toISOString(),
        requiresOnboarding: !user.onboardingCompleted
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan saat login'
      }
    });
  }
}
