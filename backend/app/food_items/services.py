from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import FoodItem as FoodItemModel
from app.database.models import UsageLog
from app.food_items.exceptions import BarcodeAlreadyExistsError
from app.food_items.schema import (
    FoodItemCreate,
    FoodItemResponse,
    FoodItemsPublic,
    FoodItemUpdate,
    LogUsageRequest,
)


async def create_food_item(
    *, user_id: UUID, food_item_data: FoodItemCreate, session: AsyncSession
):
    if food_item_data.barcode:
        result = await session.execute(
            select(FoodItemModel).where(
                FoodItemModel.user_id == user_id,
                FoodItemModel.barcode == food_item_data.barcode,
            )
        )
        if result.scalar_one_or_none():
            raise BarcodeAlreadyExistsError("An item with this barcode already exists.")

    new_food_item = FoodItemModel(**food_item_data.model_dump(), user_id=user_id)
    session.add(new_food_item)
    await session.commit()
    await session.refresh(new_food_item)
    return new_food_item


async def get_food_items_by_user(user_id: UUID, db: AsyncSession) -> FoodItemsPublic:
    """Get user's food items from the database.

    Args:
        user_id (UUID): ID of the user making the request.
        db (AsyncSession): Async database session.

    Returns:
        FoodItemsPublic: List of food items that the user owns.
    """
    result = await db.execute(
        select(FoodItemModel).where(FoodItemModel.user_id == user_id)
    )
    food_items = result.scalars().all()

    # Validates each food item against the pydantic response schema
    food_items_public = [
        FoodItemResponse.model_validate(food_item) for food_item in food_items
    ]

    return FoodItemsPublic(data=food_items_public)


async def get_food_item(food_item_id: UUID, db: AsyncSession) -> FoodItemModel | None:
    """Get food item.

    Args:
        food_item_id (UUID): ID of the requested food item.
        db (AsyncSession): Async database session.

    Returns:
        FoodItemModel: The food item matching the given ID, or None if not found.
    """
    food_item = await db.get(FoodItemModel, food_item_id)
    return food_item


async def update_food_item(
    *,
    user_id: UUID,
    food_item: FoodItemModel | None,
    food_item_id: UUID,
    update_data: FoodItemUpdate,
    session: AsyncSession,
):

    food_update_data = update_data.model_dump(exclude_unset=True)

    if "barcode" in food_update_data and food_update_data["barcode"] is not None:
        result = await session.execute(
            select(FoodItemModel).where(
                FoodItemModel.user_id == user_id,
                FoodItemModel.barcode == food_update_data["barcode"],
            )
        )
        exist = result.scalar_one_or_none()

        if exist and exist.id != food_item_id:
            raise BarcodeAlreadyExistsError("An item with this barcode already exists.")

    # Update food item
    for key, val in food_update_data.items():
        setattr(food_item, key, val)

    await session.commit()
    await session.refresh(food_item)
    return food_item


async def delete_food_item(food_item: FoodItemModel, session: AsyncSession):

    await session.delete(food_item)
    await session.commit()

    return None


async def log_food_usage(
    user_id: UUID,
    food_item: FoodItemModel,
    body: LogUsageRequest,
    session: AsyncSession,
):

    usage_log = UsageLog(
        user_id=user_id,
        food_item_name=food_item.name,
        category=food_item.category,
        action=body.action.value,
    )

    session.add(usage_log)

    await session.delete(food_item)
    await session.commit()

    return None
