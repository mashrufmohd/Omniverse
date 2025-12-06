"""
LLM client for interacting with Gemini using LangChain.
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from typing import List

from ..core.config import settings


class LLMClient:
    """
    Client for LLM interactions with conversation memory.
    """
    
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.7,
            convert_system_message_to_human=True
        )
        
    def generate_response(self, prompt: str, chat_history: List = None) -> str:
        """
        Generate a response from the LLM with conversation context.
        """
        try:
            messages = [
                SystemMessage(content="""You are a helpful and friendly retail shopping assistant for ABFRL (Aditya Birla Fashion and Retail). 
                Your role is to help customers find products, answer questions about items, check availability, and assist with purchases.
                Be conversational, helpful, and provide detailed product information when asked.
                When customers ask about specific products, provide details about materials, fit, styling suggestions, and care instructions.
                If they want to add items to cart or make purchases, acknowledge and guide them.""")
            ]
            
            # Add chat history if provided
            if chat_history:
                for msg in chat_history:
                    if msg.get("role") == "user":
                        messages.append(HumanMessage(content=msg.get("content", "")))
                    elif msg.get("role") == "ai":
                        messages.append(AIMessage(content=msg.get("content", "")))
            
            # Add current prompt
            messages.append(HumanMessage(content=prompt))
            
            response = self.llm.invoke(messages)
            return response.content
            
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return "I'm here to help! However, I'm experiencing technical difficulties. Please try again or contact support."