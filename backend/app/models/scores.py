from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict, Any


class MatchItem(BaseModel):
    """A single match analysis item."""
    text: str
    type: Literal["fit", "mismatch", "question"]


class FoundationEvaluation(BaseModel):
    """Evaluation of a single foundation by the LLM."""
    foundation_id: str = Field(description="The ID of the foundation being evaluated")
    match_score: float = Field(description="Match score between 0.0 and 1.0, where 1.0 is perfect match", ge=0.0, le=1.0)
    fits: List[str] = Field(description="List of positive matches or strengths (why this foundation fits the project)")
    mismatches: List[str] = Field(description="List of potential issues or mismatches (why this might not be a good fit)")
    questions: List[str] = Field(description="List of questions or things to clarify about this foundation")


class ScoringResponse(BaseModel):
    """Response from LLM containing evaluations for all foundations."""
    evaluations: List[FoundationEvaluation] = Field(description="List of foundation evaluations, one for each candidate foundation")


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
    
    # Full foundation details (same as Foundation model)
    long_description: str
    legal_form: str
    gemeinnuetzige_zwecke: List[str]
    antragsprozess: Dict[str, Any]
    foerderbereich: Dict[str, Any]
    foerderhoehe: Dict[str, Any]
    contact: Dict[str, Any]
    past_projects: List[Dict[str, Any]]
    website: str


class FoundationScoresResponse(BaseModel):
    """Response containing scored foundations."""
    success: bool
    count: int
    foundations: List[FoundationScore]
    query_summary: str

