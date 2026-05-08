from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Supabase
    supabase_url: str
    supabase_service_role_key: str
    supabase_bucket: str = "karaoke-audio"
    supabase_public_url_prefix: str = ""

    # Callback auth (optional)
    callback_auth_header: str = ""
    callback_hmac_secret: str = ""

@lru_cache
def get_settings() -> Settings:
    # Lazy-load so importing the app doesn't crash when env isn't set yet.
    return Settings()

