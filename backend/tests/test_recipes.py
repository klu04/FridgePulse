from datetime import date, timedelta

import pytest
from httpx import AsyncClient

from tests.utils.utils import api_url, create_test_user, login_user, user_auth_header


@pytest.mark.anyio
async def test_recipe_suggestions_do_not_call_spoonacular(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
):
    await create_test_user(client)
    headers = user_auth_header(await login_user(client))
    await client.post(
        api_url("food-items"),
        json={
            "name": "Spinach",
            "expiration_date": (date.today() + timedelta(days=1)).isoformat(),
        },
        headers=headers,
    )
    requested_ingredients: list[list[str]] = []

    async def fake_recipe_search(ingredients: list[str]) -> list[dict]:
        requested_ingredients.append(ingredients)
        return [
            {
                "recipe_id": 123,
                "name": "Spinach Salad",
                "image_url": "https://testingrecipes.testing/salad.jpg",
                "source_url": "https://testingrecipes.testing/salad",
            }
        ]

    monkeypatch.setattr(
        "app.recipes.router.get_recipes_from_ingredients", fake_recipe_search
    )

    response = await client.get(
        api_url("recipes/get-recipe-suggestions"), headers=headers
    )

    assert response.status_code == 200
    assert requested_ingredients == [["Spinach"]]
    assert response.json()["recipes"][0]["name"] == "Spinach Salad"


@pytest.mark.anyio
async def test_saved_recipe_crud_and_duplicate_rejection(client: AsyncClient):
    await create_test_user(client)
    headers = user_auth_header(await login_user(client))
    recipe_data = {
        "recipe_id": 12345,
        "name": "Spinach Salad",
        "image_url": "https://testingrecipes.testing/salad.jpg",
    }

    created = await client.post(api_url("recipes"), json=recipe_data, headers=headers)
    assert created.status_code == 201
    recipe = created.json()
    assert recipe["recipe_id"] == recipe_data["recipe_id"]

    duplicate = await client.post(api_url("recipes"), json=recipe_data, headers=headers)
    assert duplicate.status_code == 409
    assert duplicate.json()["detail"] == "Recipe is already saved."

    listed = await client.get(api_url("recipes"), headers=headers)
    assert listed.status_code == 200
    assert [entry["id"] for entry in listed.json()] == [recipe["id"]]

    fetched = await client.get(api_url(f"recipes/{recipe['id']}"), headers=headers)
    assert fetched.status_code == 200
    assert fetched.json()["id"] == recipe["id"]

    updated = await client.patch(
        api_url(f"recipes/{recipe['id']}"),
        json={"name": "Updated Spinach Salad"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Updated Spinach Salad"

    deleted = await client.delete(api_url(f"recipes/{recipe['id']}"), headers=headers)
    assert deleted.status_code == 204


@pytest.mark.anyio
async def test_saved_recipe_routes_require_authentication(client: AsyncClient):
    response = await client.get(api_url("recipes"))
    assert response.status_code == 401


@pytest.mark.anyio
async def test_saved_recipe_not_found(client: AsyncClient):
    await create_test_user(client)
    headers = user_auth_header(await login_user(client))
    response = await client.get(
        api_url("recipes/9eb652dc-49b6-4c59-a372-4a5016ab51a0"),
        headers=headers,
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Saved recipe not found."
