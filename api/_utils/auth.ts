// Authentication utilities for ReferraLink
// Password hashing, token generation, validation

import { createHash, randomBytes, pbkdf2Sync } from 'crypto';
import type { ValidationError } from '../_types/registration';

/**
 * Hash password using PBKDF2 with salt
 * OWASP recommended: PBKDF2-SHA256, 600k iterations
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(32).toString('hex');
  const hash = pbkdf2Sync(password, salt, 600000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  const verifyHash = pbkdf2Sync(password, salt, 600000, 64, 'sha256').toString('hex');
  return hash === verifyHash;
}

/**
 * Generate secure API key
 * Format: sk_live_<64-char-hex>
 */
export function generateApiKey(): string {
  const randomPart = randomBytes(32).toString('hex');
  return `sk_live_${randomPart}`;
}

/**
 * Generate email verification token
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate session token (JWT alternative for simplicity)
 */
export function generateSessionToken(userId: string): string {
  const timestamp = Date.now();
  const random = randomBytes(16).toString('hex');
  const payload = `${userId}:${timestamp}:${random}`;
  return Buffer.from(payload).toString('base64url');
}

/**
 * Decode session token
 */
export function decodeSessionToken(token: string): { userId: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [userId, timestamp] = decoded.split(':');
    return { userId, timestamp: parseInt(timestamp) };
  } catch {
    return null;
  }
}

/**
 * Password validation
 * Rules: Min 12 chars, uppercase, lowercase, number, special char
 */
export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (password.length < 12) {
    errors.push({
      field: 'password',
      message: 'Password harus minimal 12 karakter',
      code: 'PASSWORD_TOO_SHORT'
    });
  }

  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password harus mengandung huruf kapital',
      code: 'PASSWORD_NO_UPPERCASE'
    });
  }

  if (!/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password harus mengandung huruf kecil',
      code: 'PASSWORD_NO_LOWERCASE'
    });
  }

  if (!/[0-9]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password harus mengandung angka',
      code: 'PASSWORD_NO_NUMBER'
    });
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password harus mengandung karakter spesial',
      code: 'PASSWORD_NO_SPECIAL'
    });
  }

  return errors;
}

/**
 * Email validation (RFC 5322 compliant)
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Indonesian phone number validation
 * Format: +62xxx or 08xxx
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

/**
 * License number format validation
 * Indonesian medical license formats:
 * - Doctor: SIP.<digits> or <digits>/SIP
 * - Nurse: SIPP.<digits>
 * - Specialist: SIPA.<digits>
 */
export function validateLicenseNumber(licenseNumber: string, licenseType: string): boolean {
  const cleanLicense = licenseNumber.replace(/\s|-/g, '');

  switch (licenseType) {
    case 'doctor':
      return /^(SIP\.\d+|\d+\/SIP)$/i.test(cleanLicense);
    case 'specialist':
      return /^SIPA\.\d+$/i.test(cleanLicense);
    case 'nurse':
      return /^SIPP\.\d+$/i.test(cleanLicense);
    case 'midwife':
      return /^SIPB\.\d+$/i.test(cleanLicense);
    case 'admin':
      return /^ADMIN-\d+$/i.test(cleanLicense);
    default:
      return false;
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Rate limiting helper - check if IP is rate limited
 * Simple in-memory implementation (upgrade to Redis for production)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 900000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Clean up expired rate limit records (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}
