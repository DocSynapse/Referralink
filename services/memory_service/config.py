"""
Sentra Memory Service - Configuration
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # Service
    service_name: str = "Sentra Memory Service"
    service_version: str = "1.0.0"
    debug: bool = True  # Temporarily enable for debugging

    # Server
    host: str = "0.0.0.0"
    port: int = 9420

    # Database
    database_url: str = "postgresql+asyncpg://sentra:sentra_memory_2026@localhost:5432/memory"

    # Embeddings
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dimension: int = 384

    # Search
    default_search_limit: int = 5
    max_search_limit: int = 20
    similarity_threshold: float = 0.3

    # Layer 1 Cache TTL (seconds)
    persona_cache_ttl: int = 300
    notam_cache_ttl: int = 60
    session_cache_ttl: int = 30

    # API Security
    api_key: str = "sentra-memory-key-2026"
    require_auth: bool = False  # Set True for production

    class Config:
        env_file = ".env"
        env_prefix = "MEMORY_"
        extra = "ignore"  # Ignore extra env vars from other services


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
