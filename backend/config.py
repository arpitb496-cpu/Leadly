import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

# Load environment variables if .env exists
load_dotenv(BASE_DIR.parent / '.env')
load_dotenv(BASE_DIR / '.env')

def get_database_uri():
    db_url = os.getenv('DATABASE_URL')
    if not db_url or not db_url.strip():
        # Fall back to SQLite locally when DATABASE_URL is not set
        return f"sqlite:///{BASE_DIR / 'leads.db'}"
    db_url = db_url.strip().strip("'\"")

    # Leave URLs that already specify a "+" driver name unchanged (e.g. postgresql+psycopg2://)
    scheme = db_url.split('://', 1)[0] if '://' in db_url else ''
    if '+' in scheme:
        return db_url

    # Normalise "postgres://" and "postgresql://" to "postgresql+psycopg2://"
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql+psycopg2://', 1)
    elif db_url.startswith('postgresql://'):
        db_url = db_url.replace('postgresql://', 'postgresql+psycopg2://', 1)
    return db_url

def get_allowed_origins():
    origins = os.getenv('ALLOWED_ORIGINS')
    if not origins or not origins.strip() or origins.strip() == '*':
        return "*"
    # Comma-separated list of origins, trimmed
    return [origin.strip() for origin in origins.split(',') if origin.strip()]

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    PORT = int(os.getenv('PORT', 5001))
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ALLOWED_ORIGINS = get_allowed_origins()
