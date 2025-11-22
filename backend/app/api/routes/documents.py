"""
Document generation API endpoints.
"""

from fastapi import APIRouter, HTTPException
from app.models.document_generation import (
    GenerateDocumentsRequest,
    GenerateDocumentsResponse
)
from app.services.document_generation_service import DocumentGenerationService

router = APIRouter()


@router.post("/generate", response_model=GenerateDocumentsResponse)
async def generate_documents(request: GenerateDocumentsRequest):
    """
    Generate content for required application documents.
    
    Takes project context (chat messages, foundation details) and
    generates appropriate content for each required document.
    
    Request body:
    - required_documents: List of documents to generate
    - chat_messages: Conversation history for context
    - project_query: User's original project idea
    - foundation_name: Name of the foundation
    - foundation_details: Additional foundation information
    
    Returns:
    - List of generated documents with content
    
    Example:
    ```
    {
      "required_documents": [
        {
          "document_type": "projektbeschreibung",
          "description": "Detailed project description",
          "required": true
        }
      ],
      "chat_messages": [...],
      "project_query": "Build a community garden",
      "foundation_name": "Green Foundation"
    }
    ```
    """
    try:
        service = DocumentGenerationService()
        generated_docs = await service.generate_documents(request)
        
        return GenerateDocumentsResponse(
            success=True,
            documents=generated_docs,
            message=f"Successfully generated {len(generated_docs)} document(s)"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate documents: {str(e)}"
        )

