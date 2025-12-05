from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from langchain_core.messages import HumanMessage
from app.db.session import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.agents.master import MasterAgent

router = APIRouter()

# In-memory history for MVP (Replace with Redis/Postgres in Prod)
chat_history_store = {}

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    user_id = request.user_id
    
    # 1. Retrieve History
    if user_id not in chat_history_store:
        chat_history_store[user_id] = []
    
    # 2. Prepare Input
    current_history = chat_history_store[user_id]
    current_history.append(HumanMessage(content=request.message))
    
    # 3. Invoke Agent
    try:
        agent = MasterAgent(db)
        response_text = agent.process_message(request.message)
        
        # 4. Parse for Product Cards (Simple Logic for MVP)
        products = [] 
        # Logic: If agent mentioned products, fetch them
        
        return ChatResponse(
            response_text=response_text,
            suggested_products=products
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))