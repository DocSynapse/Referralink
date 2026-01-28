#!/usr/bin/env node

/**
 * VERIFY ENVIRONMENT VARIABLE
 * Quick check to verify POSTGRES_URL format
 */

console.log('\n🔍 Environment Variable Verification\n');
console.log('='.repeat(60));

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.log('❌ POSTGRES_URL not set in environment');
  console.log('\n💡 To test locally:');
  console.log('   1. Create .env.local file');
  console.log('   2. Add: POSTGRES_URL=postgresql://...');
  console.log('   3. Run: vercel dev\n');
  process.exit(1);
}

console.log('✅ POSTGRES_URL is set');
console.log('\n📋 Connection String Analysis:');
console.log('-'.repeat(60));

// Parse connection string
try {
  const url = new URL(POSTGRES_URL);

  console.log('Protocol:', url.protocol);
  console.log('Username:', url.username);
  console.log('Password:', url.password ? '***' + url.password.slice(-4) : 'NOT SET');
  console.log('Host:', url.hostname);
  console.log('Port:', url.port || 'default (5432)');
  console.log('Database:', url.pathname.substring(1));
  console.log('SSL Mode:', url.searchParams.get('sslmode') || 'NOT SET');

  // Validation
  console.log('\n🔍 Validation:');
  console.log('-'.repeat(60));

  let issues = 0;

  if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
    console.log('❌ Protocol should be postgresql:// or postgres://');
    issues++;
  } else {
    console.log('✅ Protocol is correct');
  }

  if (!url.username) {
    console.log('❌ Username is missing');
    issues++;
  } else {
    console.log('✅ Username is set');
  }

  if (!url.password) {
    console.log('❌ Password is missing');
    issues++;
  } else {
    console.log('✅ Password is set');

    // Check for special characters that need encoding
    const specialChars = ['@', '#', ':', '/', '?', '&', '=', '%'];
    const hasUnencoded = specialChars.some(char =>
      url.password.includes(char) && !url.password.includes('%')
    );

    if (hasUnencoded) {
      console.log('⚠️  Password contains special characters that may need URL encoding');
      console.log('   Characters: @ # : / ? & = %');
      console.log('   Encode them: %40 %23 %3A %2F %3F %26 %3D %25');
    }
  }

  if (!url.hostname) {
    console.log('❌ Host is missing');
    issues++;
  } else {
    console.log('✅ Host is set');
  }

  if (!url.pathname || url.pathname === '/') {
    console.log('❌ Database name is missing');
    issues++;
  } else {
    console.log('✅ Database name is set');
  }

  const sslMode = url.searchParams.get('sslmode');
  if (!sslMode) {
    console.log('⚠️  SSL mode not set (Neon requires sslmode=require)');
    console.log('   Add: ?sslmode=require');
    issues++;
  } else if (sslMode === 'require') {
    console.log('✅ SSL mode is correctly set to "require"');
  } else {
    console.log('⚠️  SSL mode is set to:', sslMode);
    console.log('   Neon recommends: sslmode=require');
  }

  console.log('\n' + '='.repeat(60));

  if (issues === 0) {
    console.log('✅ All checks passed! Connection string looks good.\n');
  } else {
    console.log(`⚠️  Found ${issues} potential issue(s). Review above.\n`);
  }

  // Test connection (optional)
  console.log('💡 To test connection:');
  console.log('   vercel dev');
  console.log('   Then visit: http://localhost:3000/api/health\n');

} catch (error) {
  console.log('❌ Invalid connection string format');
  console.log('Error:', error.message);
  console.log('\n✅ Expected format:');
  console.log('postgresql://username:password@host:port/database?sslmode=require\n');
  process.exit(1);
}
