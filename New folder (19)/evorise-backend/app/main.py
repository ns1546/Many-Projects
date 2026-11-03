from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import templates

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically create tables on startup for ease of use in dev
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: close pooled resources
    await engine.dispose()

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=settings.allow_credentials,
        allow_methods=settings.allowed_methods,
        allow_headers=settings.allowed_headers,
    )

    app.include_router(templates.router, prefix="/templates", tags=["templates"])

    # Routes will be included here
    @app.get("/health")
    async def health_check():
        return {"status": "ok", "app": settings.app_name}

    return app

app = create_app()
