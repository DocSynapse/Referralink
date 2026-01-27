"""
Session Model - Last activity tracking
"""

from sqlalchemy import Column, String, Text, DateTime, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone

from ..database import Base


class Session(Base):
    """User session with last activity context."""

    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(String(255), nullable=False, index=True)
    agent_type = Column(String(50))  # cli, ide, web, api
    agent_name = Column(String(255))
    last_query = Column(Text)
    last_response_summary = Column(Text)
    context = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "agent_type": self.agent_type,
            "agent_name": self.agent_name,
            "last_query": self.last_query,
            "last_response_summary": self.last_response_summary,
            "context": self.context or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
