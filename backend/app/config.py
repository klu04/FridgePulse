import secrets
from pathlib import Path

from pydantic import EmailStr, PostgresDsn, SecretStr, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
    )

    API_V1_URL: str = "/api/v1"
    PROJECT_NAME: str
    DOMAIN: str = "localhost"

    # PostgreSQL database
    NEON_DATABASE_URL: str | None = None
    MIGRATION_DATABASE_URL: str | None = None
    POSTGRES_SERVER: str | None = None
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = ""
    POSTGRES_USER: str | None = None
    POSTGRES_PASSWORD: str | None = None
    FIRST_SUPERUSER_EMAIL: EmailStr
    FIRST_SUPERUSER_PASSWORD: str
    USERS_OPEN_REGISTRATION: bool

    # Test PostgreSQL DB
    TEST_DATABASE_URL: str | None = None

    # Auth
    SECRET_KEY: SecretStr = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Frontend
    FRONTEND_HOST: str = "http://localhost:5173"

    # Recipe APIs
    SPOONACULAR_API_KEY: str
    RECIPES_URL: str

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.NEON_DATABASE_URL:
            return self._asyncpg_database_uri(self.NEON_DATABASE_URL)

        if not self.POSTGRES_SERVER or not self.POSTGRES_USER:
            raise ValueError(
                "Set NEON_DATABASE_URL or POSTGRES_SERVER, POSTGRES_USER, and "
                "POSTGRES_PASSWORD"
            )
        if self.POSTGRES_PASSWORD is None:
            raise ValueError(
                "Set NEON_DATABASE_URL or POSTGRES_SERVER, POSTGRES_USER, and "
                "POSTGRES_PASSWORD"
            )

        return str(
            PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=self.POSTGRES_USER,
                password=self.POSTGRES_PASSWORD,
                host=self.POSTGRES_SERVER,
                port=self.POSTGRES_PORT,
                path=self.POSTGRES_DB.lstrip("/"),
            )
        )

    @property
    def ALEMBIC_DATABASE_URI(self) -> str:
        if self.MIGRATION_DATABASE_URL:
            return self._asyncpg_database_uri(self.MIGRATION_DATABASE_URL)
        return self.SQLALCHEMY_DATABASE_URI

    @staticmethod
    def _asyncpg_database_uri(database_url: str) -> str:
        parsed_url = make_url(database_url)
        if parsed_url.drivername in {"postgres", "postgresql"} or (
            parsed_url.drivername.startswith("postgresql+")
        ):
            parsed_url = parsed_url.set(drivername="postgresql+asyncpg")
        else:
            raise ValueError("Database URL must use a PostgreSQL scheme")

        query = dict(parsed_url.query)
        sslmode = query.pop("sslmode", None)
        query.pop("channel_binding", None)
        if sslmode is not None:
            query.setdefault("ssl", sslmode)

        return parsed_url.set(query=query).render_as_string(hide_password=False)


settings = Settings()
