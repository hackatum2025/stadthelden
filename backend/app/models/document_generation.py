from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class RequiredDocumentInput(BaseModel):
    """A required document that needs to be generated."""
    document_type: str
    description: str
    required: bool

class ChatMessageInput(BaseModel):
    """A chat message for context."""
    role: str
    content: str

class GenerateDocumentsRequest(BaseModel):
    """Request to generate document content."""
    required_documents: List[RequiredDocumentInput]
    chat_messages: List[ChatMessageInput]
    project_query: Optional[str] = None
    foundation_name: Optional[str] = None
    foundation_details: Optional[Dict[str, Any]] = None

class GeneratedDocument(BaseModel):
    """A generated document with its content."""
    document: str  # document_type
    text: str      # generated content
    improvements: List[str] = []  # list of improvement suggestions

class GenerateDocumentsResponse(BaseModel):
    """Response containing generated documents."""
    success: bool
    documents: List[GeneratedDocument]
    message: Optional[str] = None

class ProofreadDocumentRequest(BaseModel):
    """Request to proofread a document and get improvement suggestions."""
    document_text: str
    document_type: str
    existing_improvements: Optional[List[str]] = None

class ProofreadDocumentResponse(BaseModel):
    """Response containing new improvement suggestions."""
    success: bool
    improvements: List[str]
    message: Optional[str] = None

