"""
LLM client for interacting with Gemini directly (no LangChain retries).
"""

import google.generativeai as genai
from typing import List, Dict
from google.api_core.exceptions import ResourceExhausted

import logging
import time
from datetime import datetime, timedelta
try:
    from google.generativeai.types import generation_types
    StopCandidateException = generation_types.StopCandidateException
except Exception:
    StopCandidateException = None

logger = logging.getLogger(__name__)

from ..core.config import settings


class LLMClient:
    """
    Client for LLM interactions using Google Generative AI SDK directly (bypasses LangChain retries).
    """
    
    def __init__(self):
        # Configure Google Generative AI SDK directly
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self.model = genai.GenerativeModel(
            model_name='gemini-2.5-flash',  # Use gemini-2.0-flash if 2.5 not available
            generation_config={
                'temperature': 0.7,
                'top_p': 0.95,
                'top_k': 40,
                'max_output_tokens': 8192,
            }
        )
        
        # System prompt as constant
        self.system_prompt = """You are a helpful and friendly retail shopping assistant for ABFRL (Aditya Birla Fashion and Retail).
Your role is to help customers find products, answer questions about items, check availability, and assist with purchases.
Be conversational, helpful, and provide detailed product information when asked.

CRITICAL GUIDELINES (Tool-first, non-hallucinating):
- NEVER assume or hallucinate transactional state such as carts, orders, payments, or inventory.
- ALWAYS use the backend tools to fetch authoritative data for cart, orders, payments, and inventory.
- For cart/order/payment intents, the system should call the corresponding tool first and use the tool result to reply.
- If the tool cannot be called or returns an error, respond with a clear, deterministic message: e.g., "I couldn't fetch your cart right now — please try again.".
- Do NOT rely on remembered conversation state for transactional facts.
- If asked about cart contents, do not fabricate details; say the cart is empty if the backend returns no items.
These rules are mandatory and override normal creative behavior."""
        
        # Circuit-breaker state for quota handling
        self._fail_count = 0
        self._disabled_until = None
        self._base_backoff_seconds = 60
        self._fail_threshold = 1
        self._quota_exhausted_until = None

    def _is_disabled(self) -> bool:
        """Check if the LLM service is currently disabled by the circuit breaker."""
        # Check daily quota exhaustion first (longer block)
        if self._quota_exhausted_until and time.time() < self._quota_exhausted_until:
            return True
        # Check regular circuit breaker
        if self._disabled_until is None:
            return False
        return time.time() < self._disabled_until

    def _record_failure_and_backoff(self, reason: str):
        """Record a failure and calculate exponential backoff time."""
        self._fail_count += 1
        backoff = self._base_backoff_seconds * (2 ** max(0, self._fail_count - 1))
        self._disabled_until = time.time() + backoff
        logger.warning("LLM temporarily disabled for %s seconds due to: %s", backoff, reason)
        
    def generate_response(self, prompt: str, chat_history: List[Dict] = None) -> str:
        """
        Generate a response from the LLM with conversation context using Google Generative AI SDK directly.
        No LangChain retries - fast fail on quota errors.
        """
        # Fast-fail if circuit is open
        if self._is_disabled():
            remaining_time = int(max(self._disabled_until or 0, self._quota_exhausted_until or 0) - time.time())
            logger.info("LLM call blocked by circuit breaker for %s more seconds", remaining_time)
            if self._quota_exhausted_until:
                return "⚠️ **Daily AI Limit Reached**\n\nThe AI assistant has used all 20 free requests for today. Please wait 24 hours or upgrade to a paid plan."
            return f"The AI service is temporarily unavailable. Please try again in {remaining_time} seconds."

        # Build conversation history in Gemini format
        history = []
        
        # Add chat history if provided
        if chat_history:
            for msg in chat_history:
                role = "user" if msg.get("role") == "user" else "model"
                content = msg.get("content", "")
                if content.strip():  # Only add non-empty messages
                    history.append({"role": role, "parts": [content]})

        try:
            # Start chat with history
            chat = self.model.start_chat(history=history)
            
            # Send message with system prompt prepended
            full_prompt = f"{self.system_prompt}\n\nUser: {prompt}"
            response = chat.send_message(full_prompt)

            # Reset failure counters on success
            self._fail_count = 0
            self._disabled_until = None
            self._quota_exhausted_until = None

            # Handle tool calls if any
            if hasattr(response, 'tool_calls') and response.tool_calls:
                # For now, we'll just return the tool call info or handle it simply
                pass

            # Reset counters on success
            self._fail_count = 0
            self._disabled_until = None
            self._quota_exhausted_until = None
            
            return response.text

        except ResourceExhausted as e:
            # Catch ResourceExhausted (429) immediately - no retries with direct SDK
            error_msg = str(e)
            logger.error("🚫 Gemini API quota exhausted (fast-fail): %s", error_msg)
            
            # Check if it's the daily quota (20 requests/day)
            if 'per day' in error_msg.lower() or 'generaterequestsperdayperprojectpermodel' in error_msg.replace(' ', '').replace('-','').lower():
                # Daily quota exhausted - disable for 24 hours
                self._quota_exhausted_until = time.time() + 86400
                logger.error("Daily Gemini API quota (20 requests) exhausted. Service disabled for 24 hours.")
                return "⚠️ **Daily AI Limit Reached**\n\nThe AI assistant has used all 20 free requests today. The quota resets in 24 hours.\n\n**Options:**\n- Wait for tomorrow's quota reset\n- Upgrade to paid Gemini API\n- Browse products without AI"
            else:
                # Per-minute quota
                self._record_failure_and_backoff(error_msg)
                return "The AI service is busy. Please try again in a minute."
                
        except Exception as e:
            error_msg = str(e)
            logger.exception("Error calling Gemini API: %s", error_msg)
            
            # Check for quota-related errors
            if any(keyword in error_msg.lower() for keyword in ['quota', 'exceed', 'rate limit', '429']):
                self._record_failure_and_backoff(error_msg)
                return "The AI service is temporarily unavailable due to high usage. Please try again shortly."

            # Handle StopCandidateException
            if StopCandidateException and isinstance(e, StopCandidateException):
                logger.warning("Gemini blocked response (StopCandidateException): %s", e)
                return "I'm unable to generate a response to that. Could you try rephrasing your question?"

            # Generic error
            self._record_failure_and_backoff(error_msg)
            return "I'm experiencing technical difficulties. Please try again in a moment."