"""
Vector store service using Qdrant.
"""

from typing import List

from qdrant_client import QdrantClient

from ..core.config import settings


class VectorStoreService:
    """
    Service for vector store operations.
    """
    client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)

    @staticmethod
    def search(query: str) -> List[str]:
        """
        Search for recommendations in vector store.
        """
        # Mock implementation; in production, embed query and search
        return ["product1", "product2"]