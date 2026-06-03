from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from . import models, schemas, database

app = FastAPI(
    title="Speak&Listen Giraffe API Service", 
    version="1.0.0",
    description="Offline 1-on-1 Placement and Leveling Tool API for teachers and administrators."
)

# CORS configuration to allow all connections (local dev / iPad tablet connections)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure database tables are created (dev Mode / SQLite)
models.Base.metadata.create_all(bind=database.engine)

# Auto-seed mock data on startup if database is empty
def seed_mock_data(db: Session):
    student_count = db.query(models.Student).count()
    if student_count > 0:
        return  # Already seeded
    
    # 1. Create mock students
    tee = models.Student(
        first_name="Sarawut",
        last_name="Rakdee",
        nickname="Tee",
        age=5,
        guardian_name="Somchai Rakdee",
        guardian_phone="0812345678",
        guardian_email="somchai@example.com"
    )
    bua = models.Student(
        first_name="Kornkanok",
        last_name="Jaiyen",
        nickname="Bua",
        age=4,
        guardian_name="Pornpen Jaiyen",
        guardian_phone="0898765432",
        guardian_email="pornpen@example.com"
    )
    win = models.Student(
        first_name="Nattapat",
        last_name="Deeviset",
        nickname="Win",
        age=7,
        guardian_name="Vichai Deeviset",
        guardian_phone="0865551234",
        guardian_email="vichai@example.com"
    )
    
    db.add_all([tee, bua, win])
    db.commit()
    db.refresh(tee)
    db.refresh(bua)
    db.refresh(win)
    
    # 2. Create mock assessment sessions with scores
    # Nong Tee: Sprout (Responder) 67% Speaking, 67% Listening
    tee_session = models.PlacementSession(
        student_id=tee.id,
        evaluator_name="Teacher Cathy",
        speaking_percentage=67.0,
        listening_percentage=67.0,
        suggested_level="Sprout 🌱",
        assessment_type="Placement Interview",
        teacher_qualitative_note="น้องธีร์มีความกระตือรือร้นในการเรียนมาก พูดโต้ตอบประโยคสั้นๆ ได้ดี แต่อาจจะต้องฝึกฝนการออกเสียงพยัญชนะท้ายและการฟังคำสั่งยาวๆ เพิ่มเติมครับ"
    )
    
    # Nong Bua: Seed (Listener) 50% Speaking, 80% Listening
    bua_session = models.PlacementSession(
        student_id=bua.id,
        evaluator_name="Teacher Mark",
        speaking_percentage=50.0,
        listening_percentage=80.0,
        suggested_level="Seed 🌰",
        assessment_type="Placement Interview",
        teacher_qualitative_note="น้องบัวมีทักษะการฟังที่โดดเด่นมาก สามารถปฏิบัติตามคำสั่งของคุณครูได้รวดเร็ว ส่วนทักษะการพูดเริ่มเลียนเสียงคำเดี่ยวได้ดี แนะนำให้กระตุ้นการโต้ตอบด้วยคำศัพท์เดี่ยวในชีวิตประจำวันค่ะ"
    )
    
    # Nong Win: Apple Tree (Tree) 80% Speaking, 90% Listening
    win_session = models.PlacementSession(
        student_id=win.id,
        evaluator_name="Teacher Cathy",
        speaking_percentage=80.0,
        listening_percentage=90.0,
        suggested_level="Apple Tree 🎄",
        assessment_type="In-Class Assessment",
        teacher_qualitative_note="น้องวินสามารถสื่อสารภาษาอังกฤษได้อย่างคล่องแคล่ว โต้ตอบบทสนทนาหลาย Turn ได้อย่างเป็นธรรมชาติ มีคลังคำศัพท์ที่กว้างขวาง แนะนำให้อ่านหนังสือและทำกิจกรรมเสริมจินตนาการเพื่อต่อยอดการเล่าเรื่อง (Storytelling) ครับ"
    )
    
    db.add_all([tee_session, bua_session, win_session])
    db.commit()
    db.refresh(tee_session)
    db.refresh(bua_session)
    db.refresh(win_session)
    
    # 3. Create mock score details
    # Nong Tee scores
    tee_scores = [
        models.ScoreDetail(session_id=tee_session.id, criterion_id="sprout_responder_a_1", is_can_do=True),
        models.ScoreDetail(session_id=tee_session.id, criterion_id="sprout_responder_a_2", is_can_do=True),
        models.ScoreDetail(session_id=tee_session.id, criterion_id="sprout_responder_a_3", is_can_do=False),
        models.ScoreDetail(session_id=tee_session.id, criterion_id="sprout_responder_a_4", is_can_do=True),
        models.ScoreDetail(session_id=tee_session.id, criterion_id="sprout_responder_a_5", is_can_do=True),
        models.ScoreDetail(session_id=tee_session.id, criterion_id="sprout_responder_a_6", is_can_do=False),
    ]
    db.add_all(tee_scores)
    db.commit()

# Run seed on application initialization
db = database.SessionLocal()
try:
    seed_mock_data(db)
finally:
    db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to Speak&Listen Giraffe API Service Backend"}

# --- 1. STUDENT REGISTRATION ENDPOINTS ---

@app.post("/api/v1/students", response_model=schemas.StudentOut, status_code=status.HTTP_201_CREATED)
def register_student(student: schemas.StudentCreate, db: Session = Depends(database.get_db)):
    db_student = models.Student(
        first_name=student.first_name,
        last_name=student.last_name,
        nickname=student.nickname,
        age=student.age,
        birth_date=student.birth_date,
        guardian_name=student.guardian_name,
        guardian_phone=student.guardian_phone,
        guardian_email=student.guardian_email
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.get("/api/v1/students", response_model=List[schemas.StudentOut])
def list_students(db: Session = Depends(database.get_db)):
    return db.query(models.Student).order_by(models.Student.created_at.desc()).all()

# --- 2. ASSESSMENT SESSION ENDPOINTS ---

@app.post("/api/v1/sessions", response_model=schemas.PlacementSessionOut, status_code=status.HTTP_201_CREATED)
def create_placement_session(payload: schemas.PlacementSessionCreate, db: Session = Depends(database.get_db)):
    # Verify student exists
    student = db.query(models.Student).filter(models.Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Create session record
    db_session = models.PlacementSession(
        student_id=payload.student_id,
        evaluator_name=payload.evaluator_name,
        speaking_percentage=payload.speaking_percentage,
        listening_percentage=payload.listening_percentage,
        suggested_level=payload.suggested_level,
        assessment_type=payload.assessment_type,
        teacher_qualitative_note=payload.teacher_qualitative_note
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    # Add score details
    for score in payload.scores:
        db_score = models.ScoreDetail(
            session_id=db_session.id,
            criterion_id=score.criterion_id,
            is_can_do=score.is_can_do
        )
        db.add(db_score)
    
    db.commit()
    db.refresh(db_session)
    return db_session

@app.get("/api/v1/sessions", response_model=List[schemas.PlacementSessionOut])
def list_sessions(db: Session = Depends(database.get_db)):
    return db.query(models.PlacementSession).order_by(models.PlacementSession.created_at.desc()).all()

@app.get("/api/v1/sessions/{session_id}", response_model=schemas.PlacementSessionOut)
def get_session(session_id: str, db: Session = Depends(database.get_db)):
    session = db.query(models.PlacementSession).filter(models.PlacementSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
