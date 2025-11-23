from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional
from app.core.database import get_database
from app.models.scores import FoundationScoresResponse
from app.models.project_description import ProjectDescription, CharitablePurpose
from app.services.scoring_service import score_foundations

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
async def get_foundation_scores_get(
    name: Optional[str] = Query("", description="Name of the project"),
    
    description: Optional[str] = Query("", description="Description of the project idea"),
    target_group: Optional[str] = Query("", description="Target group of the project"),
    charitable_purpose: Optional[str] = Query(None, description="Charitable purpose of the project (one of the CharitablePurpose enum values). Required for accurate matching."),
    limit: int = Query(5, description="Number of top matches to return", ge=1, le=20)
):
    """
    Get foundations with match scores, fits, mismatches, and questions (GET version).
    
    This endpoint uses AI to analyze the project and match it with foundations.
    For better type safety and required fields, consider using the POST version.
    """
    try:
        # Convert query parameters to ProjectDescription
        # Find matching CharitablePurpose enum value
        purpose_enum = None
        if charitable_purpose:
            for purpose in CharitablePurpose:
                if purpose.value == charitable_purpose:
                    purpose_enum = purpose
                    break
            
            if purpose_enum is None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid charitable_purpose. Must be one of: {[p.value for p in CharitablePurpose]}"
                )
        else:
            # If no charitable_purpose provided, use a default (first one) but warn
            # In production, you might want to require this
            purpose_enum = CharitablePurpose.SCIENCE_AND_RESEARCH
            print("⚠️ No charitable_purpose provided in GET request, using default")
        
        project = ProjectDescription(
            name=name or "Unnamed Project",
            description=description or "No description provided",
            target_group=target_group or "General public",
            charitable_purpose=[purpose_enum]  # Convert to list format
        )
        
        db = get_database()
        
        # Score foundations using AI
        scored_foundations = await score_foundations(project, limit, db)
        
        # Generate query summary
        query_summary = f"Found {len(scored_foundations)} matching foundations"
        if project.name and project.name != "Unnamed Project":
            query_summary += f" for project: {project.name}"
        if project.description and project.description != "No description provided":
            query_summary += f" ({project.description[:50]}...)" if len(project.description) > 50 else f" ({project.description})"
        
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
    project: ProjectDescription = Body(..., description="Project description for matching"),
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
        
        # Score foundations using AI
        scored_foundations = await score_foundations(project, limit, db)
        
        # Generate query summary
        query_summary = f"Found {len(scored_foundations)} matching foundations"
        if project.name:
            query_summary += f" for project: {project.name}"
        if project.description:
            query_summary += f" ({project.description[:50]}...)" if len(project.description) > 50 else f" ({project.description})"
        
        return FoundationScoresResponse(
            success=True,
            count=len(scored_foundations),
            foundations=scored_foundations,
            query_summary=query_summary
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

