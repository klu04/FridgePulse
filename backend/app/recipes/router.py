from datetime import date, timedelta
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.utils import CurrentUser
from app.database.db import get_db
from app.database.models import FoodItem as FoodItemModel
from app.database.models import Recipe as RecipeModel
from app.recipes.schema import (
    RecipeCreate,
    RecipeResponse,
    RecipeSuggestionListResponse,
    RecipeUpdate,
)
from app.recipes.utils import get_recipes_from_ingredients

router = APIRouter()


def calculate_expiration(user_items):
    """calculates expiration status of food items. Retuns a list of food items that are expiring within 3 days."""
    today = date.today()
    food_items = []
    for item in user_items:
        if item.expiration_date and item.expiration_date <= today + timedelta(days=3):
            food_items.append(item.name)

    return food_items


@router.get("/get-recipe-suggestions", response_model=RecipeSuggestionListResponse)
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

    new_recipes = await get_recipes_from_ingredients(items_expiring_soon)

    return RecipeSuggestionListResponse(recipes=new_recipes)


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
            RecipeModel.recipe_id == recipe_data.recipe_id,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Recipe is already saved."
        )

    new_saved_recipe = RecipeModel(
        **recipe_data.model_dump(),
        user_id=current_user.id,
    )

    db.add(new_saved_recipe)
    await db.commit()
    await db.refresh(new_saved_recipe)

    return new_saved_recipe


@router.get("/{saved_recipe_id}", response_model=RecipeResponse)
async def get_saved_recipe(
    current_user: CurrentUser,
    saved_recipe_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    saved_recipe = await db.get(RecipeModel, saved_recipe_id)
    if not saved_recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Saved recipe not found."
        )
    if saved_recipe.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized."
        )
    return saved_recipe


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

    return saved_recipes


@router.patch("/{saved_recipe_id}", response_model=RecipeResponse)
async def partial_update_saved_recipe(
    current_user: CurrentUser,
    saved_recipe_id: UUID,
    saved_recipe_data: RecipeUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    saved_recipe = await db.get(RecipeModel, saved_recipe_id)
    if not saved_recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Saved recipe not found."
        )
    if saved_recipe.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized."
        )

    update_data = saved_recipe_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(saved_recipe, field, value)

    await db.commit()
    await db.refresh(saved_recipe)
    return saved_recipe


@router.delete("/{saved_recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_recipe(
    current_user: CurrentUser,
    saved_recipe_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    saved_recipe = await db.get(RecipeModel, saved_recipe_id)
    if not saved_recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Saved recipe not found."
        )
    if saved_recipe.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized."
        )

    await db.delete(saved_recipe)
    await db.commit()
