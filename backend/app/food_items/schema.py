import datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UsageAction(str, Enum):
    used = "used"
    wasted = "wasted"


class LogUsageRequest(BaseModel):
    action: UsageAction


class FoodItemBase(BaseModel):
    """Food Item Base properties to be shared"""

    name: str = Field(..., min_length=4, max_length=255)
    brand: str | None = Field(None, max_length=30)
    barcode: str | None = Field(None, max_length=100)
    category: str | None = Field(None, max_length=30)
    quantity: Decimal = Field(Decimal("1"), gt=0, max_digits=6, decimal_places=2)
    unit: str | None = Field(None, max_length=30)
    expiration_date: datetime.date | None = Field(None)


class FoodItemCreate(FoodItemBase):
    pass


class FoodItemUpdate(BaseModel):
    name: str | None = Field(None, min_length=4, max_length=255)
    brand: str | None = Field(None, max_length=30)
    barcode: str | None = Field(None, max_length=100)
    category: str | None = Field(None, max_length=30)
    quantity: Decimal | None = Field(None, gt=0, max_digits=6, decimal_places=2)
    unit: str | None = Field(None, max_length=30)
    expiration_date: datetime.date | None = Field(None)


class FoodItemResponse(FoodItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID


class FoodItemsPublic(BaseModel):
    data: list[FoodItemResponse]
