from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class StudentBase(BaseModel):
    first_name: str
    last_name: str
    nickname: str
    age: int
    birth_date: Optional[date] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    guardian_email: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentOut(StudentBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ScoreDetailBase(BaseModel):
    criterion_id: str
    is_can_do: bool

class ScoreDetailCreate(ScoreDetailBase):
    pass

class ScoreDetailOut(ScoreDetailBase):
    id: str
    session_id: str

    class Config:
        from_attributes = True

class PlacementSessionBase(BaseModel):
    evaluator_name: str
    speaking_percentage: float
    listening_percentage: float
    suggested_level: str
    assessment_type: str = "Placement Interview"
    teacher_qualitative_note: Optional[str] = None

class PlacementSessionCreate(PlacementSessionBase):
    student_id: str
    scores: List[ScoreDetailCreate]

class PlacementSessionOut(PlacementSessionBase):
    id: str
    student_id: str
    created_at: datetime
    scores: List[ScoreDetailOut] = []

    class Config:
        from_attributes = True
