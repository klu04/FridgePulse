import pytest
from httpx import AsyncClient

from tests.utils.utils import api_url, create_test_user, login_user, user_auth_header


@pytest.mark.anyio
async def test_usage_reports_separate_used_and_wasted_items(client: AsyncClient):
    await create_test_user(client)
    headers = user_auth_header(await login_user(client))

    for name, action in (
        ("Apples", "used"),
        ("Apples", "used"),
        ("Bread", "wasted"),
    ):
        item = await client.post(
            api_url("food-items"),
            json={"name": name, "category": "Food"},
            headers=headers,
        )
        response = await client.post(
            api_url(f"food-items/{item.json()['id']}/log-usage"),
            json={"action": action},
            headers=headers,
        )
        assert response.status_code == 204

    used = await client.get(api_url("reports/frequently-used"), headers=headers)
    wasted = await client.get(api_url("reports/frequently-wasted"), headers=headers)

    assert used.status_code == 200
    assert {"name": "Apples", "count": 2, "unit": "times"} in used.json()
    assert wasted.status_code == 200
    assert {"name": "Bread", "count": 1, "unit": "times"} in wasted.json()
    assert all(entry["name"] != "Bread" for entry in used.json())


@pytest.mark.anyio
async def test_unused_report_lists_inventory_items(client: AsyncClient):
    await create_test_user(client)
    headers = user_auth_header(await login_user(client))
    await client.post(
        api_url("food-items"),
        json={"name": "Unlogged item"},
        headers=headers,
    )

    response = await client.get(api_url("reports/unused"), headers=headers)

    assert response.status_code == 200
    assert response.json()[0]["name"] == "Unlogged item"
    assert response.json()[0]["unit"] == "days"


@pytest.mark.anyio
async def test_report_routes_require_authentication(client: AsyncClient):
    response = await client.get(api_url("reports/unused"))
    assert response.status_code == 401


@pytest.mark.anyio
async def test_report_query_parameters_are_validated(client: AsyncClient):
    await create_test_user(client)
    headers = user_auth_header(await login_user(client))

    response = await client.get(
        api_url("reports/frequently-used?days=0"), headers=headers
    )
    assert response.status_code == 422
