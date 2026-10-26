from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser
from app.config import settings
from app.database.db import get_db
from app.users.exceptions import EmailAlreadyExistsError, UserNotFoundError
from app.users.schema import UserCreate, UserPrivate, UserUpdate

from . import services

router = APIRouter()


@router.post("", response_model=UserPrivate, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_register: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Creates a new user.

    **Args**:
    - **user (UserCreate)**: Pydantic Schema for validation check
    - **db (Annotated[AsyncSession, Depends)**: Session

    **Raises**:
    - **HTTPException**: Raises 409 on duplicate email.
    """

    if not settings.USERS_OPEN_REGISTRATION:
        raise HTTPException(
            status_code=403,
            detail="User registrations are currently closed. Try again at another time.",
        )
    try:
        user = await services.register_user(user_create=user_register, session=db)
    except EmailAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    return user


@router.get("/me", response_model=UserPrivate)
async def read_user_info_me(current_user: CurrentUser):
    """
    Return information of current user.

    **Args**:
    - **current_user (CurrentUser)**: The authenticated user making the request.
    """
    return current_user


@router.patch("/{user_id}", response_model=UserPrivate)
async def partial_update_user(
    user_id: UUID,
    current_user: CurrentUser,
    user_data: UserUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Update or partially update a user.

    **Args**:
    - **user_id (UUID)**: Id of user.
    - **current_user (CurrentUser)**: The authenticated user making the request.
    - **user_data (UserUpdate)**: original user data
    - **db (Annotated[AsyncSession, Depends)**: session

    **Raises**:
    - **HTTPException**: 403 if user not authorized to update user.
    - **HTTPException**: Raises 404 if user not found.
    - **HTTPException**: Raises 409 if email address is a duplicate.
    """

    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user.",
        )

    try:
        user = await services.partial_update_user(
            user_id=user_id, user_data=user_data, session=db
        )
    except EmailAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except UserNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Delete a user.

    **Args**:
    - **user_id (UUID)**: Id of user
    - **current_user (CurrentUser)**: The authenticated user making the request.
    - **db (Annotated[AsyncSession, Depends)**: Session

    **Raises**:
    - **HTTPException**: 403 if user not authorized to delete user.
    - **HTTPException**: 404 if user not found.
    """

    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this user.",
        )

    try:
        await services.delete_user(user_id=user_id, session=db)
    except UserNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
