"""
LLM client for interacting with Gemini using LangChain.
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain.memory import ConversationBufferMemory
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
            
            # Bind tools to the LLM - DISABLED for now as MasterAgent handles logic
            # try:
            #     from app.agents.tools import get_cart_items, search_products, check_inventory, get_loyalty_offers
            #     tools = [get_cart_items, search_products, check_inventory, get_loyalty_offers]
            #     llm_with_tools = self.llm.bind_tools(tools)
            #     response = llm_with_tools.invoke(messages)
            # except Exception as tool_error:
            #     import traceback
            #     traceback.print_exc()
            #     print(f"Tool binding/invocation failed, falling back to standard LLM: {tool_error}")
            #     # Fallback to standard invoke without tools
            #     response = self.llm.invoke(messages)
            
            response = self.llm.invoke(messages)

            # Handle tool calls if any
            if hasattr(response, 'tool_calls') and response.tool_calls:
                # For now, we'll just return the tool call info or handle it simply
                # In a full implementation, we'd execute the tool and feed the result back
                # But since the MasterAgent handles logic manually, we might not need full tool execution loop here yet
                pass

            return response.content
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Error calling Gemini API: {e}")
            return "I'm here to help! However, I'm experiencing technical difficulties. Please try again or contact support."