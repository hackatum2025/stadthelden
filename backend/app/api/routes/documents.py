"""
Document generation API endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.models.document_generation import (
    GenerateDocumentsRequest,
    GenerateDocumentsResponse,
    ProofreadDocumentRequest,
    ProofreadDocumentResponse,
    RequiredDocumentInput,
    ChatMessageInput
)
from app.services.document_generation_service import DocumentGenerationService
from app.services.session_service import SessionService
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()


def get_session_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> SessionService:
    """Dependency to get session service."""
    return SessionService(db)


@router.post("/generate", response_model=GenerateDocumentsResponse)
async def generate_documents(
    request: GenerateDocumentsRequest,
    session_service: SessionService = Depends(get_session_service)
):
    """
    Generate content for required application documents.
    
    Simplified API - only requires session_id and foundation_id.
    The backend fetches all necessary data from the session.
    
    Request body:
    - session_id: The session ID containing chat history and project details
    - foundation_id: The ID of the foundation to generate documents for
    
    Returns:
    - List of generated documents with content
    
    Example:
    ```
    {
      "session_id": "123e4567-e89b-12d3-a456-426614174000",
      "foundation_id": "foundation_abc123"
    }
    ```
    """
    try:
        # Fetch session data
        session_data = await session_service.get_session(request.session_id)
        if not session_data:
            raise HTTPException(
                status_code=404,
                detail=f"Session {request.session_id} not found"
            )
        
        # Find the foundation in the session's foundation_results
        foundation = None
        for f in session_data.foundation_results:
            if f.get("id") == request.foundation_id:
                foundation = f
                break
        
        if not foundation:
            raise HTTPException(
                status_code=404,
                detail=f"Foundation {request.foundation_id} not found in session results"
            )
        
        # Extract required documents from foundation
        antragsprozess = foundation.get("antragsprozess", {})
        required_docs = antragsprozess.get("required_documents", [])
        
        # Log foundation structure for debugging
        print(f"🔍 Foundation data structure:")
        print(f"  - Foundation ID: {foundation.get('id')}")
        print(f"  - Foundation name: {foundation.get('name')}")
        print(f"  - Has antragsprozess: {bool(antragsprozess)}")
        print(f"  - Antragsprozess keys: {list(antragsprozess.keys()) if isinstance(antragsprozess, dict) else 'Not a dict'}")
        print(f"  - Required docs found: {len(required_docs) if required_docs else 0}")
        
        # If no required documents found, use default set
        if not required_docs:
            print(f"⚠️ No required documents found, using default documents")
            required_docs = [
                {
                    "document_type": "projektbeschreibung",
                    "description": "Detaillierte Beschreibung des Projekts, seiner Ziele, Zielgruppe und geplanten Wirkung",
                    "required": True
                },
                {
                    "document_type": "budgetplan",
                    "description": "Detaillierte Kostenaufstellung mit allen Ausgaben und Einnahmen des Projekts",
                    "required": True
                },
                {
                    "document_type": "zeitplan",
                    "description": "Projektzeitplan mit Meilensteinen und wichtigen Terminen",
                    "required": True
                }
            ]
        
        # Convert to RequiredDocumentInput format
        required_documents = [
            RequiredDocumentInput(
                document_type=doc.get("document_type", ""),
                description=doc.get("description", ""),
                required=doc.get("required", True)
            )
            for doc in required_docs
        ]
        
        # Convert chat messages to the format expected by the service
        # Limit to last 10 messages to reduce token usage
        recent_messages = session_data.chat_messages[-10:] if len(session_data.chat_messages) > 10 else session_data.chat_messages
        chat_messages = [
            ChatMessageInput(
                role=msg.role,
                content=msg.content
            )
            for msg in recent_messages
        ]
        
        # Build foundation details - only essential information
        foundation_details = {
            "purpose": foundation.get("purpose"),
            "foerderhoehe": foundation.get("foerderhoehe"),
            "foerderbereich": foundation.get("foerderbereich"),
        }
        
        # Truncate project query if too long (max 500 chars)
        project_query = session_data.project_query or ""
        if len(project_query) > 500:
            project_query = project_query[:500] + "..."
        
        # Create the internal request for the service
        from app.models.document_generation import GenerateDocumentsRequestLegacy
        internal_request = GenerateDocumentsRequestLegacy(
            required_documents=required_documents,
            chat_messages=chat_messages,
            project_query=project_query,
            foundation_name=foundation.get("name"),
            foundation_details=foundation_details
        )
        
        # Generate documents
        doc_service = DocumentGenerationService()
        generated_docs = await doc_service.generate_documents(internal_request)
        
        return GenerateDocumentsResponse(
            success=True,
            documents=generated_docs,
            message=f"Successfully generated {len(generated_docs)} document(s)"
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
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

