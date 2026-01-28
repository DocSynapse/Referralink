// Type definitions for medical professional registration system
// ReferraLink - Sentra Solutions

export type LicenseType = 'doctor' | 'specialist' | 'nurse' | 'midwife' | 'admin';

export type RegistrationStatus = 'pending' | 'verified' | 'active' | 'suspended' | 'rejected';

export type VerificationStatus = 'pending' | 'passed' | 'failed' | 'skipped';

export type UserRole = 'clinical_user' | 'specialist_user' | 'maternal_care_user' | 'nurse_user' | 'admin_user' | 'pending';

// Step 1: Registration Input
export interface RegistrationInput {
  email: string;
  fullName: string;
  licenseType: LicenseType;
  licenseNumber: string;
  institutionName: string;
  phoneNumber: string;
  password: string;
}

// Step 2: Verification Data
export interface LicenseVerificationResult {
  isValid: boolean;
  source: string; // 'KEMENKES', 'IDI', 'MANUAL'
  verifiedAt: Date;
  licenseData?: {
    name: string;
    licenseNumber: string;
    issueDate?: string;
    expiryDate?: string;
    institution?: string;
  };
  errorMessage?: string;
}

// Step 3: Role Assignment
export interface RolePermissions {
  modules: string[];
  [key: string]: any;
}

export interface RoleMapping {
  role: UserRole;
  displayName: string;
  description: string;
  permissions: RolePermissions;
}

// Step 4: Onboarding
export interface OnboardingData {
  termsAccepted: boolean;
  hipaaAcknowledged: boolean;
  apiKey?: string;
  mcpToken?: string;
}

// Complete User Profile
export interface MedicalProfessional {
  id: string;
  email: string;
  fullName: string;
  licenseType: LicenseType;
  licenseNumber: string;
  institutionName: string;
  phoneNumber: string;

  // Verification
  licenseVerified: boolean;
  licenseVerificationSource?: string;
  emailVerified: boolean;
  backgroundCheckStatus: VerificationStatus;

  // Role & Access
  role: UserRole;
  registrationStatus: RegistrationStatus;

  // Onboarding
  termsAccepted: boolean;
  hipaaAcknowledged: boolean;
  onboardingCompleted: boolean;

  // API Access
  apiKey?: string;

  // Timestamps
  createdAt: Date;
  lastLogin?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface RegistrationResponse {
  userId: string;
  email: string;
  verificationEmailSent: boolean;
  nextStep: 'verify_email' | 'verify_license' | 'complete_onboarding' | 'dashboard';
}

export interface LoginResponse {
  user: Omit<MedicalProfessional, 'apiKey'>;
  sessionToken: string;
  expiresAt: string;
  requiresOnboarding: boolean;
}

// Validation Error
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}
