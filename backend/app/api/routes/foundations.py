from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_database
from app.models.scores import FoundationScoresResponse
from app.models.project_description import ProjectDescription, CharitablePurpose
from app.services.scoring_service import score_foundations

router = APIRouter()


class FoundationScoresRequest(BaseModel):
    """Request body for foundation scores endpoint."""
    session_id: str


@router.get("/")
async def get_foundations():
    """
    Get all foundations with embedded projects.
    Returns foundations with their past projects included.
    """
    db = get_database()
    
    # Fetch all foundations (projects are already embedded in the document)
    cursor = db.foundations.find({})
    foundations = await cursor.to_list(length=None)
    
    # Convert _id to id for JSON serialization
    for foundation in foundations:
        foundation['id'] = foundation.pop('_id')
    
    return {
        "success": True,
        "count": len(foundations),
        "foundations": foundations
    }


@router.get("/scores", response_model=FoundationScoresResponse)
async def get_foundation_scores_get(
    session_id: str,
    limit: int = Query(5, description="Number of top matches to return", ge=1, le=20)
):
    """
    Get foundations with match scores, fits, mismatches, and questions (GET version).
    
    This endpoint uses AI to analyze the project and match it with foundations.
    For better type safety and required fields, consider using the POST version.
    """
    try:
        db = get_database()
        session = await db.sessions.find_one({"session_id": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        project_description = session["project_description"]
        
        # Score foundations using AI
        scored_foundations = await score_foundations(project_description, limit, db)

        project_name = project_description["name"]
        project_description = project_description["description"]
        
        # Generate query summary
        query_summary = f"Found {len(scored_foundations)} matching foundations"
        if project_name and project_name != "Unnamed Project":
            query_summary += f" for project: {project_name}"
        if project_description and project_description != "No description provided":
            query_summary += f" ({project_description[:50]}...)" if len(project_description) > 50 else f" ({project_description})"
        
        return FoundationScoresResponse(
            success=True,
            count=len(scored_foundations),
            foundations=scored_foundations,
            query_summary=query_summary
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_foundation_scores_get: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to score foundations: {str(e)}"
        )


@router.post("/scores", response_model=FoundationScoresResponse)
async def get_foundation_scores_post(
    request: FoundationScoresRequest = Body(...),
    limit: int = Query(5, description="Number of top matches to return", ge=1, le=20)
):
    """
    Get foundations with match scores, fits, mismatches, and questions (POST version).
    
    This endpoint uses AI to analyze the project and match it with foundations:
    - Filters by exact charitable purpose match
    - Uses text search on foundation descriptions and past projects
    - Scores and ranks using Gemini AI with structured outputs
    - Returns foundations with:
      - Match score (0.0 to 1.0)
      - Fits (positive matches)
      - Mismatches (potential issues)
      - Questions (things to clarify)
    """
    try:
        db = get_database()
        
        session = await db.sessions.find_one({"session_id": request.session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        project_description = session["project_description"]

          # Score foundations using AI
        scored_foundations = await score_foundations(ProjectDescription(**project_description), limit, db)
        
        return FoundationScoresResponse(
            success=True,
            count=len(scored_foundations),
            foundations=scored_foundations,
            query_summary="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        )
    except Exception as e:
        print(f"❌ Error in get_foundation_scores_post: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to score foundations: {str(e)}"
        )


@router.get("/{foundation_id}")
async def get_foundation(foundation_id: str):
    """
    Get a specific foundation by ID with embedded projects.
    """
    db = get_database()
    
    foundation = await db.foundations.find_one({"_id": foundation_id})
    if not foundation:
        raise HTTPException(status_code=404, detail="Foundation not found")
    
    # Convert _id to id
    foundation['id'] = foundation.pop('_id')
    
    return {
        "success": True,
        "foundation": foundation
    }

