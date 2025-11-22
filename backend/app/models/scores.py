from pydantic import BaseModel
from typing import List, Literal


class MatchItem(BaseModel):
    """A single match analysis item."""
    text: str
    type: Literal["fit", "mismatch", "question"]


class FoundationScore(BaseModel):
    """Foundation with match score and analysis."""
    id: str
    name: str
    logo: str
    purpose: str
    description: str
    funding_amount: str
    match_score: float  # 0.0 to 1.0
    matches: List[MatchItem]
    
    # Additional details from foundation
    legal_form: str
    foerderbereich_scope: str
    website: str


class FoundationScoresResponse(BaseModel):
    """Response containing scored foundations."""
    success: bool
    count: int
    foundations: List[FoundationScore]
    query_summary: str

