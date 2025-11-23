"""
Service for scoring and matching foundations to user projects.
This is currently using mock logic - replace with real AI/ML scoring later.
"""
import random
from typing import List, Dict, Any
from app.models.scores import MatchItem, FoundationScore


def generate_mock_matches(foundation: Dict[str, Any]) -> List[MatchItem]:
    """
    Generate mock match analysis for a foundation.
    In production, this would use AI/ML to analyze the user's project requirements.
    """
    name = foundation.get("name", "")
    scope = foundation.get("foerderbereich", {}).get("scope", "local")
    zwecke = foundation.get("gemeinnuetzige_zwecke", [])
    category = foundation.get("foerderhoehe", {}).get("category", "medium")
    
    matches = []
    
    # Fits (positive matches)
    if scope == "local":
        matches.append(MatchItem(text="Fördert lokale Projekte", type="fit"))
    elif scope == "international":
        matches.append(MatchItem(text="Internationale Reichweite", type="fit"))
    elif scope == "national":
        matches.append(MatchItem(text="Bundesweite Reichweite", type="fit"))
    elif scope == "regional":
        matches.append(MatchItem(text="Regionale Förderung", type="fit"))
    
    # Add purpose-based fits
    if "Jugendhilfe" in str(zwecke):
        matches.append(MatchItem(text="Unterstützt Jugendinitiativen", type="fit"))
    if "Bildung" in str(zwecke):
        matches.append(MatchItem(text="Bildungsprojekte", type="fit"))
    if "Wissenschaft" in str(zwecke):
        matches.append(MatchItem(text="Innovation & Technologie", type="fit"))
    if "Umwelt" in str(zwecke):
        matches.append(MatchItem(text="Nachhaltigkeitsfokus", type="fit"))
    if "Kultur" in str(zwecke) or "Kunst" in str(zwecke):
        matches.append(MatchItem(text="Kultur & Kreativität", type="fit"))
    
    # Add funding amount fit
    if category == "large":
        matches.append(MatchItem(text="Große Projektförderung", type="fit"))
    
    # Mismatches (potential issues)
    mismatch_pool = [
        "Keine Personalkosten förderbar",
        "Nur für gemeinnützige Organisationen",
        "Bewerbungsprozess komplex",
        "Hohe Konkurrenz",
        "Begrenzte Mittel",
        "Nur für Schulprojekte",
        "Strenge Berichtspflichten",
    ]
    
    # Add 1-2 random mismatches
    num_mismatches = random.randint(1, 2)
    for mismatch in random.sample(mismatch_pool, num_mismatches):
        matches.append(MatchItem(text=mismatch, type="mismatch"))
    
    # Questions (things to clarify)
    question_pool = [
        "Kofinanzierung nötig?",
        "Projektlaufzeit flexibel?",
        "Mehrjährige Förderung möglich?",
        "Matching Funds erforderlich?",
        "Reporting-Aufwand?",
        "Zwischenberichte notwendig?",
        "Eigenanteil erforderlich?",
    ]
    
    # Add 1-2 random questions
    num_questions = random.randint(1, 2)
    for question in random.sample(question_pool, num_questions):
        matches.append(MatchItem(text=question, type="question"))
    
    return matches


def calculate_mock_score(foundation: Dict[str, Any], matches: List[MatchItem]) -> float:
    """
    Calculate a mock match score based on the matches.
    In production, this would use sophisticated ML models.
    """
    fits = sum(1 for m in matches if m.type == "fit")
    mismatches = sum(1 for m in matches if m.type == "mismatch")
    
    # Base score on ratio of fits to total items
    base_score = fits / (fits + mismatches) if (fits + mismatches) > 0 else 0.5
    
    # Add some randomness for variety
    score = base_score + random.uniform(-0.1, 0.1)
    
    # Clamp between 0.0 and 1.0
    return max(0.0, min(1.0, score))


def format_funding_amount(foerderhoehe: Dict[str, Any]) -> str:
    """Format funding amount for display."""
    max_amount = foerderhoehe.get("max_amount")
    
    if max_amount is None or max_amount == 0:
        return "Förderhöhe nicht angegeben"
    
    if max_amount >= 100000:
        return f"Bis zu {int(max_amount/1000)}k€"
    elif max_amount >= 1000:
        return f"Bis zu {int(max_amount/1000)}.{int((max_amount%1000)/100)}k€"
    else:
        return f"Bis zu {int(max_amount)}€"


def convert_foundation_to_scored(foundation: Dict[str, Any]) -> FoundationScore:
    """Convert a foundation document to a scored foundation."""
    # Generate matches
    matches = generate_mock_matches(foundation)
    
    # Calculate score
    score = calculate_mock_score(foundation, matches)
    
    # Get first gemeinnütziger Zweck as purpose
    zwecke = foundation.get("gemeinnuetzige_zwecke", [])
    purpose = zwecke[0] if zwecke else "Allgemeine Förderung"
    
    # Format funding amount
    funding_amount = format_funding_amount(foundation.get("foerderhoehe", {}))
    
    # Helper function to safely get dict values, handling None
    def safe_get_dict(key: str, default: Dict[str, Any] = None) -> Dict[str, Any]:
        value = foundation.get(key)
        if value is None or not isinstance(value, dict):
            return default or {}
        return value
    
    # Helper function to safely get list values, handling None
    def safe_get_list(key: str, default: List = None) -> List:
        value = foundation.get(key)
        if value is None or not isinstance(value, list):
            return default or []
        return value
    
    # Handle foerderhoehe with category-based defaults
    foerderhoehe_raw = safe_get_dict("foerderhoehe")
    if foerderhoehe_raw:
        category = foerderhoehe_raw.get("category")
        min_amount = foerderhoehe_raw.get("min_amount")
        max_amount = foerderhoehe_raw.get("max_amount")
        
        # Set default values based on category if amounts are null
        if min_amount is None or max_amount is None:
            category_lower = str(category).lower() if category else ""
            if category_lower in ["large", "großförderung", "grossfoerderung"]:
                # Großförderung (>50k): default range 50k-200k
                foerderhoehe_raw["min_amount"] = min_amount if min_amount is not None else 50000
                foerderhoehe_raw["max_amount"] = max_amount if max_amount is not None else 200000
            elif category_lower in ["small", "kleinförderung", "kleinfoerderung"]:
                # Kleinförderung (<5k): default range 0-5k
                foerderhoehe_raw["min_amount"] = min_amount if min_amount is not None else 0
                foerderhoehe_raw["max_amount"] = max_amount if max_amount is not None else 5000
            elif category_lower in ["medium", "mittelgroße förderung", "mittelgrosse foerderung"]:
                # Mittelgroße Förderung (5k-50k): default range 5k-50k
                foerderhoehe_raw["min_amount"] = min_amount if min_amount is not None else 5000
                foerderhoehe_raw["max_amount"] = max_amount if max_amount is not None else 50000
    
    return FoundationScore(
        id=foundation.get("_id", foundation.get("id", "")),
        name=foundation.get("name", ""),
        logo="/hero-avatar.svg",  # Using default for now
        purpose=purpose,
        description=foundation.get("short_description", ""),
        funding_amount=funding_amount,
        match_score=score,
        matches=matches,
        # Include all full foundation details
        long_description=foundation.get("long_description", ""),
        legal_form=foundation.get("legal_form", "Stiftung"),
        gemeinnuetzige_zwecke=zwecke,
        antragsprozess=safe_get_dict("antragsprozess"),
        foerderbereich=safe_get_dict("foerderbereich"),
        foerderhoehe=foerderhoehe_raw if foerderhoehe_raw else {},
        contact=safe_get_dict("contact"),
        past_projects=safe_get_list("past_projects"),
        website=foundation.get("website", "")
    )

