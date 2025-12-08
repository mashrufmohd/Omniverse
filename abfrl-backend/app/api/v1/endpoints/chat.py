from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from langchain_core.messages import HumanMessage
from app.db.session import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.agents.master import MasterAgent
from app.models.chat import ChatSession, Message
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    user_id = request.user_id
    
    # 1. Get or Create Chat Session (Persistent)
    chat_session = db.query(ChatSession).filter(ChatSession.session_id == user_id).first()
    if not chat_session:
        chat_session = ChatSession(session_id=user_id, channel=request.channel)
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)
    
    # 2. Retrieve History from DB
    # Get last 20 messages ordered by timestamp
    db_messages = db.query(Message).filter(
        Message.session_id == chat_session.id
    ).order_by(Message.timestamp.asc()).limit(20).all()
    
    chat_history = []
    for msg in db_messages:
        chat_history.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # 3. Invoke Agent with history and user_id
    try:
        agent = MasterAgent(db)
        result = agent.process_message(request.message, chat_history, user_id)
        
        # 4. Store conversation in DB
        user_msg = Message(
            session_id=chat_session.id,
            role="user",
            content=request.message,
            timestamp=datetime.utcnow()
        )
        db.add(user_msg)
        
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
            session_id=chat_session.id,
            role="ai",
            content=response_content,
            timestamp=datetime.utcnow()
        )
        db.add(ai_msg)
        db.commit()
        
        return ChatResponse(
            response=response_content,
            products=result.get("products", []),
            cart_summary=result.get("cart_summary")
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history/{user_id}")
async def clear_chat_history(user_id: str, db: Session = Depends(get_db)):
    """Clear chat history for a user"""
    chat_session = db.query(ChatSession).filter(ChatSession.session_id == user_id).first()
    if chat_session:
        # Delete all messages
        db.query(Message).filter(Message.session_id == chat_session.id).delete()
        db.commit()
        return {"status": "success", "message": "Chat history cleared"}
    return {"status": "success", "message": "No history found"}