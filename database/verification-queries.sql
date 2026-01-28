-- ============================================
-- Database Verification Queries
-- Run these after schema upload to verify
-- ============================================

-- 1. Verify all tables exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Expected: 5 tables (audit_logs, medical_professionals, role_permissions, user_sessions, verification_logs)

-- 2. Check table structures
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. Verify triggers exist
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
-- Expected: assign_user_role_trigger on medical_professionals

-- 4. Verify indexes exist
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 5. Count records in each table (should be 0 after fresh install)
SELECT
  'medical_professionals' as table_name,
  COUNT(*) as record_count
FROM medical_professionals
UNION ALL
SELECT 'role_permissions', COUNT(*) FROM role_permissions
UNION ALL
SELECT 'verification_logs', COUNT(*) FROM verification_logs
UNION ALL
SELECT 'user_sessions', COUNT(*) FROM user_sessions
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- ============================================
-- Test Queries (after deployment)
-- ============================================

-- 6. View all registered users
SELECT
  id,
  full_name,
  email,
  license_type,
  license_number,
  role,
  email_verified,
  license_verified,
  onboarding_completed,
  registration_status,
  created_at
FROM medical_professionals
ORDER BY created_at DESC
LIMIT 10;

-- 7. Count users by status
SELECT
  COUNT(*) FILTER (WHERE email_verified = FALSE OR license_verified = FALSE) as pending_verification,
  COUNT(*) FILTER (WHERE email_verified = TRUE AND license_verified = TRUE AND onboarding_completed = FALSE) as verified_not_onboarded,
  COUNT(*) FILTER (WHERE onboarding_completed = TRUE) as fully_active,
  COUNT(*) as total_users
FROM medical_professionals;

-- 8. Count users by role
SELECT
  role,
  COUNT(*) as user_count
FROM medical_professionals
GROUP BY role
ORDER BY user_count DESC;

-- 9. Recent registrations (last 7 days)
SELECT
  full_name,
  email,
  role,
  created_at
FROM medical_professionals
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 10. Active sessions
SELECT
  s.id,
  s.created_at as session_start,
  s.expires_at,
  m.full_name,
  m.email
FROM user_sessions s
JOIN medical_professionals m ON s.user_id = m.id
WHERE s.expires_at > NOW()
ORDER BY s.created_at DESC;

-- ============================================
-- Audit & Monitoring Queries
-- ============================================

-- 11. Recent audit logs
SELECT
  action,
  table_name,
  performed_by,
  performed_at
FROM audit_logs
ORDER BY performed_at DESC
LIMIT 20;

-- 12. Failed verification attempts
SELECT
  user_id,
  verification_type,
  status,
  verified_at,
  notes
FROM verification_logs
WHERE status = 'failed'
ORDER BY verified_at DESC
LIMIT 10;

-- 13. Email verification rate
SELECT
  COUNT(*) FILTER (WHERE email_verified = TRUE) * 100.0 / NULLIF(COUNT(*), 0) as email_verification_rate,
  COUNT(*) FILTER (WHERE license_verified = TRUE) * 100.0 / NULLIF(COUNT(*), 0) as license_verification_rate,
  COUNT(*) FILTER (WHERE onboarding_completed = TRUE) * 100.0 / NULLIF(COUNT(*), 0) as onboarding_completion_rate
FROM medical_professionals;

-- 14. Registration trends (last 30 days)
SELECT
  DATE(created_at) as date,
  COUNT(*) as registrations
FROM medical_professionals
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- Maintenance Queries
-- ============================================

-- 15. Clean expired sessions
DELETE FROM user_sessions
WHERE expires_at < NOW();

-- 16. Clean old audit logs (older than 90 days)
-- DELETE FROM audit_logs
-- WHERE performed_at < NOW() - INTERVAL '90 days';

-- 17. Update expired email verification tokens
UPDATE medical_professionals
SET email_verification_token = NULL
WHERE email_verification_expires < NOW()
  AND email_verified = FALSE;

-- ============================================
-- Database Health Check
-- ============================================

-- 18. Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 19. Index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 20. Connection count
SELECT
  COUNT(*) as total_connections,
  COUNT(*) FILTER (WHERE state = 'active') as active_connections,
  COUNT(*) FILTER (WHERE state = 'idle') as idle_connections
FROM pg_stat_activity
WHERE datname = current_database();
