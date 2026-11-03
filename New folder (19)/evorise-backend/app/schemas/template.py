from datetime import datetime
from pydantic import BaseModel, Field

class TemplateBase(BaseModel):
    name: str = Field(min_length=3, max_length=255)
    description: str | None = None
    html_content: str = Field(..., description="The HTML/CSS template with placeholder variables")

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=255)
    description: str | None = None
    html_content: str | None = None

class TemplateResponse(TemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class TemplateListResponse(BaseModel):
    total: int
    items: list[TemplateResponse]
