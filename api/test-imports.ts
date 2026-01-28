// TEST IMPORTS ONE BY ONE
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const results: any = {};

  try {
    // Test 1: Import types
    results.step1 = 'Importing types...';
    const { type } = await import('./_types/registration.js');
    results.types = 'OK';

    // Test 2: Import auth utils
    results.step2 = 'Importing auth utils...';
    const authUtils = await import('./_utils/auth.js');
    results.auth = `OK - ${Object.keys(authUtils).length} exports`;

    // Test 3: Import db utils
    results.step3 = 'Importing db utils...';
    const dbUtils = await import('./_utils/db.js');
    results.db = `OK - ${Object.keys(dbUtils).length} exports`;

    // Test 4: Import email service
    results.step4 = 'Importing email service...';
    const emailService = await import('./_services/email.js');
    results.email = `OK - ${Object.keys(emailService).length} exports`;

    // Test 5: Call a simple auth function
    results.step5 = 'Testing auth functions...';
    const isValid = authUtils.validateEmail('test@example.com');
    results.validateEmail = isValid ? 'WORKS' : 'FAILED';

    return res.status(200).json({
      success: true,
      results
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      failedAt: results,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 10)
    });
  }
}
