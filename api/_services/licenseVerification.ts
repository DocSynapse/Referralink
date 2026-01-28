// License Verification Service
// Integration with Indonesian Medical Board APIs (KEMENKES, IDI, etc.)

import type { LicenseVerificationResult, LicenseType } from '../_types/registration';

/**
 * Verify medical license against Indonesian medical board database
 *
 * IMPLEMENTATION NOTES:
 * - MVP: Mock verification with pattern validation
 * - Production: Integrate with KEMENKES API (https://sip.kemenkes.go.id)
 * - Future: IDI (Ikatan Dokter Indonesia) API integration
 *
 * @param licenseNumber License number to verify
 * @param licenseType Type of medical license
 * @param fullName Practitioner's full name for cross-verification
 */
export async function verifyMedicalLicense(
  licenseNumber: string,
  licenseType: LicenseType,
  fullName: string
): Promise<LicenseVerificationResult> {

  // MVP Implementation: Pattern-based validation
  // TODO: Replace with actual API integration before production launch

  const isValidFormat = validateLicenseFormat(licenseNumber, licenseType);

  if (!isValidFormat) {
    return {
      isValid: false,
      source: 'FORMAT_VALIDATION',
      verifiedAt: new Date(),
      errorMessage: 'Format nomor izin praktik tidak valid'
    };
  }

  // Mock API call simulation
  // In production, this will be replaced with actual HTTP request to KEMENKES/IDI
  const mockApiResult = await mockVerificationAPI(licenseNumber, licenseType, fullName);

  return mockApiResult;
}

/**
 * Validate license number format
 */
function validateLicenseFormat(licenseNumber: string, licenseType: LicenseType): boolean {
  const cleanLicense = licenseNumber.replace(/\s|-/g, '');

  switch (licenseType) {
    case 'doctor':
      // SIP format: SIP.123456 or 123456/SIP
      return /^(SIP\.\d+|\d+\/SIP)$/i.test(cleanLicense);

    case 'specialist':
      // SIPA format: SIPA.123456
      return /^SIPA\.\d+$/i.test(cleanLicense);

    case 'nurse':
      // SIPP format: SIPP.123456
      return /^SIPP\.\d+$/i.test(cleanLicense);

    case 'midwife':
      // SIPB format: SIPB.123456
      return /^SIPB\.\d+$/i.test(cleanLicense);

    case 'admin':
      // Admin credential format: ADMIN-123456
      return /^ADMIN-\d+$/i.test(cleanLicense);

    default:
      return false;
  }
}

/**
 * Mock verification API (MVP only)
 *
 * PRODUCTION REPLACEMENT:
 * ```typescript
 * async function verifyWithKEMENKES(licenseNumber: string): Promise<any> {
 *   const response = await fetch('https://sip.kemenkes.go.id/api/verify', {
 *     method: 'POST',
 *     headers: {
 *       'Authorization': `Bearer ${process.env.KEMENKES_API_KEY}`,
 *       'Content-Type': 'application/json'
 *     },
 *     body: JSON.stringify({ licenseNumber })
 *   });
 *   return response.json();
 * }
 * ```
 */
async function mockVerificationAPI(
  licenseNumber: string,
  licenseType: LicenseType,
  fullName: string
): Promise<LicenseVerificationResult> {

  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock verification logic for beta testing
  // Accept all valid format licenses for now
  const isValid = true;

  return {
    isValid,
    source: 'MOCK_API_MVP',
    verifiedAt: new Date(),
    licenseData: isValid ? {
      name: fullName,
      licenseNumber,
      issueDate: '2023-01-01',
      expiryDate: '2028-01-01',
      institution: 'Verified Medical Institution'
    } : undefined,
    errorMessage: isValid ? undefined : 'License verification failed'
  };
}

/**
 * KEMENKES API Integration (Production)
 * Uncomment and configure when KEMENKES API access is granted
 */
/*
export async function verifyWithKEMENKES(
  licenseNumber: string,
  licenseType: LicenseType
): Promise<LicenseVerificationResult> {
  const apiKey = process.env.KEMENKES_API_KEY;

  if (!apiKey) {
    throw new Error('KEMENKES_API_KEY not configured');
  }

  try {
    const response = await fetch('https://sip.kemenkes.go.id/api/v1/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        license_number: licenseNumber,
        license_type: mapLicenseTypeToKEMENKES(licenseType)
      }),
      signal: AbortSignal.timeout(10000) // 10s timeout
    });

    if (!response.ok) {
      return {
        isValid: false,
        source: 'KEMENKES',
        verifiedAt: new Date(),
        errorMessage: `API error: ${response.status}`
      };
    }

    const data = await response.json();

    return {
      isValid: data.valid === true,
      source: 'KEMENKES',
      verifiedAt: new Date(),
      licenseData: data.valid ? {
        name: data.practitioner_name,
        licenseNumber: data.license_number,
        issueDate: data.issue_date,
        expiryDate: data.expiry_date,
        institution: data.institution_name
      } : undefined,
      errorMessage: data.valid ? undefined : data.error_message
    };

  } catch (error) {
    return {
      isValid: false,
      source: 'KEMENKES',
      verifiedAt: new Date(),
      errorMessage: `Verification failed: ${error.message}`
    };
  }
}

function mapLicenseTypeToKEMENKES(licenseType: LicenseType): string {
  const mapping = {
    'doctor': 'SIP',
    'specialist': 'SIPA',
    'nurse': 'SIPP',
    'midwife': 'SIPB',
    'admin': 'ADMIN'
  };
  return mapping[licenseType] || 'UNKNOWN';
}
*/

/**
 * Background check integration (optional for MVP)
 * Can be integrated with third-party services like:
 * - AtlasVerify (https://atlasverify.com)
 * - Checkr (https://checkr.com)
 * - Sterling (https://sterlingcheck.com)
 */
export async function performBackgroundCheck(
  userId: string,
  licenseNumber: string
): Promise<{ status: 'passed' | 'failed' | 'pending'; details?: any }> {

  // MVP: Skip background check, auto-pass
  // TODO: Integrate with background check provider before GA

  return {
    status: 'passed', // Auto-pass for MVP
    details: {
      note: 'Background check skipped for MVP phase',
      completedAt: new Date()
    }
  };
}
