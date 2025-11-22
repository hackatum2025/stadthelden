from pydantic import BaseModel
from typing import Literal


class ChatMessage(BaseModel):
    """Chat message model."""
    session_id: str
    content: str


class ChatResponse(BaseModel):
    """Chat response model."""
    session_id: str
    code: Literal["refine", "finish"]
    message: str

