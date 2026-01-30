"""
Search Service - Semantic search across memories
"""

from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from datetime import datetime, timezone
import time
import logging

from ..models.memory import Memory
from ..config import get_settings
from .embedder import get_embedding_service

logger = logging.getLogger(__name__)
settings = get_settings()


class SearchService:
    """Service for semantic search in memories."""

    def __init__(self, session: AsyncSession):
        """Initialize search service."""
        self.session = session
        self.embedder = get_embedding_service()

    async def search(
        self,
        user_id: str,
        query: str,
        agent_id: Optional[str] = None,
        memory_types: Optional[List[str]] = None,
        limit: int = 5,
        threshold: float = 0.3,
        include_shared: bool = True
    ) -> Tuple[List[Tuple[Memory, float]], float]:
        """
        Search memories by semantic similarity.

        Agent isolation:
        - If agent_id provided: returns only agent's own memories + shared memories
        - If no agent_id: returns all memories (admin mode)

        Returns:
            Tuple of (results, search_time_ms)
            where results is list of (Memory, similarity_score)
        """
        start_time = time.time()

        # Generate query embedding
        query_embedding = self.embedder.embed(query)

        # Format embedding as PostgreSQL vector string
        # Note: We embed the vector directly in SQL to avoid asyncpg parameter conflicts with ::
        embedding_str = "'[" + ",".join(str(x) for x in query_embedding) + "]'"

        # Build query with vector similarity
        # Using pgvector's <=> operator for cosine distance
        # Cosine distance = 1 - cosine_similarity, so we need to convert
        sql = f"""
            SELECT
                id,
                user_id,
                agent_id,
                access_mode,
                content,
                memory_type,
                importance,
                metadata,
                source_conversation_id,
                created_at,
                accessed_at,
                access_count,
                1 - (embedding <=> {embedding_str}::vector) as similarity
            FROM memories
            WHERE user_id = :user_id
        """

        params = {
            "user_id": user_id,
        }

        # Agent isolation filter
        if agent_id:
            if include_shared:
                # Agent sees: own memories + shared memories
                sql += " AND (agent_id = :agent_id OR access_mode = 'shared')"
            else:
                # Agent sees: only own memories
                sql += " AND agent_id = :agent_id"
            params["agent_id"] = agent_id

        # Add memory type filter if specified
        if memory_types:
            sql += " AND memory_type = ANY(:memory_types)"
            params["memory_types"] = memory_types

        # Add similarity threshold and ordering
        sql += f"""
            AND (1 - (embedding <=> {embedding_str}::vector)) >= :threshold
            ORDER BY similarity DESC
            LIMIT :limit
        """
        params["threshold"] = threshold
        params["limit"] = limit

        # Execute query
        result = await self.session.execute(text(sql), params)
        rows = result.fetchall()

        # Convert to Memory objects with similarity scores
        results = []
        for row in rows:
            memory = Memory(
                id=row.id,
                user_id=row.user_id,
                agent_id=row.agent_id,
                access_mode=row.access_mode,
                content=row.content,
                memory_type=row.memory_type,
                importance=row.importance,
                extra_data=row.metadata,
                source_conversation_id=row.source_conversation_id,
                created_at=row.created_at,
                accessed_at=row.accessed_at,
                access_count=row.access_count
            )
            results.append((memory, row.similarity))

            # Update access tracking
            await self._record_access(row.id)

        search_time_ms = (time.time() - start_time) * 1000
        logger.debug(f"Search completed in {search_time_ms:.2f}ms, found {len(results)} results")

        return results, search_time_ms

    async def _record_access(self, memory_id):
        """Record memory access for analytics."""
        try:
            await self.session.execute(
                text("""
                    UPDATE memories
                    SET accessed_at = :now, access_count = access_count + 1
                    WHERE id = :id
                """),
                {"id": memory_id, "now": datetime.now(timezone.utc)}
            )
        except Exception as e:
            logger.warning(f"Failed to record access: {e}")

    async def add_memory(
        self,
        user_id: str,
        content: str,
        memory_type: str,
        agent_id: str = "shared",
        access_mode: str = "private",
        importance: float = 0.5,
        metadata: dict = None,
        source_conversation_id: str = None
    ) -> Memory:
        """Add new memory with embedding and agent isolation."""
        # Generate embedding
        embedding = self.embedder.embed(content)

        # Create memory
        memory = Memory(
            user_id=user_id,
            agent_id=agent_id,
            access_mode=access_mode,
            content=content,
            memory_type=memory_type,
            embedding=embedding,
            importance=importance,
            extra_data=metadata or {},
            source_conversation_id=source_conversation_id
        )

        self.session.add(memory)
        await self.session.commit()
        await self.session.refresh(memory)

        logger.info(f"Added memory {memory.id} for user {user_id}, agent {agent_id}, mode {access_mode}")
        return memory

    async def add_memories_batch(
        self,
        user_id: str,
        memories_data: List
    ) -> List[Memory]:
        """
        Add multiple memories in batch with optimized embedding and commits.

        Args:
            user_id: The user ID owning these memories
            memories_data: List of objects/dicts containing memory details

        Returns:
            List of created Memory objects
        """
        if not memories_data:
            return []

        start_time = time.time()

        # Extract contents for batch embedding
        contents = [m.content for m in memories_data]
        embeddings = self.embedder.embed_batch(contents)

        memories = []
        for i, data in enumerate(memories_data):
            memory = Memory(
                user_id=user_id,
                agent_id=getattr(data, "agent_id", "shared"),
                access_mode=getattr(data, "access_mode", "private"),
                content=data.content,
                memory_type=data.memory_type,
                embedding=embeddings[i],
                importance=getattr(data, "importance", 0.5),
                extra_data=getattr(data, "metadata", {}) or {},
                source_conversation_id=getattr(data, "source_conversation_id", None)
            )
            memories.append(memory)
            self.session.add(memory)

        await self.session.commit()

        # Refresh all to get IDs generated by the database
        for memory in memories:
            await self.session.refresh(memory)

        elapsed = (time.time() - start_time) * 1000
        logger.info(f"Batch added {len(memories)} memories for user {user_id} in {elapsed:.2f}ms")

        return memories
