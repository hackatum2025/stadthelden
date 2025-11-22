from fastapi import APIRouter, HTTPException
from typing import List
from app.core.database import get_database

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

