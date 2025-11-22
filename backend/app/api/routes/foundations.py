from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.core.database import get_database
from app.models.scores import FoundationScoresResponse
from app.services.scoring_service import convert_foundation_to_scored

router = APIRouter()


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
async def get_foundation_scores(
    query: Optional[str] = Query(None, description="User's project description for matching"),
    limit: int = Query(5, description="Number of top matches to return", ge=1, le=20)
):
    """
    Get foundations with match scores, fits, mismatches, and questions.
    
    This endpoint analyzes foundations and returns them with:
    - Match score (0.0 to 1.0)
    - Fits (positive matches)
    - Mismatches (potential issues)
    - Questions (things to clarify)
    
    In production, this would use AI/ML to analyze the user's project.
    Currently using mock scoring logic.
    """
    db = get_database()
    
    # Fetch all foundations
    cursor = db.foundations.find({})
    foundations = await cursor.to_list(length=None)
    
    # Convert to scored foundations
    scored_foundations = [
        convert_foundation_to_scored(foundation)
        for foundation in foundations
    ]
    
    # Sort by match score (highest first)
    scored_foundations.sort(key=lambda x: x.match_score, reverse=True)
    
    # Limit results
    scored_foundations = scored_foundations[:limit]
    
    # Generate query summary
    query_summary = f"Found {len(scored_foundations)} matching foundations"
    if query:
        query_summary += f" for: {query[:100]}"
    
    return FoundationScoresResponse(
        success=True,
        count=len(scored_foundations),
        foundations=scored_foundations,
        query_summary=query_summary
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

