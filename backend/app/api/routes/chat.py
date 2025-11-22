from fastapi import APIRouter, HTTPException
from app.models.chat import ChatMessage, ChatResponse
from app.services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()


@router.post("/message", response_model=ChatResponse)
async def send_message(message: ChatMessage):
    """
    Process a chat message and return the response.
    
    - **content**: The user's message
    """
    try:
        response = await chat_service.process_message(message.content)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "chat"}

