"""
Document generation API endpoints.
"""

from fastapi import APIRouter, HTTPException
from app.models.document_generation import (
    GenerateDocumentsRequest,
    GenerateDocumentsResponse,
    ProofreadDocumentRequest,
    ProofreadDocumentResponse
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


@router.post("/proofread", response_model=ProofreadDocumentResponse)
async def proofread_document(request: ProofreadDocumentRequest):
    """
    Proofread a document and generate new improvement suggestions.
    
    Analyzes the given document text and provides concrete suggestions
    for improvement, avoiding duplication of existing suggestions.
    
    Request body:
    - document_text: The current document content
    - document_type: Type of document (e.g., "projektbeschreibung")
    - existing_improvements: Previously suggested improvements (optional)
    
    Returns:
    - List of new improvement suggestions (max 5)
    
    Example:
    ```
    {
      "document_text": "Das Projekt zielt darauf ab...",
      "document_type": "projektbeschreibung",
      "existing_improvements": ["Vorschlag 1", "Vorschlag 2"]
    }
    ```
    """
    try:
        service = DocumentGenerationService()
        improvements = await service.proofread_document(
            document_text=request.document_text,
            document_type=request.document_type,
            existing_improvements=request.existing_improvements
        )
        
        return ProofreadDocumentResponse(
            success=True,
            improvements=improvements,
            message=f"Generated {len(improvements)} improvement suggestion(s)"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to proofread document: {str(e)}"
        )

