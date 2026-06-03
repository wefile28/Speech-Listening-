import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# ดึง Connection String จาก Environment (Default: SQLite สำหรับ Dev, Postgres สำหรับ Production)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./speak_listen.db")

# ปรับ Config พิเศษสำหรับ SQLite ในโหมด Dev
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency สำหรับให้ FastAPI Endpoint ดึง Session DB ไปรันคำสั่ง
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
