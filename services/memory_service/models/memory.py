"""
Memory Model - Extracted facts with vector embeddings
"""

from sqlalchemy import Column, String, Text, Float, Integer, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
from datetime import datetime, timezone

from ..database import Base
from ..config import get_settings

settings = get_settings()


class Memory(Base):
    """Semantic memory with vector embedding."""

    __tablename__ = "memories"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(String(255), nullable=False, index=True)
    agent_id = Column(String(255), nullable=False, default="shared")  # which agent owns this
    access_mode = Column(String(20), nullable=False, default="private")  # private or shared
    content = Column(Text, nullable=False)
    memory_type = Column(String(50), nullable=False)  # fact, preference, decision, event, procedure
    embedding = Column(Vector(settings.embedding_dimension))
    importance = Column(Float, default=0.5)
    extra_data = Column("metadata", JSONB, default=dict)  # 'metadata' is reserved in SQLAlchemy
    source_agent = Column(String(255))  # Deprecated, use agent_id instead
    source_conversation_id = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    accessed_at = Column(DateTime(timezone=True))
    access_count = Column(Integer, default=0)

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "agent_id": self.agent_id,
            "access_mode": self.access_mode,
            "content": self.content,
            "memory_type": self.memory_type,
            "importance": self.importance,
            "metadata": self.extra_data or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "accessed_at": self.accessed_at.isoformat() if self.accessed_at else None,
            "access_count": self.access_count
        }

    def record_access(self):
        """Record that this memory was accessed."""
        self.accessed_at = datetime.now(timezone.utc)
        self.access_count = (self.access_count or 0) + 1
