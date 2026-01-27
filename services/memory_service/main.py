"""
Sentra Memory Service - FastAPI Application

A persistent memory service for AI agents.

Run with: uvicorn memory_service.main:app --host 127.0.0.1 --port 9420 --reload
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import logging
import sys

from .config import get_settings
from .database import init_database, check_database_connection
from .routers import context_router, persona_router, notam_router, memory_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("=" * 60)
    logger.info(f"Starting {settings.service_name} v{settings.service_version}")
    logger.info("=" * 60)

    try:
        await init_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        logger.warning("Service will start but database operations will fail")

    yield

    # Shutdown
    logger.info("Shutting down service...")


# Create FastAPI app
app = FastAPI(
    title=settings.service_name,
    description="""
## Sentra Memory Service

A persistent memory service for AI agents with two-layer architecture.

### Layer 1 (Online - Always Available)
- **Persona**: User identity, traits, preferences
- **NOTAMs**: Critical notices that must be shown
- **Sessions**: Last activity context

### Layer 2 (On-Demand - Semantic Search)
- Vector-based semantic search
- Extracted facts, preferences, decisions
- Graph relationships between memories

### Usage

1. **Get Context (Layer 1)**:
   ```
   POST /context
   {"user_id": "chief"}
   ```

2. **Search Memories (Layer 2)**:
   ```
   POST /memory/search
   {"user_id": "chief", "query": "What framework did user prefer?"}
   ```

3. **Add Memory**:
   ```
   POST /memory/add
   {"user_id": "chief", "content": "User prefers React", "memory_type": "preference"}
   ```
    """,
    version=settings.service_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(context_router)
app.include_router(persona_router)
app.include_router(notam_router)
app.include_router(memory_router)


# Root endpoint
@app.get("/")
async def root():
    """Service information."""
    return {
        "service": settings.service_name,
        "version": settings.service_version,
        "status": "running",
        "docs": "/docs",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# Health check
@app.get("/health")
async def health():
    """Health check endpoint."""
    db_healthy = await check_database_connection()

    return {
        "status": "healthy" if db_healthy else "degraded",
        "service": settings.service_name,
        "version": settings.service_version,
        "database": db_healthy,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# Debug test endpoint - bypass all handlers
@app.get("/debug/test-add")
async def debug_test_add():
    """Debug endpoint to test add memory directly."""
    import traceback
    from .database import get_db_context
    from .services.search import SearchService

    try:
        async with get_db_context() as session:
            search_service = SearchService(session)
            memory = await search_service.add_memory(
                user_id="chief",
                content="Debug test memory",
                memory_type="fact",
                agent_id="debug",
                access_mode="private"
            )
            return {"success": True, "memory_id": str(memory.id)}
    except Exception as e:
        return {
            "success": False,
            "error": type(e).__name__,
            "detail": str(e),
            "traceback": traceback.format_exc()
        }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions."""
    import traceback
    import sys
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    traceback.print_exc(file=sys.stdout)  # Force print to stdout
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc)  # Always show detail for debugging
        }
    )


# Entry point for direct execution
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "memory_service.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
