import pytest
from app.config import settings
from httpx import AsyncClient

from tests.utils.utils import api_url, create_test_user


@pytest.mark.anyio
async def test_registration_is_rejected_when_closed(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setattr(settings, "USERS_OPEN_REGISTRATION", False)

    response = await client.post(
        api_url("users"),
        json={
            "name": "newuser",
            "email": "newuser@gmail.com",
            "password": "Password1234!",
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == (
        "User registrations are currently closed. Try again at another time."
    )


@pytest.mark.anyio
async def test_create_user_success(client: AsyncClient):
    response = await client.post(
        api_url("users"),
        json={
            "name": "newuser",
            "email": "newuser@gmail.com",
            "password": "Password1234!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "newuser"
    assert data["email"] == "newuser@gmail.com"
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data


@pytest.mark.anyio
async def test_create_user_only_email_password_success(client: AsyncClient):
    response = await client.post(
        api_url("users"),
        json={
            "email": "newuser1@gmail.com",
            "password": "Password1234!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser1@gmail.com"
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data


@pytest.mark.anyio
async def test_create_user_validation_error(client: AsyncClient):
    response = await client.post(
        api_url("users"),
        json={
            "email": "testemail@gmail.com",
        },
    )

    assert response.status_code == 422
    assert "password" in response.text


@pytest.mark.anyio
async def test_create_user_duplicate_email(client: AsyncClient):
    await create_test_user(client)

    response = await client.post(
        api_url("users"),
        json={
            "name": "tester3",
            "email": "tester@gmail.com",
            "password": "Test123!",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Email already registered."
