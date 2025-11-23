from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatMessage(BaseModel):
    """A chat message in the session."""
    role: str  # "user" or "assistant"
    content: str
    timestamp: str

class ApplicationDocument(BaseModel):
    """An application document with its content and improvements."""
    document_type: str
    content: str  # current text/content of the document
    improvements: List[str] = []  # list of improvement suggestions

class SessionData(BaseModel):
    """Session data stored in the database."""
    session_id: str
    chat_messages: List[ChatMessage] = []
    foundation_results: List[Dict[str, Any]] = []
    current_foundation_id: Optional[str] = None
    project_query: Optional[str] = None
    application_documents: Dict[str, List[ApplicationDocument]] = {}  # foundation_id -> list of documents
    created_at: str
    updated_at: str

class CreateSessionRequest(BaseModel):
    """Request to create or update a session."""
    chat_messages: List[ChatMessage] = []
    foundation_results: List[Dict[str, Any]] = []
    current_foundation_id: Optional[str] = None
    project_query: Optional[str] = None
    application_documents: Dict[str, List[ApplicationDocument]] = {}

class UpdateApplicationDocumentsRequest(BaseModel):
    """Request to update application documents for a foundation."""
    documents: List[ApplicationDocument]

class SessionResponse(BaseModel):
    """Response containing session data."""
    success: bool
    session_id: str
    data: Optional[SessionData] = None
    message: Optional[str] = None

