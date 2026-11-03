from typing import Annotated
from fastapi import APIRouter, HTTPException, Query, status

from app.dependencies import DbDep
from app.schemas.template import TemplateCreate, TemplateResponse, TemplateUpdate, TemplateListResponse
from app.schemas.generate import GenerateRequest
from app.services.template_service import TemplateService
from app.services.generate_service import GenerationService
from fastapi.responses import HTMLResponse

router = APIRouter()

@router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(payload: TemplateCreate, db: DbDep) -> TemplateResponse:
    service = TemplateService(db)
    return await service.create(payload)

@router.get("/", response_model=TemplateListResponse)
async def list_templates(
    db: DbDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> TemplateListResponse:
    service = TemplateService(db)
    templates, total = await service.list(skip=skip, limit=limit)
    return TemplateListResponse(total=total, items=templates)

@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: int, db: DbDep) -> TemplateResponse:
    service = TemplateService(db)
    template = await service.get_by_id(template_id)
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.patch("/{template_id}", response_model=TemplateResponse)
async def update_template(template_id: int, payload: TemplateUpdate, db: DbDep) -> TemplateResponse:
    service = TemplateService(db)
    template = await service.update(template_id, payload)
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(template_id: int, db: DbDep):
    service = TemplateService(db)
    success = await service.delete(template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Template not found")

@router.post("/{template_id}/generate", response_class=HTMLResponse)
async def generate_report(template_id: int, payload: GenerateRequest, db: DbDep):
    service = TemplateService(db)
    template = await service.get_by_id(template_id)
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
        
    try:
        html = GenerationService.render_html(template.html_content, payload.data)
        return html
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error rendering template: {str(e)}")
