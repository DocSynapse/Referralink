-- Migration 001: Add agent_id isolation
-- Run this on existing database

-- Add agent_id column
ALTER TABLE memories ADD COLUMN IF NOT EXISTS agent_id VARCHAR(255) NOT NULL DEFAULT 'shared';

-- Add access_mode column
ALTER TABLE memories ADD COLUMN IF NOT EXISTS access_mode VARCHAR(20) NOT NULL DEFAULT 'private';

-- Remove old source_agent column (data migrated to agent_id)
-- ALTER TABLE memories DROP COLUMN IF EXISTS source_agent;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_memories_agent ON memories(user_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_memories_access ON memories(user_id, access_mode);

-- Update existing memories to be shared (so they're accessible by all agents)
UPDATE memories SET access_mode = 'shared' WHERE access_mode = 'private' AND agent_id = 'shared';
