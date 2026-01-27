"""
Run Sentra Memory Service

Usage: python -m memory_service.run
"""

import uvicorn
from .config import get_settings

settings = get_settings()

if __name__ == "__main__":
    print("=" * 60)
    print("  SENTRA MEMORY SERVICE")
    print("  Persistent Memory for AI Agents")
    print("=" * 60)
    print(f"  Starting server on http://localhost:{settings.port}")
    print(f"  API Docs: http://localhost:{settings.port}/docs")
    print("=" * 60)

    uvicorn.run(
        "memory_service.main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
