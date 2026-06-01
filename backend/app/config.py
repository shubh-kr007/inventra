import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="postgresql://postgres:postgres@db:5432/inventra")
    JWT_SECRET: str = Field(default="supersecret_inventra_jwt_key_change_in_production_12345")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REQUIRE_AUTH: bool = False
    GOOGLE_CLIENT_ID: str = ""

    # Load configuration from environment variables or .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
