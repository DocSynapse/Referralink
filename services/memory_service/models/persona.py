"""
Persona Model - User identity and preferences
"""

from sqlalchemy import Column, String, DateTime, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone

from ..database import Base


class Persona(Base):
    """User persona with traits and preferences."""

    __tablename__ = "personas"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255))
    traits = Column(JSONB, default=dict)
    preferences = Column(JSONB, default=dict)
    style = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "name": self.name,
            "traits": self.traits or {},
            "preferences": self.preferences or {},
            "style": self.style or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
