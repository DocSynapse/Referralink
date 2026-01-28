#!/usr/bin/env node

/**
 * DIAGNOSTIC SCRIPT
 * Automatically checks common issues with API deployment
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔍 ReferraLink API Diagnostics\n');
console.log('=' .repeat(60));

// Get production URL from user
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('\n📍 Enter your Vercel production URL (e.g., https://myapp.vercel.app): ', (productionUrl) => {
  if (!productionUrl || !productionUrl.startsWith('http')) {
    console.log('❌ Invalid URL. Please provide full URL starting with https://');
    process.exit(1);
  }

  runDiagnostics(productionUrl);
  readline.close();
});

async function runDiagnostics(baseUrl) {
  console.log('\n' + '='.repeat(60));
  console.log('STARTING DIAGNOSTICS');
  console.log('='.repeat(60));

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Check local environment
  console.log('\n📦 TEST 1: Local Environment');
  console.log('-'.repeat(60));
  totalTests++;

  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('POSTGRES_URL')) {
      console.log('✅ .env.local exists with POSTGRES_URL');
      passedTests++;
    } else {
      console.log('❌ .env.local exists but missing POSTGRES_URL');
    }
  } else {
    console.log('⚠️  .env.local not found (okay for production testing)');
    passedTests++; // Not critical for production
  }

  // Test 2: Health endpoint
  console.log('\n❤️  TEST 2: Health Check Endpoint');
  console.log('-'.repeat(60));
  totalTests++;

  try {
    const healthResult = await testEndpoint(baseUrl + '/api/health');
    if (healthResult.success) {
      console.log('✅ Health endpoint returns valid JSON');
      console.log('   Response:', JSON.stringify(healthResult.data, null, 2));
      passedTests++;
    } else {
      console.log('❌ Health endpoint failed');
      console.log('   Status:', healthResult.status);
      console.log('   Response:', healthResult.body.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message);
  }

  // Test 3: Test endpoint (no auth, no DB)
  console.log('\n🧪 TEST 3: Test Endpoint (No Auth)');
  console.log('-'.repeat(60));
  totalTests++;

  try {
    const testResult = await testEndpoint(baseUrl + '/api/admin/test');
    if (testResult.success) {
      console.log('✅ Test endpoint returns valid JSON');
      console.log('   Users in response:', testResult.data.data?.users?.length || 0);
      passedTests++;
    } else {
      console.log('❌ Test endpoint failed');
      console.log('   Status:', testResult.status);
      console.log('   Response:', testResult.body.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ Test endpoint error:', error.message);
  }

  // Test 4: Simple users endpoint (with auth)
  console.log('\n🔐 TEST 4: Simple Users Endpoint (With Auth)');
  console.log('-'.repeat(60));
  totalTests++;

  try {
    const usersResult = await testEndpoint(
      baseUrl + '/api/admin/users-simple',
      { 'Authorization': 'Bearer simple-admin-session' }
    );
    if (usersResult.success) {
      console.log('✅ Simple users endpoint returns valid JSON');
      console.log('   Users from DB:', usersResult.data.data?.users?.length || 0);
      passedTests++;
    } else {
      console.log('❌ Simple users endpoint failed');
      console.log('   Status:', usersResult.status);
      console.log('   Response:', usersResult.body.substring(0, 200));

      // Check for specific error codes
      if (usersResult.body.includes('NO_DB')) {
        console.log('\n⚠️  POSTGRES_URL not set in Vercel environment variables!');
        console.log('   Fix: Vercel Dashboard → Settings → Environment Variables');
      }
    }
  } catch (error) {
    console.log('❌ Simple users endpoint error:', error.message);
  }

  // Test 5: Full users endpoint (complex)
  console.log('\n🏢 TEST 5: Full Users Endpoint (Complex)');
  console.log('-'.repeat(60));
  totalTests++;

  try {
    const fullResult = await testEndpoint(
      baseUrl + '/api/admin/users',
      { 'Authorization': 'Bearer simple-admin-session' }
    );
    if (fullResult.success) {
      console.log('✅ Full users endpoint returns valid JSON');
      console.log('   Users from DB:', fullResult.data.data?.users?.length || 0);
      passedTests++;
    } else {
      console.log('❌ Full users endpoint failed');
      console.log('   Status:', fullResult.status);
      console.log('   Response:', fullResult.body.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ Full users endpoint error:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSTICS SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests\n`);

  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! API is working correctly.\n');
  } else if (passedTests === 0) {
    console.log('🚨 ALL TESTS FAILED! Likely causes:');
    console.log('   1. Wrong URL (are you using production URL?)');
    console.log('   2. Deployment failed (check Vercel dashboard)');
    console.log('   3. API routes not deployed (check build logs)\n');
  } else {
    console.log('⚠️  PARTIAL SUCCESS. Check failed tests above.\n');

    if (passedTests >= 2 && passedTests < totalTests) {
      console.log('💡 Since some tests passed, likely issue is:');
      console.log('   - POSTGRES_URL not set in Vercel environment');
      console.log('   - Database connection issue\n');
    }
  }

  console.log('📋 Next steps:');
  console.log('   1. Review test results above');
  console.log('   2. Check Vercel Dashboard → Deployments');
  console.log('   3. Check Vercel Dashboard → Settings → Environment Variables');
  console.log('   4. If still stuck, send test results to Claude\n');
}

function testEndpoint(url, headers = {}) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'ReferraLink-Diagnostics/1.0',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        const isJson = contentType.includes('application/json');

        let parsedData = null;
        let success = false;

        if (isJson) {
          try {
            parsedData = JSON.parse(body);
            success = res.statusCode === 200 && parsedData.success !== false;
          } catch (e) {
            success = false;
          }
        }

        resolve({
          success,
          status: res.statusCode,
          contentType,
          body,
          data: parsedData
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        status: 0,
        error: error.message,
        body: ''
      });
    });

    req.end();
  });
}
