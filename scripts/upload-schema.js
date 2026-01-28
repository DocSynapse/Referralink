/**
 * Upload database schema to Neon PostgreSQL
 * Usage: node scripts/upload-schema.js
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Neon connection string
const connectionString = process.env.POSTGRES_URL ||
  'postgresql://neondb_owner:npg_9lYSpZXm5rkW@ep-plain-hat-a16bvz1l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function uploadSchema() {
  console.log('🚀 Starting schema upload to Neon PostgreSQL...\n');

  try {
    // Connect
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read schema file
    console.log('📖 Reading schema.sql...');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log(`✅ Schema file loaded (${schema.length} bytes)\n`);

    // Execute schema
    console.log('⚙️  Executing schema...');
    await client.query(schema);
    console.log('✅ Schema executed successfully!\n');

    // Verify tables created
    console.log('🔍 Verifying tables...');
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log(`✅ ${tablesResult.rows.length} tables created:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.tablename}`);
    });

    // Verify triggers
    console.log('\n🔍 Verifying triggers...');
    const triggersResult = await client.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
    `);

    console.log(`✅ ${triggersResult.rows.length} triggers found:`);
    triggersResult.rows.forEach(row => {
      console.log(`   - ${row.trigger_name} on ${row.event_object_table}`);
    });

    // Count records
    console.log('\n🔍 Checking initial data...');
    const countResult = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM medical_professionals) as users,
        (SELECT COUNT(*) FROM role_permissions) as permissions,
        (SELECT COUNT(*) FROM verification_logs) as verifications,
        (SELECT COUNT(*) FROM user_sessions) as sessions,
        (SELECT COUNT(*) FROM audit_logs) as audits
    `);

    console.log('✅ Record counts:');
    console.log(`   - Users: ${countResult.rows[0].users}`);
    console.log(`   - Permissions: ${countResult.rows[0].permissions}`);
    console.log(`   - Verifications: ${countResult.rows[0].verifications}`);
    console.log(`   - Sessions: ${countResult.rows[0].sessions}`);
    console.log(`   - Audits: ${countResult.rows[0].audits}`);

    console.log('\n🎉 Schema upload COMPLETE!\n');
    console.log('Next steps:');
    console.log('1. Add POSTGRES_URL to Vercel env vars');
    console.log('2. Redeploy your Vercel project');
    console.log('3. Test registration system');

  } catch (error) {
    console.error('❌ Error during schema upload:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

// Run
uploadSchema();
