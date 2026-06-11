# Name: Krystal Lu (klu04)
# Citation for Async Testing setup
# Date: 04/30/2025
# Adapted from "Testing the API - Pytest, Fixtures, and Mocking External Services"
# Source URL: https://www.youtube.com/watch?v=SO7m7nod0ts

from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.config import settings
from app.database.db import Base, get_db
from app.main import app

pytest_plugins = ["anyio"]


@pytest.fixture(scope="session")
def anyio_backend() -> str:
    """Ensure that all async tests in the session run on asyncio."""
    return "asyncio"


@pytest.fixture(scope="session")
def test_engine_fixture():
    """Create test database engine"""
    engine = create_async_engine(
        settings.TEST_DATABASE_URL,
        poolclass=NullPool,
    )
    return engine


@pytest.fixture(scope="session")
async def setup_database_fixture(test_engine_fixture):
    """Setup test database to create and drop tables after tests are complete.

    Args:
        test_engine_fixture: Provides async database engine
    """

    # Create all tables
    async with test_engine_fixture.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    # Drop tables after tests are done
    async with test_engine_fixture.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    # Close database engine
    await test_engine_fixture.dispose()


@pytest.fixture(scope="function")
async def db_session_fixture(
    test_engine_fixture,
    setup_database_fixture,
) -> AsyncGenerator[AsyncSession]:
    """Isolates async database session for each test.

    Args:
        test_engine_fixture: Provides async database engine
        setup_database_fixture: Ensure that the schemas and tables exist before tests

    Reference: https://docs.sqlalchemy.org/en/20/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites
    """
    conn = await test_engine_fixture.connect()
    trans = await conn.begin()

    # Binds this session to the connection
    test_async_session = async_sessionmaker(
        bind=conn,
        class_=AsyncSession,
        expire_on_commit=False,
        join_transaction_mode="create_savepoint",
    )

    # Yield session to tests,
    # then roll back transactions to revert data changes from the tests
    async with test_async_session() as session:
        try:
            yield session
        finally:
            await session.close()
            await trans.rollback()
            await conn.close()


@pytest.fixture(scope="function")
async def client(db_session_fixture: AsyncSession) -> AsyncGenerator[AsyncClient]:
    """Create an async test client with a database session override.

    Args:
        db_session_fixture (AsyncSession): Isolated async database session as the dependency override

    References: https://sqlmodel.tiangolo.com/tutorial/fastapi/tests/#client-fixture
                https://fastapi.tiangolo.com/advanced/testing-dependencies/#testing-dependencies-with-overrides
                https://fastapi.tiangolo.com/advanced/async-tests/
    """

    # Replaces the real database session with the isolated test session
    async def override_get_db():
        yield db_session_fixture

    app.dependency_overrides[get_db] = override_get_db

    # AsyncClient routes calls through ASGITransport instead of a real network
    # Refer to: https://fastapi.tiangolo.com/advanced/async-tests/
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()
