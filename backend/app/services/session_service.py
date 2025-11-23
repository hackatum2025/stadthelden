"""
Session service for managing user sessions and state persistence.
"""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.session import SessionData, CreateSessionRequest, ApplicationDocument


class SessionService:
    """Service for managing user sessions."""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.collection = self.db.sessions
    
    async def create_session(self, request: CreateSessionRequest) -> SessionData:
        """Create a new session."""
        session_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Convert application_documents to dict format for storage
        application_docs_dict = {}
        for foundation_id, docs in request.application_documents.items():
            application_docs_dict[foundation_id] = [doc.model_dump() for doc in docs]
        
        session_doc = {
            "session_id": session_id,
            "chat_messages": [msg.model_dump() for msg in request.chat_messages],
            "foundation_results": request.foundation_results,
            "current_foundation_id": request.current_foundation_id,
            "project_query": request.project_query,
            "application_documents": application_docs_dict,
            "created_at": now,
            "updated_at": now
        }
        
        await self.collection.insert_one(session_doc)
        
        return SessionData(**session_doc)
    
    async def update_session(self, session_id: str, request: CreateSessionRequest) -> Optional[SessionData]:
        """Update an existing session."""
        now = datetime.utcnow().isoformat()
        
        # Convert application_documents to dict format for storage
        # Frontend now always includes current application_documents state
        application_docs_dict = {}
        for foundation_id, docs in request.application_documents.items():
            application_docs_dict[foundation_id] = [doc.model_dump() for doc in docs]
        
        update_doc = {
            "$set": {
                "chat_messages": [msg.model_dump() for msg in request.chat_messages],
                "foundation_results": request.foundation_results,
                "current_foundation_id": request.current_foundation_id,
                "project_query": request.project_query,
                "application_documents": application_docs_dict,
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
            # Ensure application_documents exists for backward compatibility
            if "application_documents" not in session_doc:
                session_doc["application_documents"] = {}
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
            # Ensure application_documents exists for backward compatibility
            if "application_documents" not in session_doc:
                session_doc["application_documents"] = {}
            
            # Debug: Check what's in application_documents before parsing
            app_docs_raw = session_doc.get("application_documents", {})
            print(f"🔍 [list_recent_sessions] Session {session_doc.get('session_id')}: application_documents type={type(app_docs_raw)}, keys={list(app_docs_raw.keys()) if isinstance(app_docs_raw, dict) else 'N/A'}")
            if isinstance(app_docs_raw, dict) and app_docs_raw:
                for foundation_id, docs in app_docs_raw.items():
                    print(f"  📄 Foundation {foundation_id}: {len(docs) if isinstance(docs, list) else 'N/A'} documents")
                    if isinstance(docs, list) and docs:
                        print(f"    First doc type: {type(docs[0])}, keys: {list(docs[0].keys()) if isinstance(docs[0], dict) else 'N/A'}")
            
            try:
                session_data = SessionData(**session_doc)
                # Debug: Check what's in application_documents after parsing
                parsed_app_docs = session_data.application_documents
                print(f"✅ [list_recent_sessions] After parsing: {len(parsed_app_docs)} foundation keys")
                if parsed_app_docs:
                    for foundation_id, docs in parsed_app_docs.items():
                        print(f"  📄 Foundation {foundation_id}: {len(docs)} ApplicationDocument objects")
                sessions.append(session_data)
            except Exception as e:
                print(f"❌ [list_recent_sessions] Error parsing session {session_doc.get('session_id')}: {e}")
                import traceback
                traceback.print_exc()
                # Still add it but with empty application_documents
                session_doc["application_documents"] = {}
                sessions.append(SessionData(**session_doc))
        
        return sessions
    
    async def update_application_documents(
        self, 
        session_id: str, 
        foundation_id: str, 
        documents: list[ApplicationDocument]
    ) -> Optional[SessionData]:
        """Update application documents for a specific foundation in a session."""
        now = datetime.utcnow().isoformat()
        
        # Convert documents to dict format
        documents_dict = [doc.model_dump() for doc in documents]
        print(f"📝 Updating application documents for session {session_id}, foundation {foundation_id}")
        print(f"📄 Documents to save: {len(documents_dict)} documents")
        
        # First, ensure the session exists and get current application_documents
        session_doc = await self.collection.find_one({"session_id": session_id})
        if not session_doc:
            print(f"❌ Session not found: {session_id}")
            return None
        
        # Get existing application_documents or initialize empty dict
        existing_app_docs = session_doc.get("application_documents", {})
        if not isinstance(existing_app_docs, dict):
            existing_app_docs = {}
        
        print(f"📦 Existing application_documents keys: {list(existing_app_docs.keys())}")
        
        # Update the specific foundation's documents
        existing_app_docs[foundation_id] = documents_dict
        
        print(f"💾 Saving {len(documents_dict)} documents for foundation {foundation_id}")
        
        # Use $set to update the entire application_documents field
        update_doc = {
            "$set": {
                "application_documents": existing_app_docs,
                "updated_at": now
            }
        }
        
        result = await self.collection.find_one_and_update(
            {"session_id": session_id},
            update_doc,
            return_document=True
        )
        
        if result:
            # Verify the save worked immediately after update
            saved_docs = result.get("application_documents", {}).get(foundation_id, [])
            print(f"✅ Saved {len(saved_docs)} documents. Verification: {len(saved_docs) == len(documents_dict)}")
            
            # First, check raw MongoDB document
            print(f"🔍 Checking raw MongoDB document...")
            raw_doc = await self.collection.find_one({"session_id": session_id})
            if raw_doc:
                raw_app_docs = raw_doc.get("application_documents", {})
                print(f"📦 Raw MongoDB: application_documents type={type(raw_app_docs)}, keys={list(raw_app_docs.keys()) if isinstance(raw_app_docs, dict) else 'N/A'}")
                if isinstance(raw_app_docs, dict) and foundation_id in raw_app_docs:
                    raw_foundation_docs = raw_app_docs[foundation_id]
                    print(f"📄 Raw MongoDB: foundation {foundation_id} has {len(raw_foundation_docs) if isinstance(raw_foundation_docs, list) else 'N/A'} documents")
                    if isinstance(raw_foundation_docs, list) and raw_foundation_docs:
                        print(f"  First raw doc: {type(raw_foundation_docs[0])}, keys: {list(raw_foundation_docs[0].keys()) if isinstance(raw_foundation_docs[0], dict) else 'N/A'}")
                        if isinstance(raw_foundation_docs[0], dict):
                            print(f"  First raw doc content: document_type={raw_foundation_docs[0].get('document_type')}, content_length={len(raw_foundation_docs[0].get('content', ''))}")
            
            # Retrieve the session again using the same method as get_session to verify persistence
            print(f"🔍 Retrieving session again using get_session method to verify persistence...")
            verification_session = await self.get_session(session_id)
            if verification_session:
                verified_docs = verification_session.application_documents.get(foundation_id, [])
                print(f"🔍 Retrieved {len(verified_docs)} documents from DB using get_session. Match: {len(verified_docs) == len(documents_dict)}")
                
                if len(verified_docs) != len(documents_dict):
                    print(f"⚠️ WARNING: Document count mismatch! Expected {len(documents_dict)}, got {len(verified_docs)}")
                    print(f"📋 Expected document types: {[d.get('document_type', 'unknown') for d in documents_dict]}")
                    print(f"📋 Retrieved document types: {[doc.document_type for doc in verified_docs]}")
                    print(f"📋 Expected document contents length: {[len(d.get('content', '')) for d in documents_dict]}")
                    print(f"📋 Retrieved document contents length: {[len(doc.content) for doc in verified_docs]}")
                else:
                    print(f"✅ Verification successful: All {len(verified_docs)} documents persisted correctly")
                    # Also verify content matches
                    content_matches = all(
                        any(
                            doc.document_type == d.get('document_type') and 
                            doc.content == d.get('content')
                            for doc in verified_docs
                        )
                        for d in documents_dict
                    )
                    if content_matches:
                        print(f"✅ Content verification: All document contents match")
                    else:
                        print(f"⚠️ WARNING: Content mismatch detected!")
            else:
                print(f"❌ ERROR: Could not retrieve session for verification using get_session!")
            
            # Ensure application_documents exists for backward compatibility
            if "application_documents" not in result:
                result["application_documents"] = {}
            
            return SessionData(**result)
        return None

