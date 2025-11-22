from datetime import datetime
from typing import Literal
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.chat import ChatResponse
from app.models.session import ChatMessage as SessionChatMessage
from app.core.config import settings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    api_key=settings.GEMINI_API_KEY,
    convert_system_message_to_human=True
)


class ChatService:
    """Service for handling chat logic."""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.collection = self.db.sessions
    
    async def process_message(self, session_id: str, content: str) -> ChatResponse:
        """
        Process a chat message and return appropriate response.
        
        Args:
            session_id: The session ID to store messages in
            content: The user's message content
            
        Returns:
            ChatResponse with code, message, and session_id
        """
        now = datetime.utcnow().isoformat()
        
        # Create user message
        user_message = SessionChatMessage(
            role="user",
            content=content,
            timestamp=now
        )
        
        # Store user message in session
        await self.collection.update_one(
            {"session_id": session_id},
            {
                "$push": {"chat_messages": user_message.model_dump()},
                "$set": {"updated_at": now}
            }
        )
        
        # Mock logic - replace with real AI/processing later
        response_code: Literal["refine", "finish"]
        if len(content) < 20:
            response_content = "Could you please provide more details about how you'd like to help? The more specific you are, the better we can assist you!"
            response_code = "refine"
        else:
            response_content = "Thank you for your contribution! We've recorded your idea and will get back to you soon."
            response_code = "finish"
        
        # Create assistant message
        assistant_message = SessionChatMessage(
            role="assistant",
            content=response_content,
            timestamp=datetime.utcnow().isoformat()
        )
        
        # Store assistant message in session
        await self.collection.update_one(
            {"session_id": session_id},
            {
                "$push": {"chat_messages": assistant_message.model_dump()},
                "$set": {"updated_at": datetime.utcnow().isoformat()}
            }
        )
        
        return ChatResponse(
            session_id=session_id,
            code=response_code,
            message=response_content
        )

