from decimal import Decimal
from uuid import uuid4

import pytest
from httpx import AsyncClient

from tests.utils.utils import (
    create_test_user,
    login_user,
    random_string,
    random_units,
    random_upc,
    user_auth_header,
)


@pytest.mark.anyio
async def test_create_food_item_success(client: AsyncClient):
    user = await create_test_user(client)
    token = await login_user(client)
    headers = user_auth_header(token)

    response = await client.post(
        "/v1/food-items",
        json={
            "name": "Whole Milk",
            "brand": "Horizon Organic",
            "barcode": "742365008412",
            "category": "Dairy",
            "quantity": 1.00,
            "unit": "gallon",
            "expiration_date": "2026-05-20",
        },
        headers=headers,
    )
    assert response.status_code == 201
    content = response.json()
    assert content["name"] == "Whole Milk"
    assert content["brand"] == "Horizon Organic"
    assert content["barcode"] == "742365008412"
    assert content["category"] == "Dairy"
    assert Decimal(content["quantity"]) == Decimal("1.00")
    assert content["unit"] == "gallon"
    assert content["expiration_date"] == "2026-05-20"
    assert content["user_id"] == user["id"]
    assert "id" in content


@pytest.mark.anyio
async def test_create_food_item_name_only_success(client: AsyncClient):
    user = await create_test_user(client)
    token = await login_user(client)
    headers = user_auth_header(token)

    response = await client.post(
        "v1/food-items", json={"name": "Whole Milk", "quantity": 1.00}, headers=headers
    )
    assert response.status_code == 201
    content = response.json()
    assert content["name"] == "Whole Milk"
    assert Decimal(content["quantity"]) == Decimal("1.00")
    assert content["user_id"] == user["id"]
    assert "id" in content


@pytest.mark.anyio
async def test_create_food_item_duplicate_barcode(client: AsyncClient):
    user = await create_test_user(client)
    token = await login_user(client)
    headers = user_auth_header(token)

    add_item_1 = await client.post(
        "/v1/food-items",
        json={
            "name": "Whole Milk",
            "brand": "Horizon Organic",
            "barcode": "742365008412",
            "category": "Dairy",
            "quantity": 1.00,
            "unit": "gallon",
            "expiration_date": "2026-05-20",
        },
        headers=headers,
    )

    assert add_item_1.status_code == 201
    content = add_item_1.json()
    assert content["user_id"] == user["id"]

    add_item_2 = await client.post(
        "/v1/food-items",
        json={
            "name": "Whole Milk",
            "brand": "Horizon Organic",
            "barcode": "742365008412",
            "category": "Dairy",
            "quantity": 1.00,
            "unit": "gallon",
            "expiration_date": "2026-05-20",
        },
        headers=headers,
    )

    assert add_item_2.status_code == 409
    content = add_item_2.json()
    assert content["detail"] == "An item with this barcode already exists."


@pytest.mark.anyio
async def test_create_food_item_unauthorized(client: AsyncClient):

    response = await client.post(
        "/v1/food-items",
        json={
            "name": "Whole Milk",
            "brand": "Horizon Organic",
            "barcode": "742365008412",
            "category": "Dairy",
            "quantity": 1.00,
            "unit": "gallon",
            "expiration_date": "2026-05-20",
        },
    )
    assert response.status_code == 401
    content = response.json()
    assert content["detail"] == "Not authenticated"


@pytest.mark.anyio
async def test_read_food_item_success(client: AsyncClient):
    user = await create_test_user(client)
    token = await login_user(client)
    headers = user_auth_header(token)

    # Create food item
    add_food_item = await client.post(
        "/v1/food-items",
        json={
            "name": "Whole Milk",
            "brand": "Horizon Organic",
            "barcode": "742365008412",
            "category": "Dairy",
            "quantity": 1.00,
            "unit": "gallon",
            "expiration_date": "2026-05-20",
        },
        headers=headers,
    )

    food_item_id = add_food_item.json()["id"]

    response = await client.get(f"v1/food-items/{food_item_id}", headers=headers)
    assert response.status_code == 200

    content = response.json()

    assert Decimal(content["quantity"]) == Decimal("1.00")
    assert content["unit"] == "gallon"
    assert content["expiration_date"] == "2026-05-20"
    assert content["id"] == food_item_id
    assert content["user_id"] == user["id"]


@pytest.mark.anyio
async def test_read_food_item_not_found(client: AsyncClient):
    await create_test_user(client)
    token = await login_user(client)
    headers = user_auth_header(token)

    food_item_id = uuid4()

    response = await client.get(f"v1/food-items/{food_item_id}", headers=headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Food item not found."


@pytest.mark.anyio
async def test_read_food_items_success(client: AsyncClient):
    await create_test_user(client)
    token = await login_user(client)
    headers = user_auth_header(token)

    # Create 5 random food items
    for i in range(5):
        add_food_item = await client.post(
            "/v1/food-items",
            json={
                "name": random_string(),
                "brand": random_string(),
                "barcode": random_upc(),
                "category": random_string(),
                "quantity": 1.0 + i,
                "unit": random_units(),
                "expiration_date": f"2026-04-{i + 1:02d}",
            },
            headers=headers,
        )
        assert add_food_item.status_code == 201

    response = await client.get("v1/food-items", headers=headers)
    assert response.status_code == 200
    content = response.json()["data"]
    assert len(content) >= 5


@pytest.mark.anyio
async def test_update_food_item_success(client: AsyncClient):
    await create_test_user(client)
    token = await login_user(client)
    headers = user_auth_header(token)

    add_food_item = await client.post(
        "/v1/food-items",
        json={
            "name": "Sourdough Bread",
            "brand": "Dave's Killer Bread",
            "barcode": "013764101628",
            "category": "Bakery",
            "quantity": 1.00,
            "unit": "Loaf",
            "expiration_date": "2026-05-30",
        },
        headers=headers,
    )
    food_item_id = add_food_item.json()["id"]
    assert add_food_item.status_code == 201

    updated_data = {
        "name": "Supreme Sourdough",
        "brand": "Dave's Killer Bread - Updated",
        "barcode": random_upc(),
        "category": "Bread",
        "quantity": 2.00,
        "unit": "Loaves",
        "expiration_date": "2025-06-21",
    }

    response = await client.patch(
        f"/v1/food-items/{food_item_id}", json=updated_data, headers=headers
    )

    assert response.status_code == 200
    content = response.json()
    assert content["name"] == updated_data["name"]
    assert content["brand"] == updated_data["brand"]
    assert content["barcode"] == updated_data["barcode"]
    assert content["category"] == updated_data["category"]
    assert Decimal(content["quantity"]) == Decimal(updated_data["quantity"])
    assert content["unit"] == updated_data["unit"]
    assert content["expiration_date"] == updated_data["expiration_date"]


@pytest.mark.anyio
async def test_partial_update_food_item_success(client: AsyncClient):
    await create_test_user(client)
    token = await login_user(client)
    headers = user_auth_header(token)

    add_food_item = await client.post(
        "/v1/food-items",
        json={
            "name": random_string(),
            "quantity": 1.00,
            "unit": "gallon",
        },
        headers=headers,
    )
    food_item_id = add_food_item.json()["id"]
    original_data = add_food_item.json()
    assert add_food_item.status_code == 201

    updated_data = {
        "name": "Updated Name",
        "quantity": 2.00,
    }
    response = await client.patch(
        f"v1/food-items/{food_item_id}", json=updated_data, headers=headers
    )

    assert response.status_code == 200
    content = response.json()
    assert content["name"] == updated_data["name"]
    assert Decimal(content["quantity"]) == Decimal(updated_data["quantity"])

    assert content["unit"] == original_data["unit"]


@pytest.mark.anyio
async def test_partial_update_food_item_other_user_item(client: AsyncClient):
    # User 1
    await create_test_user(client, email_address="newuser@gmail.com")
    token_1 = await login_user(client, email_address="newuser@gmail.com")

    add_food_item = await client.post(
        "/v1/food-items",
        json={
            "name": random_string(),
            "quantity": 1.00,
            "unit": "gallon",
        },
        headers=user_auth_header(token_1),
    )
    food_item_id = add_food_item.json()["id"]

    # User 2
    await create_test_user(client, email_address="newuser2@gmail.com")
    token_2 = await login_user(client, email_address="newuser2@gmail.com")

    response = await client.patch(
        f"/v1/food-items/{food_item_id}",
        json={
            "name": random_string(),
            "quantity": 1.00,
            "unit": "gallon",
        },
        headers=user_auth_header(token_2),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "User not authorized."


@pytest.mark.anyio
async def test_delete_food_item_success(client: AsyncClient):
    await create_test_user(client)
    token = await login_user(client)
    headers = user_auth_header(token)

    add_food_item = await client.post(
        "/v1/food-items",
        json={
            "name": random_string(),
            "quantity": 1.00,
            "unit": "gallon",
        },
        headers=headers,
    )
    food_item_id = add_food_item.json()["id"]

    response = await client.delete(
        f"/v1/food-items/{food_item_id}",
        headers=headers,
    )

    assert response.status_code == 204


@pytest.mark.anyio
async def test_delete_food_item_not_found(client: AsyncClient):
    await create_test_user(client)
    token = await login_user(client)
    headers = user_auth_header(token)

    await client.post(
        "/v1/food-items",
        json={
            "name": random_string(),
            "quantity": 1.00,
            "unit": "gallon",
        },
        headers=headers,
    )
    food_item_id = uuid4()

    response = await client.delete(
        f"/v1/food-items/{food_item_id}",
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Food item not found."


@pytest.mark.anyio
async def test_delete_food_item_other_user_item(client: AsyncClient):
    # Create user 1 and add a food item
    await create_test_user(client, email_address="newuser@gmail.com")
    token_1 = await login_user(client, email_address="newuser@gmail.com")

    add_food_item = await client.post(
        "/v1/food-items",
        json={
            "name": random_string(),
            "quantity": 1.00,
            "unit": "gallon",
        },
        headers=user_auth_header(token_1),
    )
    food_item_id = add_food_item.json()["id"]

    # Create user 2 and attempt to delete user 1's food item
    await create_test_user(client, email_address="newuser2@gmail.com")
    token_2 = await login_user(client, email_address="newuser2@gmail.com")

    response = await client.delete(
        f"/v1/food-items/{food_item_id}",
        headers=user_auth_header(token_2),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "User not authorized."
