from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.template import ReportTemplate
from app.schemas.template import TemplateCreate, TemplateUpdate

class TemplateService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, template_id: int) -> ReportTemplate | None:
        return await self.db.get(ReportTemplate, template_id)

    async def create(self, payload: TemplateCreate) -> ReportTemplate:
        template = ReportTemplate(**payload.model_dump())
        self.db.add(template)
        await self.db.commit()
        await self.db.refresh(template)
        return template

    async def list(self, skip: int = 0, limit: int = 20) -> tuple[list[ReportTemplate], int]:
        total_result = await self.db.execute(select(func.count(ReportTemplate.id)))
        total = total_result.scalar_one()
        
        result = await self.db.execute(
            select(ReportTemplate).order_by(ReportTemplate.id).offset(skip).limit(limit)
        )
        return list(result.scalars()), total

    async def update(self, template_id: int, payload: TemplateUpdate) -> ReportTemplate | None:
        template = await self.get_by_id(template_id)
        if template is None:
            return None
            
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(template, field, value)
            
        await self.db.commit()
        await self.db.refresh(template)
        return template
        
    async def delete(self, template_id: int) -> bool:
        template = await self.get_by_id(template_id)
        if template is None:
            return False
        await self.db.delete(template)
        await self.db.commit()
        return True
