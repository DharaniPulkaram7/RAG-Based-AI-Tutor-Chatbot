from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    app_name: str = "SmartEdu_v2"
    secret_key: str = "dev-secret-change-me"
    access_token_expire_minutes: int = 1440
    database_url: str = "sqlite:///./data/smartedu.db"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash"
    embedding_provider: str = "sentence-transformers"
    embedding_model: str = "all-MiniLM-L6-v2"
    frontend_url: str = "http://localhost:5173"
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")


settings = Settings()
UPLOAD_DIR = BASE_DIR / "uploads"
INDEX_DIR = BASE_DIR / "indexes"
DATA_DIR = BASE_DIR / "data"
for directory in (UPLOAD_DIR, INDEX_DIR, DATA_DIR):
    directory.mkdir(parents=True, exist_ok=True)
