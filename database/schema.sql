-- Vercel Postgres Schema for ReferraLink Medical Professional Registration
-- Author: Claude Code Architecture Team
-- Date: 2026-01-28

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main user table
CREATE TABLE medical_professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Step 1: Credentials (Gate 3: Access Control)
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  license_type VARCHAR(50) NOT NULL CHECK (license_type IN ('doctor', 'specialist', 'nurse', 'midwife', 'admin')),
  license_number VARCHAR(100) UNIQUE NOT NULL,
  institution_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  -- Step 2: Verification (Gate 2: Integrity Check)
  license_verified BOOLEAN DEFAULT FALSE,
  license_verification_source VARCHAR(100), -- 'KEMENKES', 'IDI', etc.
  license_verified_at TIMESTAMPTZ,
  background_check_status VARCHAR(50) DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'passed', 'failed', 'skipped')),
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,

  -- Step 3: Role Assignment (Auto-assigned based on license_type)
  role VARCHAR(50) NOT NULL DEFAULT 'pending',
  role_assigned_at TIMESTAMPTZ,

  -- Step 4: Onboarding
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMPTZ,
  hipaa_acknowledged BOOLEAN DEFAULT FALSE,
  hipaa_acknowledged_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,

  -- API Access
  api_key VARCHAR(255) UNIQUE,
  api_key_created_at TIMESTAMPTZ,
  mcp_token VARCHAR(500),

  -- Audit fields
  registration_status VARCHAR(50) DEFAULT 'pending' CHECK (registration_status IN ('pending', 'verified', 'active', 'suspended', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  created_by_ip VARCHAR(50),

  -- Indexes for performance
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Role mapping table
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default role mappings
INSERT INTO role_permissions (role, display_name, description, permissions) VALUES
('clinical_user', 'Clinical User', 'Doctor - Can access patient data and diagnostic tools',
  '{"modules": ["patient_data", "diagnostics", "referrals"], "can_create_referral": true, "can_view_patient_records": true}'::jsonb),
('specialist_user', 'Specialist User', 'Specialist - Can provide referral input and consultations',
  '{"modules": ["referrals", "consultations", "specialist_tools"], "can_accept_referral": true, "can_provide_consultation": true}'::jsonb),
('maternal_care_user', 'Maternal Care User', 'Midwife - Access to POGS module when live',
  '{"modules": ["maternal_care", "pogs"], "can_access_pogs": true, "can_manage_maternal_records": true}'::jsonb),
('admin_user', 'Administrator', 'Hospital admin - Full system access',
  '{"modules": ["admin", "reports", "user_management"], "can_manage_users": true, "can_view_analytics": true, "can_export_data": true}'::jsonb),
('nurse_user', 'Nurse User', 'Nurse - Patient care and basic diagnostics',
  '{"modules": ["patient_care", "basic_diagnostics"], "can_assist_doctors": true, "can_update_patient_records": true}'::jsonb);

-- Verification logs for audit trail
CREATE TABLE verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES medical_professionals(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL, -- 'license', 'email', 'background'
  verification_status VARCHAR(50) NOT NULL,
  verification_source VARCHAR(100),
  verification_data JSONB,
  verified_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_user_verification (user_id, verification_type)
);

-- Session management
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES medical_professionals(id) ON DELETE CASCADE,
  session_token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(50),
  user_agent TEXT,

  INDEX idx_session_token (session_token),
  INDEX idx_user_sessions (user_id, expires_at)
);

-- Audit log for compliance
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES medical_professionals(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  changes JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_audit_user (user_id, created_at),
  INDEX idx_audit_action (action, created_at)
);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_medical_professionals_updated_at BEFORE UPDATE
  ON medical_professionals FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Function to auto-assign role based on license type
CREATE OR REPLACE FUNCTION assign_role_on_license_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.license_verified = TRUE AND OLD.license_verified = FALSE THEN
    NEW.role = CASE NEW.license_type
      WHEN 'doctor' THEN 'clinical_user'
      WHEN 'specialist' THEN 'specialist_user'
      WHEN 'midwife' THEN 'maternal_care_user'
      WHEN 'nurse' THEN 'nurse_user'
      WHEN 'admin' THEN 'admin_user'
      ELSE 'pending'
    END;
    NEW.role_assigned_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_assign_role BEFORE UPDATE
  ON medical_professionals FOR EACH ROW
  EXECUTE PROCEDURE assign_role_on_license_verification();
