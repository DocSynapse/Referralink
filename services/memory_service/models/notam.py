"""
NOTAM Model - Critical notices that must be shown
"""

from sqlalchemy import Column, String, Text, Boolean, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone

from ..database import Base


class Notam(Base):
    """Notice to AI agents - critical info that must be shown."""

    __tablename__ = "notams"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(String(255), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String(50), default="normal")  # critical, high, normal, low, info
    category = Column(String(100))
    active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "title": self.title,
            "content": self.content,
            "priority": self.priority,
            "category": self.category,
            "active": self.active,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    @property
    def is_expired(self) -> bool:
        """Check if NOTAM has expired."""
        if not self.expires_at:
            return False
        return datetime.now(timezone.utc) > self.expires_at
