"""
LLM client for interacting with Gemini.
"""

import google.generativeai as genai

from ..core.config import settings

genai.configure(api_key=settings.GOOGLE_API_KEY)


class LLMClient:
    """
    Client for LLM interactions.
    """

    @staticmethod
    def generate_response(prompt: str) -> str:
        """
        Generate a response from the LLM.
        """
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text