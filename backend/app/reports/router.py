import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.utils import CurrentUser
from app.database.db import get_db
from app.database.models import FoodItem as FoodItemModel
from app.database.models import UsageLog
from app.reports.schema import ReportItem

router = APIRouter()


@router.get("/reports/frequently-used", response_model=list[ReportItem])
async def frequently_used(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    days: int = Query(default=90, ge=1, le=365),
    limit: int = Query(default=10, ge=1, le=50),
):
    """Top items marked as 'used' in the last N days."""
    since = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)
    result = await db.execute(
        select(
            UsageLog.food_item_name,
            func.count().label("cnt"),
        )
        .where(
            UsageLog.user_id == current_user.id,
            UsageLog.action == "used",
            UsageLog.logged_at >= since,
        )
        .group_by(UsageLog.food_item_name)
        .order_by(func.count().desc())
        .limit(limit)
    )
    rows = result.all()
    return [ReportItem(name=row[0], count=row[1], unit="times") for row in rows]


@router.get("/reports/frequently-wasted", response_model=list[ReportItem])
async def frequently_wasted(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    days: int = Query(default=90, ge=1, le=365),
    limit: int = Query(default=10, ge=1, le=50),
):
    """Top items marked as 'wasted' in the last N days."""
    since = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)
    result = await db.execute(
        select(
            UsageLog.food_item_name,
            func.count().label("cnt"),
        )
        .where(
            UsageLog.user_id == current_user.id,
            UsageLog.action == "wasted",
            UsageLog.logged_at >= since,
        )
        .group_by(UsageLog.food_item_name)
        .order_by(func.count().desc())
        .limit(limit)
    )
    rows = result.all()
    return [ReportItem(name=row[0], count=row[1], unit="times") for row in rows]


@router.get("/reports/unused", response_model=list[ReportItem])
async def unused_items(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(default=10, ge=1, le=50),
):
    """Current food items that have been in inventory the longest."""
    result = await db.execute(
        select(
            FoodItemModel.name,
            FoodItemModel.created_at,
        )
        .where(FoodItemModel.user_id == current_user.id)
        .order_by(FoodItemModel.created_at.asc())
        .limit(limit)
    )
    rows = result.all()

    now = datetime.datetime.now(datetime.timezone.utc)
    items = []
    for row in rows:
        days_in_inventory = (now - row[1]).days
        items.append(ReportItem(name=row[0], count=days_in_inventory, unit="days"))

    return items
