// TEMPORARY TEST ENDPOINT - No auth, just returns data
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    success: true,
    message: 'Test endpoint works!',
    data: {
      users: [
        {
          id: 'test-1',
          email: 'test@example.com',
          fullName: 'Test User',
          licenseType: 'doctor',
          licenseNumber: 'TEST123',
          institutionName: 'Test Hospital',
          phoneNumber: '081234567890',
          role: 'clinical_user',
          emailVerified: true,
          licenseVerified: true,
          registrationStatus: 'active',
          onboardingCompleted: true,
          createdAt: new Date().toISOString()
        }
      ]
    }
  });
}
