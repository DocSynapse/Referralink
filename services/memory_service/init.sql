-- Sentra Memory Service Database Schema
-- Version: 1.0
-- Date: 2026-01-25

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- LAYER 1: Online/Always Available
-- =====================================================

-- Persona: User identity and preferences
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    traits JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    style JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTAM: Critical notices that must be shown
CREATE TABLE notams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'normal',
    category VARCHAR(100),
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions: Last activity tracking
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    agent_type VARCHAR(50),
    agent_name VARCHAR(255),
    last_query TEXT,
    last_response_summary TEXT,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LAYER 2: On-Demand Semantic Search
-- =====================================================

-- Memories: Extracted facts, preferences, decisions
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    agent_id VARCHAR(255) NOT NULL DEFAULT 'shared', -- which agent owns this memory
    access_mode VARCHAR(20) NOT NULL DEFAULT 'private', -- private (agent only) or shared (all agents)
    content TEXT NOT NULL,
    memory_type VARCHAR(50) NOT NULL, -- fact, preference, decision, event, procedure
    embedding VECTOR(384), -- all-MiniLM-L6-v2 dimension
    importance FLOAT DEFAULT 0.5,
    metadata JSONB DEFAULT '{}',
    source_conversation_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0
);

-- Relationships: Graph-style connections between memories
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
    target_memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
    relation_type VARCHAR(100) NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Layer 1 indexes
CREATE INDEX idx_personas_user ON personas(user_id);
CREATE INDEX idx_notams_user_active ON notams(user_id, active) WHERE active = true;
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_updated ON sessions(updated_at DESC);

-- Layer 2 indexes
CREATE INDEX idx_memories_user ON memories(user_id);
CREATE INDEX idx_memories_agent ON memories(user_id, agent_id);
CREATE INDEX idx_memories_type ON memories(user_id, memory_type);
CREATE INDEX idx_memories_access ON memories(user_id, access_mode);
CREATE INDEX idx_memories_created ON memories(created_at DESC);
CREATE INDEX idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Relationship indexes
CREATE INDEX idx_relationships_source ON relationships(source_memory_id);
CREATE INDEX idx_relationships_target ON relationships(target_memory_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER personas_updated_at
    BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create default user (Chief)
INSERT INTO personas (user_id, name, traits, preferences, style)
VALUES (
    'chief',
    'Dr. Ferdi Iskandar',
    '{"role": "CEO", "expertise": ["AI", "Healthcare", "Technology"], "personality": "perfectionist"}',
    '{"language": "id", "timezone": "Asia/Jakarta", "response_style": "concise"}',
    '{"communication": "direct", "detail_level": "high"}'
);

-- Sample NOTAM
INSERT INTO notams (user_id, title, content, priority, category)
VALUES (
    'chief',
    'Sentra Memory Service Active',
    'Memory system initialized. All AI agents can now access persistent memory.',
    'info',
    'system'
);

COMMIT;
