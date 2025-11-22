from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class RequiredDocument(BaseModel):
    """Required document for application."""
    document_type: str
    description: str
    required: bool


class ApplicationProcess(BaseModel):
    """Application process details."""
    deadline_type: str  # "fixed" or "rolling_basis"
    deadline_date: Optional[str] = None
    rolling_info: Optional[str] = None
    required_documents: List[RequiredDocument]
    evaluation_process: str
    decision_timeline: str


class GeographicArea(BaseModel):
    """Geographic funding area."""
    scope: str  # "local", "regional", "national", "international"
    specific_areas: List[str]
    restrictions: Optional[str] = None


class FundingAmount(BaseModel):
    """Funding amount details."""
    category: str  # "small", "medium", "large"
    min_amount: float
    max_amount: float
    average_amount: Optional[float] = None
    total_budget: Optional[float] = None


class ContactInfo(BaseModel):
    """Contact information."""
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None


class ProjectDuration(BaseModel):
    """Project duration details."""
    start_date: str
    end_date: Optional[str] = None
    duration_months: int


class Project(BaseModel):
    """Project model."""
    id: str
    name: str
    description: str
    image_url: Optional[str] = None
    foundation_id: str
    funded_amount: float
    duration: ProjectDuration
    status: str  # "completed", "ongoing", "planned"
    outcomes: Optional[str] = None
    website_url: Optional[str] = None


class Foundation(BaseModel):
    """Foundation model."""
    id: str = Field(alias="_id")
    name: str
    short_description: str
    long_description: str
    legal_form: str
    gemeinnuetzige_zwecke: List[str]
    past_projects: List[Project] = []
    antragsprozess: ApplicationProcess
    foerderbereich: GeographicArea
    foerderhoehe: FundingAmount
    contact: ContactInfo
    logo_url: str
    website: str

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "stiftung-001",
                "name": "Bürgerstiftung München",
                "short_description": "Unterstützt lokale Projekte",
                "long_description": "Detaillierte Beschreibung...",
                "legal_form": "Stiftung",
                "gemeinnuetzige_zwecke": ["Förderung der Jugendhilfe"],
                "past_projects": [],
                "antragsprozess": {},
                "foerderbereich": {},
                "foerderhoehe": {},
                "contact": {},
                "logo_url": "https://example.com/logo.svg",
                "website": "https://example.com"
            }
        }

