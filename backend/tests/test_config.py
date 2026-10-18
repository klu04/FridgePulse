from app.config import Settings


def make_settings(**database_settings) -> Settings:
    return Settings(
        _env_file=None,
        PROJECT_NAME="test",
        FIRST_SUPERUSER_EMAIL="admin@example.com",
        FIRST_SUPERUSER_PASSWORD="test-password",
        USERS_OPEN_REGISTRATION=False,
        SPOONACULAR_API_KEY="",
        RECIPES_URL="",
        **database_settings,
    )


def test_neon_database_url_uses_asyncpg_and_ssl():
    settings = make_settings(
        DATABASE_URL=(
            "postgresql://user:pass@db.example.test/fridgepulse"
            "?sslmode=require&channel_binding=require"
        )
    )

    assert settings.SQLALCHEMY_DATABASE_URI == (
        "postgresql+asyncpg://user:pass@db.example.test/fridgepulse?ssl=require"
    )


def test_migration_database_url_overrides_runtime_url():
    settings = make_settings(
        DATABASE_URL=(
            "postgresql://user:pass@db-pooler.example.test/fridgepulse"
            "?sslmode=require&channel_binding=require"
        ),
        MIGRATION_DATABASE_URL=(
            "postgresql://user:pass@db.example.test/fridgepulse"
            "?sslmode=require&channel_binding=require"
        ),
    )

    assert settings.SQLALCHEMY_DATABASE_URI == (
        "postgresql+asyncpg://user:pass@db-pooler.example.test/fridgepulse?ssl=require"
    )
    assert settings.ALEMBIC_DATABASE_URI == (
        "postgresql+asyncpg://user:pass@db.example.test/fridgepulse?ssl=require"
    )


def test_migration_url_defaults_to_runtime_url():
    settings = make_settings(
        DATABASE_URL="postgresql://user:pass@db.example.test/fridgepulse",
        MIGRATION_DATABASE_URL=None,
    )

    assert settings.ALEMBIC_DATABASE_URI == settings.SQLALCHEMY_DATABASE_URI


def test_split_postgres_settings_still_build_asyncpg_url():
    settings = make_settings(
        DATABASE_URL=None,
        POSTGRES_SERVER="localhost",
        POSTGRES_USER="user",
        POSTGRES_PASSWORD="pass",
        POSTGRES_DB="fridgepulse",
    )

    assert settings.SQLALCHEMY_DATABASE_URI == (
        "postgresql+asyncpg://user:pass@localhost:5432/fridgepulse"
    )
