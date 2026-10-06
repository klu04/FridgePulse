import pytest
from app.main import app
from httpx import ASGITransport, AsyncClient

from tests.utils.utils import api_url, create_test_user, user_auth_header


@pytest.mark.anyio
async def test_security_headers_are_added_to_api_responses():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/docs")

        assert response.status_code == 200
        assert response.headers["x-frame-options"] == "DENY"
        assert response.headers["x-content-type-options"] == "nosniff"
        assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
        assert response.headers["permissions-policy"] == (
            "camera=(self), microphone=(), geolocation=()"
        )


@pytest.mark.anyio
async def test_login_returns_bearer_token(client: AsyncClient):
    await create_test_user(
        client, email="login+login-success@gmail.com", password="password123"
    )

    response = await client.post(
        api_url("tokens"),
        data={"username": "login+login-success@gmail.com", "password": "password123"},
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]


@pytest.mark.anyio
async def test_login_rejects_invalid_password(client: AsyncClient):
    await create_test_user(
        client, email="login+invalid-password@gmail.com", password="password123"
    )

    response = await client.post(
        api_url("tokens"),
        data={
            "username": "login+invalid-password@gmail.com",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password."


@pytest.mark.anyio
async def test_login_rejects_unknown_email(client: AsyncClient):
    response = await client.post(
        api_url("tokens"),
        data={"username": "missing+login@gmail.com", "password": "password123"},
    )

    assert response.status_code == 401


@pytest.mark.anyio
async def test_invalid_token_cannot_access_protected_route(client: AsyncClient):
    response = await client.get(
        api_url("users/me"),
        headers=user_auth_header("not-a-valid-token"),
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired token."


@pytest.mark.anyio
async def test_users_me_requires_authentication(client: AsyncClient):
    response = await client.get(api_url("users/me"))
    assert response.status_code == 401
