// Neon Postgres database utilities
// Connection pooling and query helpers

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { MedicalProfessional } from '../_types/registration.js';

// Lazy initialization of Neon client to prevent import-time crashes
let _sql: NeonQueryFunction<false, false> | null = null;

function getSQL(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }
    _sql = neon(process.env.POSTGRES_URL);
  }
  return _sql;
}

/**
 * Create new medical professional in database
 * Returns user ID on success
 */
export async function createMedicalProfessional(data: {
  email: string;
  fullName: string;
  licenseType: string;
  licenseNumber: string;
  institutionName: string;
  phoneNumber: string;
  passwordHash: string;
  emailVerificationToken: string;
  createdByIp: string;
}): Promise<string> {
  const rows = await getSQL()`
    INSERT INTO medical_professionals (
      email,
      full_name,
      license_type,
      license_number,
      institution_name,
      phone_number,
      password_hash,
      email_verification_token,
      email_verification_expires_at,
      created_by_ip
    ) VALUES (
      ${data.email},
      ${data.fullName},
      ${data.licenseType},
      ${data.licenseNumber},
      ${data.institutionName},
      ${data.phoneNumber},
      ${data.passwordHash},
      ${data.emailVerificationToken},
      NOW() + INTERVAL '24 hours',
      ${data.createdByIp}
    )
    RETURNING id
  `;

  return rows[0].id;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<MedicalProfessional | null> {
  const rows = await getSQL()`
    SELECT * FROM medical_professionals
    WHERE email = ${email}
  `;

  if (rows.length === 0) return null;

  return mapDbRowToUser(rows[0]);
}

/**
 * Find user by email with password hash (for authentication only)
 */
export async function findUserByEmailWithPassword(email: string): Promise<(MedicalProfessional & { passwordHash: string }) | null> {
  const rows = await getSQL()`
    SELECT * FROM medical_professionals
    WHERE email = ${email}
  `;

  if (rows.length === 0) return null;

  const user = mapDbRowToUser(rows[0]);
  return {
    ...user,
    passwordHash: rows[0].password_hash
  };
}

/**
 * Find user by ID
 */
export async function findUserById(userId: string): Promise<MedicalProfessional | null> {
  const rows = await getSQL()`
    SELECT * FROM medical_professionals
    WHERE id = ${userId}
  `;

  if (rows.length === 0) return null;

  return mapDbRowToUser(rows[0]);
}

/**
 * Find user by license number
 */
export async function findUserByLicenseNumber(licenseNumber: string): Promise<MedicalProfessional | null> {
  const rows = await getSQL()`
    SELECT * FROM medical_professionals
    WHERE license_number = ${licenseNumber}
  `;

  if (rows.length === 0) return null;

  return mapDbRowToUser(rows[0]);
}

/**
 * Verify email with token
 */
export async function verifyEmailWithToken(token: string): Promise<boolean> {
  const rows = await getSQL()`
    UPDATE medical_professionals
    SET
      email_verified = TRUE,
      email_verified_at = NOW(),
      email_verification_token = NULL
    WHERE
      email_verification_token = ${token}
      AND email_verification_expires_at > NOW()
      AND email_verified = FALSE
    RETURNING id
  `;

  return rows.length > 0;
}

/**
 * Update license verification status
 */
export async function updateLicenseVerification(
  userId: string,
  verified: boolean,
  source: string,
  verificationData?: any
): Promise<void> {
  await getSQL()`
    UPDATE medical_professionals
    SET
      license_verified = ${verified},
      license_verification_source = ${source},
      license_verified_at = NOW()
    WHERE id = ${userId}
  `;

  // Log verification
  await getSQL()`
    INSERT INTO verification_logs (
      user_id,
      verification_type,
      verification_status,
      verification_source,
      verification_data
    ) VALUES (
      ${userId},
      'license',
      ${verified ? 'passed' : 'failed'},
      ${source},
      ${verificationData ? JSON.stringify(verificationData) : null}
    )
  `;
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(
  userId: string,
  apiKey: string,
  mcpToken?: string
): Promise<void> {
  await getSQL()`
    UPDATE medical_professionals
    SET
      terms_accepted = TRUE,
      terms_accepted_at = NOW(),
      hipaa_acknowledged = TRUE,
      hipaa_acknowledged_at = NOW(),
      onboarding_completed = TRUE,
      onboarding_completed_at = NOW(),
      registration_status = 'active',
      api_key = ${apiKey},
      api_key_created_at = NOW(),
      mcp_token = ${mcpToken || null}
    WHERE id = ${userId}
  `;
}

/**
 * Create user session
 */
export async function createSession(
  userId: string,
  sessionToken: string,
  expiresAt: Date,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await getSQL()`
    INSERT INTO user_sessions (
      user_id,
      session_token,
      expires_at,
      ip_address,
      user_agent
    ) VALUES (
      ${userId},
      ${sessionToken},
      ${expiresAt.toISOString()},
      ${ipAddress},
      ${userAgent}
    )
  `;
}

/**
 * Validate session token
 */
export async function validateSession(sessionToken: string): Promise<string | null> {
  const rows = await getSQL()`
    SELECT user_id FROM user_sessions
    WHERE
      session_token = ${sessionToken}
      AND expires_at > NOW()
  `;

  if (rows.length === 0) return null;

  return rows[0].user_id;
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await getSQL()`
    UPDATE medical_professionals
    SET last_login = NOW()
    WHERE id = ${userId}
  `;
}

/**
 * Log audit event
 */
export async function logAuditEvent(
  userId: string | null,
  action: string,
  resourceType?: string,
  resourceId?: string,
  changes?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await getSQL()`
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      changes,
      ip_address,
      user_agent
    ) VALUES (
      ${userId},
      ${action},
      ${resourceType || null},
      ${resourceId || null},
      ${changes ? JSON.stringify(changes) : null},
      ${ipAddress || null},
      ${userAgent || null}
    )
  `;
}

/**
 * Get role permissions
 */
export async function getRolePermissions(role: string): Promise<any> {
  const rows = await getSQL()`
    SELECT permissions FROM role_permissions
    WHERE role = ${role}
  `;

  if (rows.length === 0) return null;

  return rows[0].permissions;
}

/**
 * Map database row to MedicalProfessional type
 */
function mapDbRowToUser(row: any): MedicalProfessional {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    licenseType: row.license_type,
    licenseNumber: row.license_number,
    institutionName: row.institution_name,
    phoneNumber: row.phone_number,
    licenseVerified: row.license_verified,
    licenseVerificationSource: row.license_verification_source,
    emailVerified: row.email_verified,
    backgroundCheckStatus: row.background_check_status,
    role: row.role,
    registrationStatus: row.registration_status,
    termsAccepted: row.terms_accepted,
    hipaaAcknowledged: row.hipaa_acknowledged,
    onboardingCompleted: row.onboarding_completed,
    apiKey: row.api_key,
    createdAt: row.created_at,
    lastLogin: row.last_login
  };
}
