import uuid
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Numeric, DateTime, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    nickname = Column(String(50), nullable=False)
    age = Column(Integer, nullable=False)
    birth_date = Column(Date, nullable=True)
    guardian_name = Column(String(100), nullable=True)
    guardian_phone = Column(String(20), nullable=True)
    guardian_email = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sessions = relationship("PlacementSession", back_populates="student", cascade="all, delete-orphan")

class PlacementSession(Base):
    __tablename__ = "placement_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    evaluator_name = Column(String(100), nullable=False, default="Teacher")
    speaking_percentage = Column(Numeric(5, 2), nullable=False)
    listening_percentage = Column(Numeric(5, 2), nullable=False)
    suggested_level = Column(String(100), nullable=False)  # 'Seed 🌰', 'Sprout 🌱', 'Apple Tree 🎄'
    assessment_type = Column(String(100), nullable=False, default="Placement Interview")
    teacher_qualitative_note = Column(Text, nullable=True)  # ข้อเขียนคอมเมนต์สำหรับผู้ปกครอง
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="sessions")
    scores = relationship("ScoreDetail", back_populates="session", cascade="all, delete-orphan")

class ScoreDetail(Base):
    __tablename__ = "score_details"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("placement_sessions.id", ondelete="CASCADE"), nullable=False)
    criterion_id = Column(String(100), nullable=False)
    is_can_do = Column(Boolean, nullable=False, default=True)

    session = relationship("PlacementSession", back_populates="scores")
