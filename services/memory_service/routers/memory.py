"""
Memory Router - Layer 2 semantic memory operations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from datetime import datetime, timezone
import logging

from ..database import get_db
from ..models import Memory
from ..services.search import SearchService
from ..schemas.requests import MemorySearch, MemoryAdd
from ..schemas.responses import (
    MemoryResponse,
    MemorySearchResult,
    MemorySearchResponse,
    MemoryAddResponse
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/memory", tags=["Memory (Layer 2)"])


@router.post("/search", response_model=MemorySearchResponse)
async def search_memories(
    request: MemorySearch,
    db: AsyncSession = Depends(get_db)
):
    """
    Semantic search across memories with agent isolation.

    Agent isolation:
    - If agent_id provided: returns only agent's own memories + shared memories
    - If no agent_id: returns all memories (admin mode)
    """
    search_service = SearchService(db)

    results, search_time_ms = await search_service.search(
        user_id=request.user_id,
        query=request.query,
        agent_id=request.agent_id,
        memory_types=request.memory_types,
        limit=request.limit,
        threshold=request.threshold,
        include_shared=request.include_shared
    )

    search_results = []
    for memory, similarity in results:
        search_results.append(MemorySearchResult(
            memory=MemoryResponse(
                id=str(memory.id),
                user_id=memory.user_id,
                agent_id=memory.agent_id,
                access_mode=memory.access_mode,
                content=memory.content,
                memory_type=memory.memory_type,
                importance=memory.importance,
                metadata=memory.extra_data or {},
                created_at=memory.created_at,
                accessed_at=memory.accessed_at,
                access_count=memory.access_count
            ),
            similarity=similarity
        ))

    return MemorySearchResponse(
        user_id=request.user_id,
        query=request.query,
        results=search_results,
        total_found=len(search_results),
        search_time_ms=search_time_ms
    )


@router.post("/add", response_model=MemoryAddResponse, status_code=status.HTTP_201_CREATED)
async def add_memory(
    request: MemoryAdd,
    db: AsyncSession = Depends(get_db)
):
    """
    Add new memory with automatic embedding generation and agent isolation.

    access_mode:
    - "private": only this agent can see it
    - "shared": all agents can see it
    """
    import traceback
    import sys

    logger.info(f"=== ADD MEMORY REQUEST ===")
    logger.info(f"user_id={request.user_id}, agent_id={request.agent_id}, type={request.memory_type}")

    try:
        logger.info("Creating SearchService...")
        search_service = SearchService(db)

        logger.info("Calling add_memory...")
        memory = await search_service.add_memory(
            user_id=request.user_id,
            content=request.content,
            memory_type=request.memory_type,
            agent_id=request.agent_id,
            access_mode=request.access_mode,
            importance=request.importance,
            metadata=request.metadata,
            source_conversation_id=request.source_conversation_id
        )

        logger.info(f"Memory added successfully: {memory.id}")

        return MemoryAddResponse(
            success=True,
            memory_id=str(memory.id),
            message=f"Memory added for agent {request.agent_id} (mode: {request.access_mode})"
        )
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        logger.error(f"!!! FAILED to add memory: {error_msg}")
        traceback.print_exc(file=sys.stdout)
        raise HTTPException(status_code=500, detail=error_msg)


@router.get("/{memory_id}", response_model=MemoryResponse)
async def get_memory(
    memory_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get specific memory by ID."""
    result = await db.execute(
        select(Memory).where(Memory.id == memory_id)
    )
    memory = result.scalar_one_or_none()

    if not memory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Memory not found: {memory_id}"
        )

    # Record access
    memory.record_access()
    await db.commit()

    return MemoryResponse(
        id=str(memory.id),
        user_id=memory.user_id,
        agent_id=memory.agent_id,
        access_mode=memory.access_mode,
        content=memory.content,
        memory_type=memory.memory_type,
        importance=memory.importance,
        metadata=memory.extra_data or {},
        created_at=memory.created_at,
        accessed_at=memory.accessed_at,
        access_count=memory.access_count
    )


@router.get("", response_model=List[MemoryResponse])
async def list_memories(
    user_id: str,
    agent_id: str = None,
    memory_type: str = None,
    include_shared: bool = True,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    List memories for a user with optional agent isolation.

    - agent_id: filter to specific agent (+ shared if include_shared=True)
    - include_shared: include shared memories when filtering by agent_id
    """
    query = select(Memory).where(Memory.user_id == user_id)

    # Agent isolation
    if agent_id:
        if include_shared:
            from sqlalchemy import or_
            query = query.where(
                or_(Memory.agent_id == agent_id, Memory.access_mode == "shared")
            )
        else:
            query = query.where(Memory.agent_id == agent_id)

    if memory_type:
        query = query.where(Memory.memory_type == memory_type)

    query = query.order_by(Memory.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    memories = result.scalars().all()

    return [
        MemoryResponse(
            id=str(memory.id),
            user_id=memory.user_id,
            agent_id=memory.agent_id,
            access_mode=memory.access_mode,
            content=memory.content,
            memory_type=memory.memory_type,
            importance=memory.importance,
            metadata=memory.extra_data or {},
            created_at=memory.created_at,
            accessed_at=memory.accessed_at,
            access_count=memory.access_count
        )
        for memory in memories
    ]


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(
    memory_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete memory."""
    result = await db.execute(
        select(Memory).where(Memory.id == memory_id)
    )
    memory = result.scalar_one_or_none()

    if not memory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Memory not found: {memory_id}"
        )

    await db.delete(memory)
    await db.commit()

    logger.info(f"Deleted memory: {memory_id}")


@router.post("/batch", response_model=dict)
async def add_memories_batch(
    user_id: str,
    memories: List[MemoryAdd],
    db: AsyncSession = Depends(get_db)
):
    """Add multiple memories in batch with agent isolation."""
    search_service = SearchService(db)

    # Use optimized batch service method
    added_memories = await search_service.add_memories_batch(
        user_id=user_id,
        memories_data=memories
    )

    added_ids = [str(m.id) for m in added_memories]

    return {
        "success": True,
        "added_count": len(added_ids),
        "memory_ids": added_ids
    }
