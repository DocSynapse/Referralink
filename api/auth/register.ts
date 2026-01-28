// API Route: /api/auth/register
// Step 1: Medical Professional Registration (Gate 3: Access Control)

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ApiResponse, RegistrationInput, RegistrationResponse } from '../_types/registration.js';

import {
  hashPassword,
  validatePassword,
  validateEmail,
  validatePhoneNumber,
  validateLicenseNumber,
  sanitizeInput,
  generateVerificationToken,
  checkRateLimit
} from '../_utils/auth.js';

import {
  createMedicalProfessional,
  findUserByEmail,
  findUserByLicenseNumber,
  logAuditEvent
} from '../_utils/db.js';

import { sendVerificationEmail } from '../_services/email.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {

  // Only allow POST
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
    // Rate limiting: 5 registration attempts per IP per 15 minutes
    const clientIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';

    if (!checkRateLimit(`register:${clientIp}`, 5, 900000)) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Terlalu banyak percobaan registrasi. Coba lagi dalam 15 menit.'
        }
      });
    }

    // Parse and validate input
    const input: RegistrationInput = req.body;

    // Validation errors
    const errors: any[] = [];

    // Validate email
    if (!input.email || !validateEmail(input.email)) {
      errors.push({
        field: 'email',
        message: 'Format email tidak valid',
        code: 'INVALID_EMAIL'
      });
    }

    // Validate full name
    if (!input.fullName || input.fullName.trim().length < 3) {
      errors.push({
        field: 'fullName',
        message: 'Nama lengkap minimal 3 karakter',
        code: 'INVALID_NAME'
      });
    }

    // Validate license type
    const validLicenseTypes = ['doctor', 'specialist', 'nurse', 'midwife', 'admin'];
    if (!input.licenseType || !validLicenseTypes.includes(input.licenseType)) {
      errors.push({
        field: 'licenseType',
        message: 'Tipe lisensi tidak valid',
        code: 'INVALID_LICENSE_TYPE'
      });
    }

    // Validate license number
    if (!input.licenseNumber || !validateLicenseNumber(input.licenseNumber, input.licenseType)) {
      errors.push({
        field: 'licenseNumber',
        message: `Format nomor lisensi ${input.licenseType} tidak valid`,
        code: 'INVALID_LICENSE_NUMBER'
      });
    }

    // Validate institution name
    if (!input.institutionName || input.institutionName.trim().length < 3) {
      errors.push({
        field: 'institutionName',
        message: 'Nama institusi minimal 3 karakter',
        code: 'INVALID_INSTITUTION'
      });
    }

    // Validate phone number
    if (!input.phoneNumber || !validatePhoneNumber(input.phoneNumber)) {
      errors.push({
        field: 'phoneNumber',
        message: 'Format nomor telepon Indonesia tidak valid (contoh: 08123456789)',
        code: 'INVALID_PHONE'
      });
    }

    // Validate password
    if (!input.password) {
      errors.push({
        field: 'password',
        message: 'Password wajib diisi',
        code: 'PASSWORD_REQUIRED'
      });
    } else {
      const passwordErrors = validatePassword(input.password);
      errors.push(...passwordErrors);
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input tidak valid',
          details: errors
        }
      });
    }

    // Check if email already exists
    const existingEmail = await findUserByEmail(input.email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email sudah terdaftar'
        }
      });
    }

    // Check if license number already exists
    const existingLicense = await findUserByLicenseNumber(input.licenseNumber);
    if (existingLicense) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'LICENSE_EXISTS',
          message: 'Nomor lisensi sudah terdaftar'
        }
      });
    }

    // Sanitize inputs
    const sanitizedInput = {
      email: input.email.toLowerCase().trim(),
      fullName: sanitizeInput(input.fullName.trim()),
      licenseType: input.licenseType.toLowerCase(),
      licenseNumber: sanitizeInput(input.licenseNumber.replace(/\s|-/g, '')),
      institutionName: sanitizeInput(input.institutionName.trim()),
      phoneNumber: input.phoneNumber.replace(/\s|-/g, ''),
      password: input.password
    };

    // Hash password
    const passwordHash = hashPassword(sanitizedInput.password);

    // Generate email verification token
    const emailVerificationToken = generateVerificationToken();

    // Create user in database
    const userId = await createMedicalProfessional({
      email: sanitizedInput.email,
      fullName: sanitizedInput.fullName,
      licenseType: sanitizedInput.licenseType,
      licenseNumber: sanitizedInput.licenseNumber,
      institutionName: sanitizedInput.institutionName,
      phoneNumber: sanitizedInput.phoneNumber,
      passwordHash,
      emailVerificationToken,
      createdByIp: clientIp
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(
      sanitizedInput.email,
      sanitizedInput.fullName,
      emailVerificationToken
    );

    // Log audit event
    await logAuditEvent(
      userId,
      'USER_REGISTERED',
      'medical_professional',
      userId,
      { licenseType: sanitizedInput.licenseType },
      clientIp,
      req.headers['user-agent']
    );

    // Return success response
    return res.status(201).json({
      success: true,
      data: {
        userId,
        email: sanitizedInput.email,
        verificationEmailSent: emailSent,
        nextStep: 'verify_email'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.'
      }
    });
  }
}
