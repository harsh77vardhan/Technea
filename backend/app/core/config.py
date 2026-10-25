"""Application configuration management using Pydantic v2 Settings."""

import json
import warnings
from typing import Any, Literal
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Global application settings and environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Project Information
    PROJECT_NAME: str = "Technea API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Technea production-ready backend services"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-this-in-production-with-a-secure-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # AI & Gemini Model Configuration
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    AI_TIMEOUT_SECONDS: int = 30

    # API Routing Configuration
    API_V1_STR: str = "/api/v1"

    # Frontend URL and CORS Configuration
    FRONTEND_URL: str | None = None
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://technea.dev",
        "https://www.technea.dev",
        "https://*.vercel.app",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        default_origins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "https://technea.dev",
            "https://www.technea.dev",
            "https://*.vercel.app",
        ]
        if not v:
            return default_origins
        if isinstance(v, str):
            v_trimmed = v.strip()
            if not v_trimmed:
                return default_origins
            if v_trimmed.startswith("[") and v_trimmed.endswith("]"):
                try:
                    parsed = json.loads(v_trimmed)
                    if isinstance(parsed, list) and parsed:
                        return [str(o).strip() for o in parsed if str(o).strip()]
                except Exception:
                    pass
            origins = [origin.strip() for origin in v_trimmed.split(",") if origin.strip()]
            return origins if origins else default_origins
        elif isinstance(v, (list, tuple)):
            origins = [str(origin).strip() for origin in v if str(origin).strip()]
            return origins if origins else default_origins
        return default_origins

    # PostgreSQL Database Credentials
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres_password"
    POSTGRES_DB: str = "technea_db"

    # Connection URIs (can be explicitly provided via .env)
    DATABASE_URL: str | None = None
    SYNC_DATABASE_URL: str | None = None

    # Connection Pool Settings
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 300
    DB_POOL_PRE_PING: bool = True
    DB_ECHO: bool = False

    @model_validator(mode="after")
    def assemble_db_urls(self) -> "Settings":
        """Assemble and normalize PostgreSQL URLs for asyncpg and psycopg2 drivers."""
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
                f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        else:
            db_url = str(self.DATABASE_URL).strip()
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
                db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            self.DATABASE_URL = db_url

        if not self.SYNC_DATABASE_URL:
            if self.DATABASE_URL:
                self.SYNC_DATABASE_URL = str(self.DATABASE_URL).replace(
                    "postgresql+asyncpg://", "postgresql+psycopg2://"
                )
            else:
                self.SYNC_DATABASE_URL = (
                    f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
                    f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
                )
        else:
            sync_url = str(self.SYNC_DATABASE_URL).strip()
            if sync_url.startswith("postgres://"):
                sync_url = sync_url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif sync_url.startswith("postgresql://") and not sync_url.startswith("postgresql+psycopg2://"):
                sync_url = sync_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            self.SYNC_DATABASE_URL = sync_url

        # Normalize and include FRONTEND_URL in CORS origins
        if self.FRONTEND_URL:
            fe_url = str(self.FRONTEND_URL).strip().rstrip("/")
            if fe_url and fe_url not in self.CORS_ORIGINS:
                self.CORS_ORIGINS.append(fe_url)

        self.CORS_ORIGINS = [str(o).strip().rstrip("/") for o in self.CORS_ORIGINS if str(o).strip()]

        # Production security audits and warnings
        insecure_secret_keys = {
            "change-this-in-production-with-a-secure-random-secret-key",
            "generate-a-secure-random-secret-key-for-production",
            "secret",
            "secret-key",
            "default-secret-key",
        }
        if self.ENVIRONMENT == "production":
            if self.SECRET_KEY in insecure_secret_keys or len(self.SECRET_KEY) < 32:
                warnings.warn(
                    "CRITICAL SECURITY WARNING: Insecure default or weak SECRET_KEY is used in production! "
                    "You must configure a strong cryptographically random SECRET_KEY (at least 32 characters) "
                    "via the SECRET_KEY environment variable.",
                    UserWarning,
                    stacklevel=2,
                )
            if self.POSTGRES_PASSWORD in {"postgres_password", "postgres", "admin", "password", "root"}:
                warnings.warn(
                    "SECURITY WARNING: Default or common database password is used in production! "
                    "Ensure POSTGRES_PASSWORD is set to a secure, private password.",
                    UserWarning,
                    stacklevel=2,
                )
            if "*" in self.CORS_ORIGINS:
                warnings.warn(
                    "SECURITY WARNING: CORS wildcard '*' detected in production CORS_ORIGINS with allow_credentials=True. "
                    "Wildcard origins will be excluded to enforce explicit origins.",
                    UserWarning,
                    stacklevel=2,
                )

        return self


# Global singleton instance of Settings
settings = Settings()
