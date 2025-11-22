from pydantic import BaseModel
from typing import Literal


class ChatMessage(BaseModel):
    """Chat message model."""
    content: str


class ChatResponse(BaseModel):
    """Chat response model."""
    code: Literal["refine", "finish"]
    message: str

