import random
import string

from httpx import AsyncClient


async def create_test_user(
    client: AsyncClient,
    name: str | None = "testuser",
    email: str = "tester@gmail.com",
    password: str = "test1234",
) -> dict:
    response = await client.post(
        "v1/users",
        json={
            "name": name,
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 201, f"Failed to create user: {response.text}"
    return response.json()


async def login_user(
    client: AsyncClient,
    email: str = "tester@gmail.com",
    password: str = "test1234",
) -> str:
    response = await client.post(
        "v1/tokens",
        data={
            "username": email,
            "password": password,
        },
    )

    assert response.status_code == 200, f"Failed to login: {response.text}"
    return response.json()["access_token"]


def user_auth_header(token: str) -> dict[str, str]:

    return {"Authorization": f"Bearer {token}"}


def random_string() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=15))


def random_upc() -> str:
    str_random_upc = str(random.randint(10**12, 10**13 - 1))
    return str_random_upc


def random_units() -> str:
    units = ["gallon", "pack", "lb", "grams", "liter", "quart", "loaf", "box"]
    return random.choice(units)
