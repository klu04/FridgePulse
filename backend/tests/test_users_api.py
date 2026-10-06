import pytest
from httpx import AsyncClient

from tests.utils.utils import api_url, create_test_user, login_user, user_auth_header


@pytest.mark.anyio
async def test_get_current_user(client: AsyncClient):
    user = await create_test_user(client, name="Current User")
    headers = user_auth_header(await login_user(client))

    response = await client.get(api_url("users/me"), headers=headers)

    assert response.status_code == 200
    assert response.json()["id"] == user["id"]
    assert response.json()["email"] == user["email"]
    assert "password_hash" not in response.json()


@pytest.mark.anyio
async def test_update_current_user(client: AsyncClient):
    user = await create_test_user(client)
    headers = user_auth_header(await login_user(client))

    response = await client.patch(
        api_url(f"users/{user['id']}"),
        json={"name": "Updated User", "email": "updateprofile@gmail.com"},
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Updated User"
    assert response.json()["email"] == "updateprofile@gmail.com"


@pytest.mark.anyio
async def test_update_another_user_is_forbidden(client: AsyncClient):
    owner = await create_test_user(client, email="owner+pdate@gmail.com")
    await create_test_user(client, email="otherupdate@gmail.com")
    headers = user_auth_header(await login_user(client, email="otherupdate@gmail.com"))

    response = await client.patch(
        api_url(f"users/{owner['id']}"),
        json={"name": "Changed"},
        headers=headers,
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Not authorized to update this user."


@pytest.mark.anyio
async def test_delete_current_user(client: AsyncClient):
    user = await create_test_user(client)
    headers = user_auth_header(await login_user(client))

    response = await client.delete(api_url(f"users/{user['id']}"), headers=headers)

    assert response.status_code == 204
    current_user = await client.get(api_url("users/me"), headers=headers)
    assert current_user.status_code == 401


@pytest.mark.anyio
async def test_delete_another_user_is_forbidden(client: AsyncClient):
    owner = await create_test_user(client, email="ownerdelete@gmail.com")
    await create_test_user(client, email="otherdelete@gmail.com")
    headers = user_auth_header(await login_user(client, email="otherdelete@gmail.com"))

    response = await client.delete(api_url(f"users/{owner['id']}"), headers=headers)

    assert response.status_code == 403
    assert response.json()["detail"] == "Not authorized to delete this user."
