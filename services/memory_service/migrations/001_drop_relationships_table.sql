-- Migration: Drop unused relationships table
-- Date: 2026-01-27
-- Rationale: Table created but never used in application logic
-- Safe to execute: No foreign key references from other tables

BEGIN;

-- Check if table exists before dropping
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'relationships'
    ) THEN
        -- Drop table (CASCADE will handle any foreign keys)
        DROP TABLE relationships CASCADE;
        RAISE NOTICE 'Table relationships dropped successfully';
    ELSE
        RAISE NOTICE 'Table relationships does not exist - skipping';
    END IF;
END $$;

COMMIT;
