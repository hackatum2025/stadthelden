from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.chat import ChatMessage, ChatResponse
from app.services.chat_service import ChatService
from app.core.database import get_database

router = APIRouter()


def get_chat_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> ChatService:
    """Dependency to get chat service."""
    return ChatService(db)


@router.post("/message", response_model=ChatResponse)
async def send_message(
    message: ChatMessage,
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Process a chat message and return the response.
    
    - **session_id**: The session ID (required)
    - **content**: The user's message
    """
    try:
        # Verify the session exists
        session = await chat_service.collection.find_one({"session_id": message.session_id})
        if not session:
            raise HTTPException(status_code=404, detail=f"Session {message.session_id} not found")
        
        response = await chat_service.process_message(message.session_id, message.content)
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "chat"}

