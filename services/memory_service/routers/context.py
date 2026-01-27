"""
Context Router - Layer 1 combined endpoint
Returns persona + NOTAMs + last session activity
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
import logging

from ..database import get_db
from ..models import Persona, Notam, Session
from ..schemas.requests import ContextRequest
from ..schemas.responses import (
    ContextResponse,
    PersonaResponse,
    NotamResponse,
    SessionResponse
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/context", tags=["Context (Layer 1)"])


@router.post("", response_model=ContextResponse)
async def get_context(
    request: ContextRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Get full user context for AI prompt injection.

    This is the main Layer 1 endpoint - returns everything an AI agent
    needs to know about the user before starting a conversation.

    Returns:
        - Persona (traits, preferences, style)
        - Active NOTAMs (critical notices)
        - Last session activity
    """
    user_id = request.user_id

    # Get or create persona
    persona_result = await db.execute(
        select(Persona).where(Persona.user_id == user_id)
    )
    persona = persona_result.scalar_one_or_none()

    persona_response = None
    if persona:
        persona_response = PersonaResponse(
            id=str(persona.id),
            user_id=persona.user_id,
            name=persona.name,
            traits=persona.traits or {},
            preferences=persona.preferences or {},
            style=persona.style or {},
            created_at=persona.created_at,
            updated_at=persona.updated_at
        )

    # Get active NOTAMs
    notams_response = []
    if request.include_notams:
        notams_result = await db.execute(
            select(Notam)
            .where(Notam.user_id == user_id)
            .where(Notam.active == True)
            .order_by(
                # Priority order: critical > high > normal > low > info
                Notam.priority.desc(),
                Notam.created_at.desc()
            )
        )
        notams = notams_result.scalars().all()

        for notam in notams:
            # Skip expired NOTAMs
            if notam.expires_at and notam.expires_at < datetime.now(timezone.utc):
                continue

            notams_response.append(NotamResponse(
                id=str(notam.id),
                user_id=notam.user_id,
                title=notam.title,
                content=notam.content,
                priority=notam.priority,
                category=notam.category,
                active=notam.active,
                expires_at=notam.expires_at,
                created_at=notam.created_at
            ))

    # Get last session
    session_response = None
    if request.include_session:
        # Get most recent session, optionally filtered by agent type
        session_query = select(Session).where(Session.user_id == user_id)
        if request.agent_type:
            session_query = session_query.where(Session.agent_type == request.agent_type)
        session_query = session_query.order_by(Session.updated_at.desc()).limit(1)

        session_result = await db.execute(session_query)
        session = session_result.scalar_one_or_none()

        if session:
            session_response = SessionResponse(
                id=str(session.id),
                user_id=session.user_id,
                agent_type=session.agent_type,
                agent_name=session.agent_name,
                last_query=session.last_query,
                last_response_summary=session.last_response_summary,
                context=session.context or {},
                updated_at=session.updated_at
            )

    # Update session with current request info
    if request.agent_type or request.agent_name:
        await _update_session(
            db,
            user_id,
            request.agent_type,
            request.agent_name
        )

    return ContextResponse(
        user_id=user_id,
        persona=persona_response,
        notams=notams_response,
        last_session=session_response,
        retrieved_at=datetime.now(timezone.utc)
    )


@router.post("/prompt", response_model=dict)
async def get_context_as_prompt(
    request: ContextRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Get user context formatted as prompt injection text.

    Returns ready-to-use text that can be inserted into AI system prompts.
    """
    context = await get_context(request, db)
    return {
        "user_id": context.user_id,
        "prompt_section": context.to_prompt_section(),
        "retrieved_at": context.retrieved_at.isoformat()
    }


async def _update_session(
    db: AsyncSession,
    user_id: str,
    agent_type: str = None,
    agent_name: str = None
):
    """Update or create session record."""
    try:
        # Find existing session for this user/agent combo
        query = select(Session).where(Session.user_id == user_id)
        if agent_type:
            query = query.where(Session.agent_type == agent_type)

        result = await db.execute(query)
        session = result.scalar_one_or_none()

        if session:
            session.updated_at = datetime.now(timezone.utc)
            if agent_name:
                session.agent_name = agent_name
        else:
            session = Session(
                user_id=user_id,
                agent_type=agent_type,
                agent_name=agent_name
            )
            db.add(session)

        await db.commit()
    except Exception as e:
        logger.warning(f"Failed to update session: {e}")
