from fastapi import APIRouter

from app.auth.router import router as auth_router
from app.external_api_services.router import router as vision_router
from app.food_items.router import router as food_items_router
from app.recipes.router import router as recipe_router
from app.reports.router import router as reports_router
from app.users.router import router as users_router

api_router = APIRouter()

api_router.include_router(auth_router, tags=["login"])

api_router.include_router(
    food_items_router,
    prefix="/food-items",
    tags=["Food Items"],
)
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(reports_router, tags=["Reports"])
api_router.include_router(vision_router, prefix="/vision", tags=["Vision"])
api_router.include_router(recipe_router, prefix="/recipes", tags=["Recipes"])
