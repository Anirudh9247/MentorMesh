import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Retrieve database URL from environment variable, defaulting to local SQLite database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mentormesh.db")

# SQLite requires different connection arguments to allow multi-threading in FastAPI
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        DATABASE_URL, 
        connect_args=connect_args,
        pool_pre_ping=True
    )
else:
    # Ensure PostgreSQL URL is formatted correctly for SQLAlchemy (replace postgres:// with postgresql:// if needed)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency generator to yield database sessions to FastAPI routes,
    ensuring they are properly closed after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
