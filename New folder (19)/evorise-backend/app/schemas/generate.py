from pydantic import BaseModel
from typing import Any

class GenerateRequest(BaseModel):
    data: dict[str, Any]
