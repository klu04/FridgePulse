from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schema import Token
from app.auth.services import (
    create_access_token,
    verify_password,
)
from app.config import settings
from app.database.db import get_db
from app.database.models import User as UserModel

router = APIRouter()


@router.post("/tokens")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Token:
    """Authenticate a user and return an access token.

    **NOTE**: OAuth2PasswordRequestForm uses the **username** field, but we will
    use an **email** instead.

    **Args**:
    - **form_data (Annotated[OAuth2PasswordRequestForm, Depends)**: Login form data.
    - **db (Annotated[AsyncSession, Depends)**: Database session.

    **Raises**:
    - **HTTPException**: 401 if email or password is incorrect.

    **Returns**:
    - **Token**: Access token and token type.
    """

    # Find user by email
    result = await db.execute(
        select(UserModel).where(
            func.lower(UserModel.email) == form_data.username.lower()
        ),
    )
    user = result.scalar_one_or_none()

    # Verify user and password
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create an access token with user id
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires,
    )
    return Token(access_token=access_token, token_type="bearer")
