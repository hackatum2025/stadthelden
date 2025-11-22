from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatMessage(BaseModel):
    """A chat message in the session."""
    role: str  # "user" or "assistant"
    content: str
    timestamp: str

class SessionData(BaseModel):
    """Session data stored in the database."""
    session_id: str
    chat_messages: List[ChatMessage] = []
    foundation_results: List[Dict[str, Any]] = []
    current_foundation_id: Optional[str] = None
    project_query: Optional[str] = None
    created_at: str
    updated_at: str

class CreateSessionRequest(BaseModel):
    """Request to create or update a session."""
    chat_messages: List[ChatMessage] = []
    foundation_results: List[Dict[str, Any]] = []
    current_foundation_id: Optional[str] = None
    project_query: Optional[str] = None

class SessionResponse(BaseModel):
    """Response containing session data."""
    success: bool
    session_id: str
    data: Optional[SessionData] = None
    message: Optional[str] = None

