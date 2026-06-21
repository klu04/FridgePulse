import datetime
from decimal import Decimal
from typing import List
from uuid import UUID

import sqlalchemy
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    text,
    types,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database._model_base import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[UUID] = mapped_column(
        types.Uuid, primary_key=True, server_default=text("gen_random_uuid()")
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str | None] = mapped_column(String(30))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )

    food_items: Mapped[List["FoodItem"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )


class FoodItem(Base):
    __tablename__ = "food_items"
    id: Mapped[UUID] = mapped_column(
        types.Uuid, primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[UUID] = mapped_column(
        types.Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    brand: Mapped[str | None] = mapped_column(String(30))
    barcode: Mapped[str | None] = mapped_column(String(100))
    category: Mapped[str | None] = mapped_column(String(30))
    quantity: Mapped[Decimal] = mapped_column(
        sqlalchemy.Numeric(6, 2), nullable=False, default=Decimal("1.00")
    )
    unit: Mapped[str | None] = mapped_column(String(30))
    expiration_date: Mapped[datetime.date | None] = mapped_column(sqlalchemy.Date)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )

    # Ensure uniqueness so no same barcode is added twice.
    __table_args__ = (UniqueConstraint("user_id", "barcode", name="user_barcode"),)

    owner: Mapped["User"] = relationship(back_populates="food_items")


class UsageLog(Base):
    __tablename__ = "usage_logs"
    id: Mapped[UUID] = mapped_column(
        types.Uuid, primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[UUID] = mapped_column(
        types.Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    food_item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(30))
    action: Mapped[str] = mapped_column(String(10), nullable=False)
    logged_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )

    owner: Mapped["User"] = relationship()


class Recipe(Base):
    __tablename__ = "recipes"
    id: Mapped[UUID] = mapped_column(
        types.Uuid, primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[UUID] = mapped_column(
        types.Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(2000))
    image_url: Mapped[str | None] = mapped_column(Text)
    source_url: Mapped[str | None] = mapped_column(Text)
