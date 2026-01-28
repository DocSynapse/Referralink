// Authentication Service - API Integration
// Handles registration, login, verification for medical professionals

import type {
  RegistrationInput,
  LoginResponse,
  ApiResponse,
  MedicalProfessional
} from '../api/types/registration';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Register new medical professional
 */
export async function registerUser(data: RegistrationInput): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred'
      }
    };
  }
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    // Store session token if successful
    if (result.success && result.data?.sessionToken) {
      localStorage.setItem('sessionToken', result.data.sessionToken);
      localStorage.setItem('userRole', result.data.user.role);
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred'
      }
    };
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred'
      }
    };
  }
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(): Promise<ApiResponse> {
  try {
    const sessionToken = localStorage.getItem('sessionToken');

    if (!sessionToken) {
      throw new Error('No session token found');
    }

    const response = await fetch(`${API_BASE}/api/auth/complete-onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        termsAccepted: true,
        hipaaAcknowledged: true
      })
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred'
      }
    };
  }
}

/**
 * Logout user
 */
export function logoutUser(): void {
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('apiKey');
}

/**
 * Get current session token
 */
export function getSessionToken(): string | null {
  return localStorage.getItem('sessionToken');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getSessionToken();
}

/**
 * Get user role
 */
export function getUserRole(): string | null {
  return localStorage.getItem('userRole');
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  const role = getUserRole();
  return role === 'admin_user' || role === 'admin';
}

/**
 * Fallback: Simple admin login (existing hardcoded auth)
 * Used for backward compatibility with existing system
 */
export function simpleAdminLogin(username: string, password: string): boolean {
  const normalizedUser = username.trim().toLowerCase();
  const isValid =
    normalizedUser === 'doc' &&
    password.trim() === (import.meta.env.VITE_AUTH_PASSWORD || '123456');

  if (isValid) {
    // Set as admin
    localStorage.setItem('sessionToken', 'simple-admin-session');
    localStorage.setItem('userRole', 'admin');
    return true;
  }

  return false;
}
