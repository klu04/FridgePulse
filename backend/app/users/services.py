from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.services import get_password_hash
from app.database.models import User as UserModel
from app.users.exceptions import EmailAlreadyExistsError, UserNotFoundError
from app.users.schema import UserCreate, UserUpdate


async def register_user(*, user_create: UserCreate, session: AsyncSession) -> UserModel:
    existing_email = await get_user_by_email(email=user_create.email, session=session)
    if existing_email:
        raise EmailAlreadyExistsError("Email already registered.")

    new_user = UserModel(
        name=user_create.name,
        email=user_create.email,
        password_hash=get_password_hash(user_create.password),
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user


async def get_user_by_email(*, email: str, session: AsyncSession) -> UserModel | None:
    """Get user by their email address.

    Args:
        email (str): The email of the user that owns the inventory.
        db (Annotated[AsyncSession, Depends): Async database session.

    Returns:
        UserModel | None: The user connected to the given email, or None if not found.
    """
    result = await session.execute(
        select(UserModel).where(func.lower(UserModel.email) == email.lower()),
    )
    user = result.scalar_one_or_none()
    return user


async def update_user(
    *, update_data: dict, user_model: UserModel, session: AsyncSession
):
    # Update user info
    for key, val in update_data.items():
        # Make email lowercase
        setattr(user_model, key, val.lower() if key == "email" else val)

    await session.commit()
    await session.refresh(user_model)
    return user_model


async def partial_update_user(
    user_id: UUID,
    user_data: UserUpdate,
    session: AsyncSession,
) -> UserModel:

    user = await session.get(UserModel, user_id)
    if not user:
        raise UserNotFoundError("User not found.")

    # only update fields that were sent in the request
    user_update_data = user_data.model_dump(exclude_unset=True)

    # Check if email address already exists (case-insensitive)
    email = user_update_data.get("email")

    if email is not None and email.lower() != user.email.lower():
        exist = await get_user_by_email(email=email, session=session)

        if exist and exist.id != user_id:
            raise EmailAlreadyExistsError("Email already registered.")

    # Update user info
    for key, val in user_update_data.items():
        # Make email lowercase
        setattr(user, key, val.lower() if key == "email" else val)

    await session.commit()
    await session.refresh(user)

    return user


async def delete_user(*, user_id: UUID, session: AsyncSession):
    user = await session.get(UserModel, user_id)
    if not user:
        raise UserNotFoundError("User not found.")

    await session.delete(user)
    await session.commit()

    return None
