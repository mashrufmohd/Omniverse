"""
Recommendation service using vector store.
"""

from typing import List

from .vector_store import VectorStoreService


class RecommendationService:
    """
    Service for product recommendations.
    """

    @staticmethod
    def get_recommendations(query: str) -> List[str]:
        """
        Get product recommendations based on query.
        """
        return VectorStoreService.search(query)