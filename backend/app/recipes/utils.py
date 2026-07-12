import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def get_recipe_information(recipe_id: int) -> dict | None:
    """Get recipe information from API based on recipe ID."""
    params = {
        "apiKey": settings.SPOONACULAR_API_KEY,
        "includeNutrition": False,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                f"https://api.spoonacular.com/recipes/{recipe_id}/information",
                params=params,
            )
            if response.status_code == 200:
                return response.json()
        except Exception:
            return None


async def get_recipes_from_ingredients(ingredients: list):
    """Get recipe suggestions from API based on a list of ingredients."""
    ingredient_list = ",".join(ingredients)

    params = {
        "ingredients": ingredient_list,
        "number": 1,
        "ranking": 1,
        "ignorePantry": False,
        "apiKey": settings.SPOONACULAR_API_KEY,
    }

    # Make API request to get recipes based on ingredients
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(settings.RECIPES_URL, params=params)
            if response.status_code != 200:
                return []
            recipes = response.json()
        except Exception:
            return []

        recipe_list = []
        for item in recipes:
            recipe_info = await get_recipe_information(item["id"])

            recipe_list.append(
                {
                    "recipe_id": item["id"],
                    "name": item["title"],
                    "image_url": item.get("image"),
                    "source_url": recipe_info.get("sourceUrl") if recipe_info else "",
                }
            )
        if recipe_list:
            logger.info(f"Suggestion output keys: {list(recipe_list[0].keys())}")
            logger.info(f"image_url value: {repr(recipe_list[0]['image_url'])}")

    return recipe_list
