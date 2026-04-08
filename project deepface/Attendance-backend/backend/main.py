from fastapi import FastAPI, Depends, HTTPException, status
from datetime import date
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import inspect, and_
from passlib.context import CryptContext
from deepface import DeepFace
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import base64
from .database import SessionLocal, engine
from . import models as mo
from sqlalchemy.exc import IntegrityError
from . import auth
from .schemas import initialize_database
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

# Pydantic model for base64 image request
class VerifyFaceRequest(BaseModel):
    course_id: int
    image_base64: str

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

@app.get("/student/attendance")
async def get_student_attendance(current_user: auth.UserInDB = Depends(auth.get_current_active_user)):
    student = db.query(mo.Student).filter(mo.Student.id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    attendance_records = db.query(mo.Attendance).filter(mo.Attendance.student_id == current_user.id).all()
    return attendance_records

@app.post("/verify_face_base64/")
async def verify_face_base64(request: VerifyFaceRequest, current_user: auth.UserInDB = Depends(auth.get_current_active_user)):
    """Verify face using base64-encoded image in JSON body"""
    try:
        # Decode base64 to bytes
        try:
            image_bytes = base64.b64decode(request.image_base64)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image: {str(e)}")
        
        # Save temp file
        temp_face_path = "temp_face.png"
        with open(temp_face_path, "wb") as f:
            f.write(image_bytes)

        # Get reference image from database
        student = db.query(mo.Student).filter(mo.Student.id == current_user.id).first()
        if not student or not student.profile_image:
            os.remove(temp_face_path)
            raise HTTPException(status_code=400, detail="Student profile image not found")
        
        reference_img_path = student.profile_image

        # Verify face using DeepFace
        try:
            result = DeepFace.verify(temp_face_path, reference_img_path, model_name="VGG-Face")
            match_status = result['verified']
        except Exception as e:
            os.remove(temp_face_path)
            raise HTTPException(status_code=500, detail=f"Face verification error: {str(e)}")

        os.remove(temp_face_path)

        if not match_status:
            return {"message": "Face does not match ❌"}

        # Record attendance
        new_record = mo.Attendance(
            student_id=current_user.id,
            course_id=request.course_id,
            date=date.today(),
            status="Present",
            face_image=reference_img_path
        )

        # Check for duplicate attendance today
        existing_attendance = db.query(mo.Attendance).filter(
            and_(
                mo.Attendance.student_id == current_user.id,
                mo.Attendance.course_id == request.course_id,
                mo.Attendance.date == date.today()
            )
        ).first()
        
        if existing_attendance:
            return {"message": "Attendance already recorded for today ✅"}

        db.add(new_record)
        db.commit()

        return {"message": "Face verified, attendance recorded ✅"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

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