from app.config import settings
import httpx

RECIPES_URL = "https://api.spoonacular.com/recipes/findByIngredients"


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


async def get_recipes_from_ingredients(ingredients):
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
            response = await client.get(RECIPES_URL, params=params)
            if response.status_code == 200:
                recipes = response.json()
            else:
                return []
        except Exception:
            return []

    normalized_recipes = []
    for item in recipes:
        recipe_info = await get_recipe_information(item["id"])
        normalized_recipes.append(
            {
                "title": item["title"],
                "description": recipe_info.get("summary", "") if recipe_info else "",
                "image_url": item.get("image"),
                "source_url": recipe_info.get("sourceUrl") if recipe_info else "",
                "recipe_ingredients": [
                    i["name"] for i in item.get("usedIngredients", [])
                ],
            }
        )

    return normalized_recipes
