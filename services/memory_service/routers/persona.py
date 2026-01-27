"""
Persona Router - Manage user personas
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from ..database import get_db
from ..models import Persona
from ..schemas.requests import PersonaCreate, PersonaUpdate
from ..schemas.responses import PersonaResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/persona", tags=["Persona"])


@router.get("/{user_id}", response_model=PersonaResponse)
async def get_persona(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get user persona by user_id."""
    result = await db.execute(
        select(Persona).where(Persona.user_id == user_id)
    )
    persona = result.scalar_one_or_none()

    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Persona not found for user: {user_id}"
        )

    return PersonaResponse(
        id=str(persona.id),
        user_id=persona.user_id,
        name=persona.name,
        traits=persona.traits or {},
        preferences=persona.preferences or {},
        style=persona.style or {},
        created_at=persona.created_at,
        updated_at=persona.updated_at
    )


@router.post("", response_model=PersonaResponse, status_code=status.HTTP_201_CREATED)
async def create_persona(
    request: PersonaCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create new user persona."""
    # Check if persona already exists
    existing = await db.execute(
        select(Persona).where(Persona.user_id == request.user_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Persona already exists for user: {request.user_id}"
        )

    persona = Persona(
        user_id=request.user_id,
        name=request.name,
        traits=request.traits,
        preferences=request.preferences,
        style=request.style
    )

    db.add(persona)
    await db.commit()
    await db.refresh(persona)

    logger.info(f"Created persona for user: {request.user_id}")

    return PersonaResponse(
        id=str(persona.id),
        user_id=persona.user_id,
        name=persona.name,
        traits=persona.traits or {},
        preferences=persona.preferences or {},
        style=persona.style or {},
        created_at=persona.created_at,
        updated_at=persona.updated_at
    )


@router.put("/{user_id}", response_model=PersonaResponse)
async def update_persona(
    user_id: str,
    request: PersonaUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update existing persona."""
    result = await db.execute(
        select(Persona).where(Persona.user_id == user_id)
    )
    persona = result.scalar_one_or_none()

    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Persona not found for user: {user_id}"
        )

    # Update fields if provided
    if request.name is not None:
        persona.name = request.name
    if request.traits is not None:
        persona.traits = {**persona.traits, **request.traits} if persona.traits else request.traits
    if request.preferences is not None:
        persona.preferences = {**persona.preferences, **request.preferences} if persona.preferences else request.preferences
    if request.style is not None:
        persona.style = {**persona.style, **request.style} if persona.style else request.style

    await db.commit()
    await db.refresh(persona)

    logger.info(f"Updated persona for user: {user_id}")

    return PersonaResponse(
        id=str(persona.id),
        user_id=persona.user_id,
        name=persona.name,
        traits=persona.traits or {},
        preferences=persona.preferences or {},
        style=persona.style or {},
        created_at=persona.created_at,
        updated_at=persona.updated_at
    )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_persona(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete user persona."""
    result = await db.execute(
        select(Persona).where(Persona.user_id == user_id)
    )
    persona = result.scalar_one_or_none()

    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Persona not found for user: {user_id}"
        )

    await db.delete(persona)
    await db.commit()

    logger.info(f"Deleted persona for user: {user_id}")
