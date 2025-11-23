"""
Session API endpoints for managing user sessions.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.models.session import (
    CreateSessionRequest, 
    SessionResponse, 
    SessionData,
    UpdateApplicationDocumentsRequest
)
from app.services.session_service import SessionService
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()


def get_session_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> SessionService:
    """Dependency to get session service."""
    return SessionService(db)


@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    request: CreateSessionRequest,
    service: SessionService = Depends(get_session_service)
):
    """
    Create a new session.
    
    This endpoint creates a new session to store:
    - Chat messages
    - Foundation search results
    - Current foundation being worked on
    - Project query
    """
    try:
        session_data = await service.create_session(request)
        return SessionResponse(
            success=True,
            session_id=session_data.session_id,
            data=session_data,
            message="Session created successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@router.put("/sessions/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    request: CreateSessionRequest,
    service: SessionService = Depends(get_session_service)
):
    """
    Update an existing session.
    
    Updates the session with new messages, results, or state.
    """
    try:
        session_data = await service.update_session(session_id, request)
        
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return SessionResponse(
            success=True,
            session_id=session_data.session_id,
            data=session_data,
            message="Session updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update session: {str(e)}")


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    service: SessionService = Depends(get_session_service)
):
    """
    Retrieve a session by ID.
    
    Returns all stored session data including messages, results, and state.
    """
    try:
        session_data = await service.get_session(session_id)
        
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return SessionResponse(
            success=True,
            session_id=session_data.session_id,
            data=session_data,
            message="Session retrieved successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve session: {str(e)}")


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    service: SessionService = Depends(get_session_service)
):
    """
    Delete a session.
    
    Removes all session data from the database.
    """
    try:
        deleted = await service.delete_session(session_id)
        
        if not deleted:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "success": True,
            "message": "Session deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")


@router.get("/sessions")
async def list_recent_sessions(
    limit: int = 3,
    service: SessionService = Depends(get_session_service)
):
    """
    List recent sessions.
    
    Returns the most recently updated sessions, ordered by update time.
    Useful for showing a history of recent sessions to the user.
    """
    try:
        sessions = await service.list_recent_sessions(limit)
        
        return {
            "success": True,
            "count": len(sessions),
            "sessions": [session.model_dump() for session in sessions]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}")


@router.put("/sessions/{session_id}/application-documents/{foundation_id}", response_model=SessionResponse)
async def update_application_documents(
    session_id: str,
    foundation_id: str,
    request: UpdateApplicationDocumentsRequest,
    service: SessionService = Depends(get_session_service)
):
    """
    Update application documents for a specific foundation in a session.
    
    This endpoint allows updating the document drafts (content and improvements)
    for a specific foundation without replacing the entire session.
    """
    try:
        session_data = await service.update_application_documents(
            session_id, 
            foundation_id, 
            request.documents
        )
        
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return SessionResponse(
            success=True,
            session_id=session_data.session_id,
            data=session_data,
            message="Application documents updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to update application documents: {str(e)}"
        )

