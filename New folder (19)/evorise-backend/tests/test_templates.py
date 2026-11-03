import pytest_asyncio
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import Base
from app.dependencies import get_db
from app.main import create_app

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL)
TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()

@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    app = create_app()

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

@pytest.mark.asyncio
async def test_create_template(client: AsyncClient):
    response = await client.post("/templates/", json={
        "name": "Weekly Status Report",
        "description": "Standard weekly report for all departments",
        "html_content": "<html><body><h1>{{ title }}</h1><p>{{ body }}</p></body></html>"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Weekly Status Report"
    assert "id" in data

@pytest.mark.asyncio
async def test_list_templates(client: AsyncClient):
    await client.post("/templates/", json={
        "name": "Weekly Status Report",
        "html_content": "<html></html>"
    })
    response = await client.get("/templates/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1

@pytest.mark.asyncio
async def test_generate_report(client: AsyncClient):
    # First create a template
    create_resp = await client.post("/templates/", json={
        "name": "EvoRise Invoice",
        "html_content": "<h1>Invoice #{{ invoice_number }}</h1><p>Total: ${{ total }}</p>"
    })
    template_id = create_resp.json()["id"]

    # Now generate the report
    gen_resp = await client.post(f"/templates/{template_id}/generate", json={
        "data": {
            "invoice_number": "1045",
            "total": "5000.00"
        }
    })
    assert gen_resp.status_code == 200
    html = gen_resp.text
    assert "EvoRise Solutions" in html
    assert "Invoice #1045" in html
    assert "Total: $5000.00" in html
