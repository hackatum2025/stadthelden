"""
Session service for managing user sessions and state persistence.
"""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.session import SessionData, CreateSessionRequest


class SessionService:
    """Service for managing user sessions."""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.collection = self.db.sessions
    
    async def create_session(self, request: CreateSessionRequest) -> SessionData:
        """Create a new session."""
        session_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        session_doc = {
            "session_id": session_id,
            "chat_messages": [msg.model_dump() for msg in request.chat_messages],
            "foundation_results": request.foundation_results,
            "current_foundation_id": request.current_foundation_id,
            "project_query": request.project_query,
            "created_at": now,
            "updated_at": now
        }
        
        await self.collection.insert_one(session_doc)
        
        return SessionData(**session_doc)
    
    async def update_session(self, session_id: str, request: CreateSessionRequest) -> Optional[SessionData]:
        """Update an existing session."""
        now = datetime.utcnow().isoformat()
        
        update_doc = {
            "$set": {
                "chat_messages": [msg.model_dump() for msg in request.chat_messages],
                "foundation_results": request.foundation_results,
                "current_foundation_id": request.current_foundation_id,
                "project_query": request.project_query,
                "updated_at": now
            }
        }
        
        result = await self.collection.find_one_and_update(
            {"session_id": session_id},
            update_doc,
            return_document=True
        )
        
        if result:
            return SessionData(**result)
        return None
    
    async def get_session(self, session_id: str) -> Optional[SessionData]:
        """Retrieve a session by ID."""
        session_doc = await self.collection.find_one({"session_id": session_id})
        
        if session_doc:
            return SessionData(**session_doc)
        return None
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        result = await self.collection.delete_one({"session_id": session_id})
        return result.deleted_count > 0
    
    async def list_recent_sessions(self, limit: int = 3) -> list[SessionData]:
        """List recent sessions ordered by updated_at."""
        cursor = self.collection.find().sort("updated_at", -1).limit(limit)
        sessions = []
        
        async for session_doc in cursor:
            sessions.append(SessionData(**session_doc))
        
        return sessions

