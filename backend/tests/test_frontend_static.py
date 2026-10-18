import pytest
from app.main import SPAStaticFiles
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient


@pytest.mark.anyio
async def test_frontend_routes_fall_back_to_index(tmp_path):
    (tmp_path / "index.html").write_text("<main>FridgePulse</main>")
    (tmp_path / "assets").mkdir()
    (tmp_path / "assets" / "app.js").write_text("console.log('app')")

    app = FastAPI()
    app.mount(
        "/",
        SPAStaticFiles(directory=tmp_path, html=True),
        name="frontend",
    )

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        route_response = await client.get("/dashboard")
        asset_response = await client.get("/assets/app.js")
        missing_asset_response = await client.get("/assets/missing.js")
        missing_api_response = await client.get("/api/v1/missing")

    assert route_response.status_code == 200
    assert route_response.text == "<main>FridgePulse</main>"
    assert asset_response.status_code == 200
    assert asset_response.text == "console.log('app')"
    assert missing_asset_response.status_code == 404
    assert missing_api_response.status_code == 404
