from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import DATABASE_URL
from app.db.models import Base

# รองรับ: CON-TECH-01

engine = create_engine(DATABASE_URL, future=True)
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
