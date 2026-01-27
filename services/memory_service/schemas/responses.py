"""
Response Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# =====================================================
# Base Responses
# =====================================================

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str
    database: bool
    timestamp: datetime


class ErrorResponse(BaseModel):
    """Error response."""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


# =====================================================
# Persona Responses
# =====================================================

class PersonaResponse(BaseModel):
    """Persona data."""
    id: str
    user_id: str
    name: Optional[str]
    traits: Dict[str, Any]
    preferences: Dict[str, Any]
    style: Dict[str, Any]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


# =====================================================
# NOTAM Responses
# =====================================================

class NotamResponse(BaseModel):
    """NOTAM data."""
    id: str
    user_id: str
    title: str
    content: str
    priority: str
    category: Optional[str]
    active: bool
    expires_at: Optional[datetime]
    created_at: Optional[datetime]


# =====================================================
# Session Responses
# =====================================================

class SessionResponse(BaseModel):
    """Session data."""
    id: str
    user_id: str
    agent_type: Optional[str]
    agent_name: Optional[str]
    last_query: Optional[str]
    last_response_summary: Optional[str]
    context: Dict[str, Any]
    updated_at: Optional[datetime]


# =====================================================
# Context Response (Layer 1 Combined)
# =====================================================

class ContextResponse(BaseModel):
    """Full user context - Layer 1 data."""
    user_id: str
    persona: Optional[PersonaResponse]
    notams: List[NotamResponse] = Field(default_factory=list)
    last_session: Optional[SessionResponse]
    retrieved_at: datetime

    def to_prompt_section(self) -> str:
        """Format as prompt injection text."""
        parts = ["<user_context>"]

        if self.persona:
            parts.append(f"User: {self.persona.name or self.user_id}")
            if self.persona.traits:
                parts.append(f"Traits: {self.persona.traits}")
            if self.persona.preferences:
                parts.append(f"Preferences: {self.persona.preferences}")
            if self.persona.style:
                parts.append(f"Style: {self.persona.style}")

        if self.notams:
            parts.append("\nNOTAMs (Important Notices):")
            for notam in self.notams:
                parts.append(f"- [{notam.priority.upper()}] {notam.title}: {notam.content}")

        if self.last_session:
            parts.append(f"\nLast Activity: {self.last_session.last_query or 'None'}")
            if self.last_session.context:
                parts.append(f"Context: {self.last_session.context}")

        parts.append("</user_context>")
        return "\n".join(parts)


# =====================================================
# Memory Responses (Layer 2)
# =====================================================

class MemoryResponse(BaseModel):
    """Memory data."""
    id: str
    user_id: str
    agent_id: str
    access_mode: str
    content: str
    memory_type: str
    importance: float
    metadata: Dict[str, Any]
    created_at: Optional[datetime]
    accessed_at: Optional[datetime]
    access_count: int


class MemorySearchResult(BaseModel):
    """Single search result with similarity score."""
    memory: MemoryResponse
    similarity: float


class MemorySearchResponse(BaseModel):
    """Search results."""
    user_id: str
    query: str
    results: List[MemorySearchResult]
    total_found: int
    search_time_ms: float


class MemoryAddResponse(BaseModel):
    """Response after adding memory."""
    success: bool
    memory_id: str
    message: str


class MemoryExtractResponse(BaseModel):
    """Response after extracting memories."""
    success: bool
    extracted_count: int
    memories: List[MemoryResponse]
    message: str
