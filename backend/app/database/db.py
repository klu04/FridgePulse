from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.database.models import User
from app.users.schema import UserCreate

engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI)
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db(session: AsyncSession) -> None:
    """Create first admin account"""
    from app.users.services import register_user

    result = await session.execute(
        select(User).where(User.email == settings.FIRST_SUPERUSER_EMAIL)
    )
    user = result.scalar_one_or_none()

    if not user:
        user_create = UserCreate(
            email=settings.FIRST_SUPERUSER_EMAIL,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = await register_user(user_create=user_create, session=session)


async def get_db():
    """Session Dependency"""
    if AsyncSessionLocal is None:
        raise Exception("Database is not initialized")
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            # Rollback session on exception to maintain data integrity.
            await session.rollback()
            raise
