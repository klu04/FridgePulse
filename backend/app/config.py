import secrets
from pathlib import Path

from pydantic import PostgresDsn, SecretStr, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
    )

    API_V1_URL: str = "/api/v1"
    PROJECT_NAME: str
    DOMAIN: str = "localhost"

    # Local PostgreSQL DB
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = ""
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    FIRST_SUPERUSER_EMAIL: str
    FIRST_SUPERUSER_PASSWORD: str
    USERS_OPEN_REGISTRATION: bool

    # Test PostgreSQL DB
    # TEST_DATABASE_URL: str

    # Auth
    SECRET_KEY: SecretStr = secrets.token_urlsafe(32)
    REFRESH_SECRET_KEY: SecretStr = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    # Recipe APIs
    SPOONACULAR_API_KEY: str
    RECIPES_URL: str

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:

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


settings = Settings()
