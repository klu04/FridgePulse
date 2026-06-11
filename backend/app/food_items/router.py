from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.services import CurrentUser
from app.database.db import get_db
from app.food_items.exceptions import BarcodeAlreadyExistsError
from app.food_items.schema import (
    FoodItemCreate,
    FoodItemResponse,
    FoodItemsPublic,
    FoodItemUpdate,
    LogUsageRequest,
)

from . import services

router = APIRouter()


@router.post("", response_model=FoodItemResponse, status_code=status.HTTP_201_CREATED)
async def create_food_item(
    current_user: CurrentUser,
    food_item_data: FoodItemCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Add food item to inventory.

    **Args**:
    - **current_user (CurrentUser)**: The authenticated user making the request.
    - **food_item_data (FoodItemCreate)**: JSON data containing food inventory details.
    - **db (Annotated[AsyncSession, Depends)**: Async database session

    **Raises**:
    - **HTTPException**: Raise 401 if user is not authorized.
    - **HTTPException**: Raise 404 if specified user not found.
    - **HTTPException**: Raise 409 if item with barcode already exists.
    """

    try:
        new_food_item = await services.create_food_item(
            user_id=current_user.id, food_item_data=food_item_data, session=db
        )
    except BarcodeAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    return new_food_item


@router.get("", response_model=FoodItemsPublic)
async def read_food_items(
    current_user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]
):
    """Read user's items in their pantry.

    **Args**:
    - **current_user (CurrentUser):** The authenticated user making the request.
    - **db (Annotated[AsyncSession, Depends)**: Async database session

    """

    result = await services.get_food_items_by_user(user_id=current_user.id, db=db)
    return result


@router.get("/{food_item_id}", response_model=FoodItemResponse)
async def read_food_item(
    current_user: CurrentUser,
    food_item_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get a specific food item by their ID.

    **Args**:
    - **current_user (CurrentUser)**: The authenticated user making the request.
    - **food_item_id (UUID)**: The UUID of the food item in the inventory.
    - **db (Annotated[AsyncSession, Depends)**: Async database session

    **Raises**:
    - **HTTPException**: 404 response if user does not exist.
    - **HTTPException**: 404 response if food item does not exist or user is not authorized to view the item..
    """
    food_item = await services.get_food_item(food_item_id=food_item_id, db=db)
    if not food_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Food item not found."
        )
    if food_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized."
        )
    return food_item


@router.patch("/{food_item_id}", response_model=FoodItemResponse)
async def partial_update_food_item(
    current_user: CurrentUser,
    food_item_id: UUID,
    food_item_data: FoodItemUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Partially updates a food item by its ID.

    - Only include fields that you want to update in the request body.

    - Omit any fields that remain unchanged.

    **Args**:
    - **current_user (CurrentUser)**: The authenticated user making the request.
    - **food_item_id (UUID)**: The UUID of the food item in the inventory.
    - **update_data (FoodItemUpdate)**: JSON data containing food inventory details to update.
    - **db (Annotated[AsyncSession, Depends)**: Async database session

    **Raises**:
    - **HTTPException**: 401 response if user is not authorized to update food item.
    - **HTTPException**: 404 response if food item does not exist.
    - **HTTPException**: 409 response if barcode already exists.
    """

    food_item = await services.get_food_item(food_item_id=food_item_id, db=db)
    if not food_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Food item not found."
        )
    if food_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized."
        )

    try:
        update_food_data = await services.update_food_item(
            user_id=current_user.id,
            food_item=food_item,
            food_item_id=food_item_id,
            update_data=food_item_data,
            session=db,
        )
    except BarcodeAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    return update_food_data


@router.delete("/{food_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_food_item(
    current_user: CurrentUser,
    food_item_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Delete food item by ID.

    **Args**:
    - **current_user (CurrentUser)**: The authenticated user making the request.
    - **food_item_id (UUID)**: The UUID of the food item in the inventory.
    - **db (Annotated[AsyncSession, Depends)**: Async database session

    **Raises**:
    - **HTTPException**: 404 response if user does not exist.
    - **HTTPException**: 404 response if food item does not exist.
    """
    food_item = await services.get_food_item(food_item_id=food_item_id, db=db)
    if not food_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Food item not found."
        )
    if food_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized."
        )

    delete_food_item = await services.delete_food_item(food_item=food_item, session=db)

    return delete_food_item


@router.post("/{food_item_id}/log-usage", status_code=status.HTTP_204_NO_CONTENT)
async def log_usage(
    current_user: CurrentUser,
    food_item_id: UUID,
    body: LogUsageRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Log a food item as used or wasted, then remove it from inventory."""
    food_item = await services.get_food_item(food_item_id=food_item_id, db=db)
    if not food_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Food item not found."
        )
    if food_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized."
        )

    result = await services.log_food_usage(
        user_id=current_user.id, food_item=food_item, body=body, session=db
    )

    return result
