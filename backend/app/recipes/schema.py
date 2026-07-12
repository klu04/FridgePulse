from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RecipeBase(BaseModel):
    recipe_id: int = Field(..., description="Spoonacular recipe ID")
    name: str | None = Field(None, max_length=500)
    image_url: str | None = Field(None)


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    name: str | None = Field(None, max_length=500)
    image_url: str | None = Field(None)


class RecipeResponse(RecipeBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID


class RecipeSuggestion(BaseModel):
    """For live API results - no id/user_id"""

    recipe_id: int
    name: str | None = None
    image_url: str | None = None
    source_url: str | None = None


class RecipeSuggestionListResponse(BaseModel):
    recipes: list[RecipeSuggestion]
