"""
Request Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# =====================================================
# Context Requests
# =====================================================

class ContextRequest(BaseModel):
    """Request for getting user context (Layer 1)."""
    user_id: str = Field(..., description="User identifier")
    agent_type: Optional[str] = Field(None, description="Type of agent making request")
    agent_name: Optional[str] = Field(None, description="Name of agent")
    include_notams: bool = Field(True, description="Include active NOTAMs")
    include_session: bool = Field(True, description="Include last session activity")


# =====================================================
# Persona Requests
# =====================================================

class PersonaCreate(BaseModel):
    """Create new persona."""
    user_id: str
    name: Optional[str] = None
    traits: Dict[str, Any] = Field(default_factory=dict)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    style: Dict[str, Any] = Field(default_factory=dict)


class PersonaUpdate(BaseModel):
    """Update existing persona."""
    name: Optional[str] = None
    traits: Optional[Dict[str, Any]] = None
    preferences: Optional[Dict[str, Any]] = None
    style: Optional[Dict[str, Any]] = None


# =====================================================
# NOTAM Requests
# =====================================================

class NotamCreate(BaseModel):
    """Create new NOTAM."""
    user_id: str
    title: str
    content: str
    priority: str = Field("normal", pattern="^(critical|high|normal|low|info)$")
    category: Optional[str] = None
    expires_at: Optional[datetime] = None


class NotamUpdate(BaseModel):
    """Update existing NOTAM."""
    title: Optional[str] = None
    content: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    active: Optional[bool] = None
    expires_at: Optional[datetime] = None


# =====================================================
# Session Requests
# =====================================================



# =====================================================
# Memory Requests (Layer 2)
# =====================================================

class MemorySearch(BaseModel):
    """Semantic search request."""
    user_id: str
    query: str = Field(..., min_length=1, description="Search query")
    agent_id: Optional[str] = Field(None, description="Agent ID - only see own + shared memories")
    memory_types: Optional[List[str]] = Field(None, description="Filter by memory types")
    limit: int = Field(5, ge=1, le=20, description="Number of results")
    threshold: float = Field(0.3, ge=0, le=1, description="Minimum similarity score")
    include_shared: bool = Field(True, description="Include shared memories in results")


class MemoryAdd(BaseModel):
    """Add new memory."""
    user_id: str
    agent_id: str = Field("shared", description="Agent that owns this memory")
    access_mode: str = Field("shared", pattern="^(private|shared)$", description="Default shared. Use 'private' for agent-only")
    content: str = Field(..., min_length=1)
    memory_type: str = Field(..., pattern="^(fact|preference|decision|event|procedure)$")
    importance: float = Field(0.5, ge=0, le=1)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    source_conversation_id: Optional[str] = None




