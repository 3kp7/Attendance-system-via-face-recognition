from fastapi import FastAPI, Depends, HTTPException, Request, status, UploadFile, File
from datetime import date, datetime
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import inspect, and_
from passlib.context import CryptContext
from deepface import DeepFace
from fastapi.middleware.cors import CORSMiddleware
import cv2
import os
from database import SessionLocal, engine
import models as mo
from sqlalchemy.exc import IntegrityError
import auth
from schemas import initialize_database
import pandas as pd
from schedule import every, repeat
import schedule
import time


# Constants for JWT
SECRET_KEY = os.getenv("JWT_SECRET", "default_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router
app.include_router(auth.router)

# Dependency: Get database session
def get_db():
    try:
        yield db
    finally:
        db.close()

db = SessionLocal()
ins = inspect(engine)
existing_tables = ins.get_table_names()

missing_tables = [table for table in mo.Base.metadata.tables.keys() if table not in existing_tables]
if missing_tables:
    mo.Base.metadata.create_all(engine, tables=[mo.Base.metadata.tables[table] for table in missing_tables])
    print("Tables created successfully in PostgreSQL!")

initialize_database()

@app.get("/courses")
async def get_courses():
    courses = db.query(mo.Course).all()
    return courses

@app.get("/student/course")
async def get_student_courses(current_user: auth.UserInDB = Depends(auth.get_current_active_user)):
    student = db.query(mo.Student).filter(mo.Student.id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    courses = [enrollment.course for enrollment in student.enrollments]
    return courses

@app.post("/verify_face/")
async def verify_face(request: Request,course_id: int, file: UploadFile = File(...), current_user: auth.UserInDB = Depends(auth.get_current_active_user)):
   

    #upload image 
    contents = await file.read()
    temp_face_path = "temp_face.png"
    with open(temp_face_path, "wb") as f:
        f.write(contents)

    models=["VGG-Face","Facenet512"]

    reference_img_path = current_user.profile_image
    if not reference_img_path or not os.path.exists(reference_img_path):
        os.remove(temp_face_path)
        raise HTTPException(status_code=400, detail="Reference image not found")

    try:
        result = DeepFace.verify(temp_face_path, reference_img_path, model_name=models[0])
        match_status = result['verified']
    except Exception as e:
        os.remove(temp_face_path)
        raise HTTPException(status_code=500, detail=str(e))

    os.remove(temp_face_path)

    if not match_status:
        return {"message": "Face does not match ❌"}

    # ✅ Get course_id from the request query param or body (adapt as needed)
    course_id = int(request.query_params.get("course_id", 0))
    if not course_id:
        raise HTTPException(status_code=400, detail="Course ID is required")

    # ✅ Record attendance
    new_record = mo.Attendance(
        student_id=current_user.id,
        course_id=course_id,
        date=date.today(),
        status="Present",
        face_image=reference_img_path
    )

    #check if student took attendance for this course today
    existing_attendance = db.query(mo.Attendance).filter(
    and_(
            mo.Attendance.student_id == current_user.id,
            mo.Attendance.course_id == course_id,
            mo.Attendance.date == date.today()
        )
    ).first()
    if existing_attendance:
     return {"message": "Attendance already recorded for today ✅"}

    db.add(new_record)
    db.commit()

    return {"message": "Face verified, attendance recorded ✅"}

# Schedule the CSV export task
def start_scheduler():
    @repeat(every(10).seconds)
    def print_csv():
        try:
            query = """
                SELECT 
                    a.student_id,
                    s.name,
                    s."last_Name",
                    c.name
                FROM attendance a
                JOIN students s ON a.student_id = s.id
                JOIN courses c ON a.course_id = c.id
                WHERE a.status = 'Present'
            """
            df = pd.read_sql_query(query, engine)
            df.to_csv("attendance.csv", index=False)
            print("✅ Attendance CSV updated successfully")
        except Exception as e:
            print(f"Error updating attendance CSV: {str(e)}")

    # Start the scheduler in a separate thread
    import threading
    scheduler_thread = threading.Thread(target=lambda: schedule.every(10).seconds.do(print_csv()))
    scheduler_thread.daemon = True
    scheduler_thread.start()

# Start the scheduler when the app starts
start_scheduler()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)