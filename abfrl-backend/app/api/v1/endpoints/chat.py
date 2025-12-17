from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest, ChatResponse
from app.agents.master import MasterAgent
from app.models.chat import ChatSession, Message
from datetime import datetime
import json
import asyncio

router = APIRouter()

@router.post("/stream")
async def chat_stream_endpoint(request: ChatRequest):
    """Streaming chat endpoint for real-time responses"""
    user_id = request.user_id
    session_id = request.session_id or user_id  # Use provided session_id or fallback to user_id
    
    async def generate():
        try:
            # Get or Create Chat Session
            chat_session = await ChatSession.find_one(ChatSession.session_id == session_id)
            if not chat_session:
                chat_session = ChatSession(
                    user_id=user_id,
                    session_id=session_id,
                    channel=request.channel
                )
                await chat_session.save()
            
            # Get chat history
            chat_history = []
            for msg in chat_session.messages[-20:]:
                chat_history.append({
                    "role": msg.role,
                    "content": msg.content
                })
            
            # Process message
            agent = MasterAgent()
            result = await agent.process_message(request.message, chat_history, user_id)
            
            # Store user message
            user_msg = Message(
                role="user",
                content=request.message,
                timestamp=datetime.utcnow()
            )
            chat_session.messages.append(user_msg)
            
            # Get response
            response_content = result["response"]
            if isinstance(response_content, list):
                try:
                    response_content = response_content[0].get("text", str(response_content))
                except (IndexError, AttributeError):
                    response_content = str(response_content)
            
            # Stream response word by word
            words = response_content.split()
            for i, word in enumerate(words):
                chunk_data = {
                    "content": word + " ",
                    "done": False
                }
                yield f"data: {json.dumps(chunk_data)}\n\n"
                await asyncio.sleep(0.03)  # Typing effect delay
            
            # Send products and cart if available
            if result.get("products") or result.get("cart_summary"):
                final_data = {
                    "content": "",
                    "done": True,
                    "products": result.get("products", []),
                    "cart_summary": result.get("cart_summary")
                }
                yield f"data: {json.dumps(final_data)}\n\n"
            else:
                yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
            
            # Store AI message
            ai_msg = Message(
                role="ai",
                content=response_content,
                timestamp=datetime.utcnow()
            )
            chat_session.messages.append(ai_msg)
            await chat_session.save()
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            error_data = {"error": str(e), "done": True}
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    user_id = request.user_id
    
    # 1. Get or Create Chat Session (Persistent)
    chat_session = await ChatSession.find_one(ChatSession.user_id == user_id)
    if not chat_session:
        chat_session = ChatSession(
            user_id=user_id,
            session_id=user_id,  # Use user_id as session_id for simplicity
            channel=request.channel
        )
        await chat_session.save()
    
    # 2. Retrieve History from ChatSession messages
    # Get last 20 messages
    chat_history = []
    for msg in chat_session.messages[-20:]:  # Get last 20 messages
        chat_history.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # 3. Invoke Agent with history and user_id
    try:
        agent = MasterAgent()
        result = await agent.process_message(request.message, chat_history, user_id)
        
        # 4. Store conversation in ChatSession messages list
        user_msg = Message(
            role="user",
            content=request.message,
            timestamp=datetime.utcnow()
        )
        chat_session.messages.append(user_msg)
        
        # Ensure content is a string before saving to DB
        response_content = result["response"]
        if isinstance(response_content, list):
            # If it's a list (e.g. from LangChain), convert to string or extract text
            # For now, we'll just take the first text element if available, or str() it
            try:
                response_content = response_content[0].get("text", str(response_content))
            except (IndexError, AttributeError):
                response_content = str(response_content)

        ai_msg = Message(
            role="ai",
            content=response_content,
            timestamp=datetime.utcnow()
        )
        chat_session.messages.append(ai_msg)
        
        # Save the updated chat session with new messages
        await chat_session.save()
        
        return ChatResponse(
            response=response_content,
            products=result.get("products", []),
            cart_summary=result.get("cart_summary")
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{user_id}")
async def get_user_sessions(user_id: str):
    """Get all chat sessions for a user"""
    sessions = await ChatSession.find(ChatSession.user_id == user_id).sort("-created_at").to_list()
    return {
        "success": True,
        "sessions": [{
            "session_id": s.session_id,
            "created_at": s.created_at.isoformat(),
            "message_count": len(s.messages),
            "title": s.messages[0].content[:50] if s.messages else "New Chat"
        } for s in sessions]
    }

@router.post("/sessions")
async def create_new_session(request: dict):
    """Create a new chat session"""
    user_id = request.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    
    import uuid
    session_id = f"{user_id}_{uuid.uuid4().hex[:8]}"
    
    chat_session = ChatSession(
        user_id=user_id,
        session_id=session_id,
        channel="web"
    )
    await chat_session.save()
    
    return {
        "success": True,
        "session_id": session_id,
        "created_at": chat_session.created_at.isoformat()
    }

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history for a specific session from MongoDB"""
    chat_session = await ChatSession.find_one(ChatSession.session_id == session_id)
    if chat_session and chat_session.messages:
        messages = [{
            "role": msg.role,
            "content": msg.content,
            "timestamp": msg.timestamp.isoformat()
        } for msg in chat_session.messages]
        return {"success": True, "messages": messages}
    return {"success": True, "messages": []}

@router.delete("/history/{user_id}")
async def clear_chat_history(user_id: str):
    """Clear chat history for a user"""
    chat_session = await ChatSession.find_one(ChatSession.user_id == user_id)
    if chat_session:
        # Clear messages list
        chat_session.messages = []
        await chat_session.save()
        return {"status": "success", "message": "Chat history cleared"}
    return {"status": "success", "message": "No history found"}