from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.services import CurrentUser
from app.database.db import get_db
from app.database.models import FoodItem as FoodItemModel
from app.database.models import Recipe as RecipeModel
from app.external_api_services.recipe_api import get_recipes_from_ingredients
from app.recipes.schema import RecipeCreate, RecipeListResponse, RecipeResponse

router = APIRouter()


def calculate_expiration(user_items):
    """calculates expiration status of food items. Retuns a list of food items that are expiring within 3 days."""
    today = date.today()
    food_items = []
    for item in user_items:
        if item.expiration_date and item.expiration_date <= today + timedelta(days=3):
            food_items.append(item.name)

    return food_items


@router.get("/get-recipe-suggestions", response_model=RecipeListResponse)
async def get_recipe_suggestions(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Gets food items for the user's current inventory that are expiring within 3 days for a user."""

    result = await db.execute(
        select(FoodItemModel).where(FoodItemModel.user_id == current_user.id)
    )

    user_items = result.scalars().all()
    items_expiring_soon = calculate_expiration(user_items)
    recipes = await get_recipes_from_ingredients(items_expiring_soon)

    return {"recipes": recipes}


@router.post("", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
async def save_recipe(
    recipe_data: RecipeCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Saves a recipe to user's recipes."""

    # Check if the recipe was already saved
    result = await db.execute(
        select(RecipeModel).where(
            RecipeModel.user_id == current_user.id,
            RecipeModel.title == recipe_data.title,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Recipe is already saved."
        )

    # Exclude recipe_ingredients from the DB
    new_saved_recipe = RecipeModel(
        **recipe_data.model_dump(exclude={"id", "recipe_ingredients"}),
        user_id=current_user.id,
    )
    db.add(new_saved_recipe)
    await db.commit()
    await db.refresh(new_saved_recipe)

    # Return recipe with ingredients manually added
    return {
        "title": new_saved_recipe.title,
        "description": new_saved_recipe.description,
        "image_url": new_saved_recipe.image_url,
        "source_url": new_saved_recipe.source_url,
        "recipe_ingredients": recipe_data.recipe_ingredients,
    }


@router.get("", response_model=list[RecipeResponse])
async def get_saved_recipes(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Gets all saved recipes for the current user."""

    result = await db.execute(
        select(RecipeModel).where(RecipeModel.user_id == current_user.id)
    )
    saved_recipes = result.scalars().all()

    # dictionary of recipes.
    result = []

    for recipe in saved_recipes:
        result.append(
            {
                "title": recipe.title,
                "description": recipe.description,
                "image_url": recipe.image_url,
                "source_url": recipe.source_url,
                "recipe_ingredients": [],
            }
        )

    return result
