"""
Embedding Service - Generate vector embeddings for semantic search
"""

from typing import List, Optional
import logging
from functools import lru_cache

from ..config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Try to import sentence-transformers, fallback to simple TF-IDF if not available
try:
    from sentence_transformers import SentenceTransformer
    TRANSFORMER_AVAILABLE = True
except ImportError:
    TRANSFORMER_AVAILABLE = False
    logger.warning("sentence-transformers not available, using fallback embedder")


class EmbeddingService:
    """Service for generating text embeddings."""

    def __init__(self, model_name: Optional[str] = None):
        """Initialize embedding service."""
        self.model_name = model_name or settings.embedding_model
        self.dimension = settings.embedding_dimension
        self._model = None

        if TRANSFORMER_AVAILABLE:
            self._init_transformer()
        else:
            self._init_fallback()

    def _init_transformer(self):
        """Initialize sentence-transformers model."""
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            self._model = SentenceTransformer(self.model_name)
            self.dimension = self._model.get_sentence_embedding_dimension()
            logger.info(f"Embedding model loaded: {self.dimension}D")
        except Exception as e:
            logger.error(f"Failed to load transformer model: {e}")
            self._init_fallback()

    def _init_fallback(self):
        """Initialize fallback TF-IDF based embedder."""
        logger.info("Using fallback TF-IDF embedder")
        self._model = None
        self.dimension = settings.embedding_dimension

    def embed(self, text: str) -> List[float]:
        """Generate embedding for single text."""
        if self._model is not None:
            embedding = self._model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        else:
            return self._fallback_embed(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        if self._model is not None:
            embeddings = self._model.encode(texts, convert_to_numpy=True)
            return embeddings.tolist()
        else:
            return [self._fallback_embed(t) for t in texts]

    def _fallback_embed(self, text: str) -> List[float]:
        """Simple hash-based embedding fallback."""
        import hashlib

        # Create deterministic embedding from text hash
        text_bytes = text.lower().encode('utf-8')
        hash_obj = hashlib.sha384(text_bytes)
        hash_bytes = hash_obj.digest()

        # Convert to floats in [-1, 1] range
        embedding = []
        for i in range(0, len(hash_bytes), 1):
            val = (hash_bytes[i] - 128) / 128.0
            embedding.append(val)

        # Pad or truncate to match dimension
        while len(embedding) < self.dimension:
            # Extend with variations
            idx = len(embedding) % len(hash_bytes)
            val = (hash_bytes[idx] - 128 + len(embedding)) / 128.0
            embedding.append(max(-1, min(1, val)))

        return embedding[:self.dimension]

    def similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings."""
        import math

        dot_product = sum(a * b for a, b in zip(embedding1, embedding2))
        norm1 = math.sqrt(sum(a * a for a in embedding1))
        norm2 = math.sqrt(sum(b * b for b in embedding2))

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return dot_product / (norm1 * norm2)


# Singleton instance
_embedding_service: Optional[EmbeddingService] = None


def get_embedding_service() -> EmbeddingService:
    """Get or create embedding service singleton."""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
