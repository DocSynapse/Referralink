"""
NOTAM Router - Manage critical notices
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
import logging

from ..database import get_db
from ..models import Notam
from ..schemas.requests import NotamCreate, NotamUpdate
from ..schemas.responses import NotamResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notam", tags=["NOTAM"])


@router.get("", response_model=List[NotamResponse])
async def list_notams(
    user_id: str = Query(..., description="User ID"),
    active_only: bool = Query(True, description="Only return active NOTAMs"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db)
):
    """List NOTAMs for a user."""
    query = select(Notam).where(Notam.user_id == user_id)

    if active_only:
        query = query.where(Notam.active == True)

    if category:
        query = query.where(Notam.category == category)

    query = query.order_by(Notam.priority.desc(), Notam.created_at.desc())

    result = await db.execute(query)
    notams = result.scalars().all()

    return [
        NotamResponse(
            id=str(notam.id),
            user_id=notam.user_id,
            title=notam.title,
            content=notam.content,
            priority=notam.priority,
            category=notam.category,
            active=notam.active,
            expires_at=notam.expires_at,
            created_at=notam.created_at
        )
        for notam in notams
    ]


@router.get("/{notam_id}", response_model=NotamResponse)
async def get_notam(
    notam_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get specific NOTAM by ID."""
    result = await db.execute(
        select(Notam).where(Notam.id == notam_id)
    )
    notam = result.scalar_one_or_none()

    if not notam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"NOTAM not found: {notam_id}"
        )

    return NotamResponse(
        id=str(notam.id),
        user_id=notam.user_id,
        title=notam.title,
        content=notam.content,
        priority=notam.priority,
        category=notam.category,
        active=notam.active,
        expires_at=notam.expires_at,
        created_at=notam.created_at
    )


@router.post("", response_model=NotamResponse, status_code=status.HTTP_201_CREATED)
async def create_notam(
    request: NotamCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create new NOTAM."""
    notam = Notam(
        user_id=request.user_id,
        title=request.title,
        content=request.content,
        priority=request.priority,
        category=request.category,
        expires_at=request.expires_at
    )

    db.add(notam)
    await db.commit()
    await db.refresh(notam)

    logger.info(f"Created NOTAM '{request.title}' for user: {request.user_id}")

    return NotamResponse(
        id=str(notam.id),
        user_id=notam.user_id,
        title=notam.title,
        content=notam.content,
        priority=notam.priority,
        category=notam.category,
        active=notam.active,
        expires_at=notam.expires_at,
        created_at=notam.created_at
    )


@router.put("/{notam_id}", response_model=NotamResponse)
async def update_notam(
    notam_id: UUID,
    request: NotamUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update existing NOTAM."""
    result = await db.execute(
        select(Notam).where(Notam.id == notam_id)
    )
    notam = result.scalar_one_or_none()

    if not notam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"NOTAM not found: {notam_id}"
        )

    # Update fields if provided
    if request.title is not None:
        notam.title = request.title
    if request.content is not None:
        notam.content = request.content
    if request.priority is not None:
        notam.priority = request.priority
    if request.category is not None:
        notam.category = request.category
    if request.active is not None:
        notam.active = request.active
    if request.expires_at is not None:
        notam.expires_at = request.expires_at

    await db.commit()
    await db.refresh(notam)

    logger.info(f"Updated NOTAM: {notam_id}")

    return NotamResponse(
        id=str(notam.id),
        user_id=notam.user_id,
        title=notam.title,
        content=notam.content,
        priority=notam.priority,
        category=notam.category,
        active=notam.active,
        expires_at=notam.expires_at,
        created_at=notam.created_at
    )


@router.delete("/{notam_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notam(
    notam_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete NOTAM."""
    result = await db.execute(
        select(Notam).where(Notam.id == notam_id)
    )
    notam = result.scalar_one_or_none()

    if not notam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"NOTAM not found: {notam_id}"
        )

    await db.delete(notam)
    await db.commit()

    logger.info(f"Deleted NOTAM: {notam_id}")


@router.post("/{notam_id}/deactivate", response_model=NotamResponse)
async def deactivate_notam(
    notam_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Deactivate NOTAM without deleting."""
    result = await db.execute(
        select(Notam).where(Notam.id == notam_id)
    )
    notam = result.scalar_one_or_none()

    if not notam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"NOTAM not found: {notam_id}"
        )

    notam.active = False
    await db.commit()
    await db.refresh(notam)

    logger.info(f"Deactivated NOTAM: {notam_id}")

    return NotamResponse(
        id=str(notam.id),
        user_id=notam.user_id,
        title=notam.title,
        content=notam.content,
        priority=notam.priority,
        category=notam.category,
        active=notam.active,
        expires_at=notam.expires_at,
        created_at=notam.created_at
    )
