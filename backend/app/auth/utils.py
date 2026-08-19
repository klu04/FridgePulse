from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schema import TokenPayload
from app.config import settings
from app.database.db import get_db
from app.database.models import User as UserModel

# NOTE: Default hasher = Argon2
password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_URL}/tokens")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies if the password matches the given hash.

    Args:
        plain_password (str): The password to be checked.
        hashed_password (str): The hashed password to be verified.

    Returns:
        bool: True if the password matches the hash, False otherwise

    Reference: https://frankie567.github.io/pwdlib/reference/pwdlib/#pwdlib.PasswordHash.verify
    """
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hashes the password.

    Args:
        password (str): The password to be hashed.

    Returns:
        str: The hashed password.
    """
    return password_hash.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token using a user's id.

    Args:
        data (dict): user id to create the JWT access token.
        expires_delta (timedelta | None, optional): Max time before JWT expires. Defaults to None.

    Returns:
        str: A JSON Web Token

    References: https://pyjwt.readthedocs.io/en/stable/api.html
                https://pyjwt.readthedocs.io/en/stable/usage.html
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY.get_secret_value(),
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """A dependency to get current user information.

    Args:
        token (Annotated[str, Depends): Received JWT token.
        db (Annotated[AsyncSession, Depends): Database session.

    Raises:
        HTTPException: 401 Unauthorized if invalid or expired token.
        HTTPException: 401 Unauthorized if user not found.
    """
    # Verify token and get user id
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY.get_secret_value(),
            algorithms=[settings.ALGORITHM],
            options={"require": ["exp", "sub"]},
        )
        user_id = TokenPayload(**payload)  # Validate the token payload
    except InvalidTokenError, ValidationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Look for user id in the database
    user = await db.get(UserModel, user_id.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


CurrentUser = Annotated[UserModel, Depends(get_current_user)]
