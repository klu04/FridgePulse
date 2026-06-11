import pytest
from httpx import AsyncClient

from tests.utils.utils import create_test_user


@pytest.mark.anyio
async def test_create_user_success(client: AsyncClient):
    response = await client.post(
        "/v1/users",
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
        "/v1/users",
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
        "/v1/users",
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
        "/v1/users",
        json={
            "name": "tester3",
            "email": "tester@gmail.com",
            "password": "Test123!",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Email already registered."
