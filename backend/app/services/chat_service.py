from app.models.chat import ChatResponse


class ChatService:
    """Service for handling chat logic."""
    
    @staticmethod
    async def process_message(content: str) -> ChatResponse:
        """
        Process a chat message and return appropriate response.
        
        Args:
            content: The user's message content
            
        Returns:
            ChatResponse with code and message
        """
        # Mock logic - replace with real AI/processing later
        if len(content) < 20:
            return ChatResponse(
                code="refine",
                message="Could you please provide more details about how you'd like to help? The more specific you are, the better we can assist you!"
            )
        
        return ChatResponse(
            code="finish",
            message="Thank you for your contribution! We've recorded your idea and will get back to you soon."
        )

