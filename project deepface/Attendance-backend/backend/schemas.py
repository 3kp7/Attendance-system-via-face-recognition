from .database import SessionLocal, engine
from . import models as mo
from . import auth
from sqlalchemy.exc import IntegrityError
from datetime import date

def initialize_database():
    # Create tables if they don't exist
    mo.Base.metadata.create_all(bind=engine)
    print("✅ Tables checked/created")

    db = SessionLocal()

    # Add default courses
    course_data = [
        {"id": 1, "name": "Software Engineering", "instructor": "Dr. Smith", "description": "Learn the fundamentals of computer science and programming."},
        {"id": 2, "name": "Artificial Intelligence", "instructor": "Dr. Johnson", "description": "Explore the exciting world of AI and machine learning."},
        {"id": 3, "name": "Cyber Security", "instructor": "Dr. Williams", "description": "Learn about the latest security threats and best practices."},
        {"id": 4, "name": "Cloud Computing", "instructor": "Dr. Brown", "description": "Learn about the latest cloud technologies."},
    ]
    for data in course_data:
        if not db.query(mo.Course).filter_by(id=data["id"]).first():
            db.add(mo.Course(**data))

    # Add/Update students with correct paths
    students = [
        {
            "id": 210208829,
            "name": "Abdelrahman",
            "last_Name": "Alsayed",
            "email": "abd@gmail.com",
            "password": auth.bcrypt_context.hash("abd123"),
            "profile_image": "images/bdu.jpg", 
            "disabled": False
        },
        {
            "id": 210208842,
            "name": "Aziz",
            "last_Name": "Al Tamimi",
            "email": "az@gmail.com",
            "password": auth.bcrypt_context.hash("az123"),
            "profile_image": "images/az.jpg",
            "disabled": False
        },
        {
            "id": 200201922,
            "name": "Mohammed",
            "last_Name": "Mansuor",
            "email": "man@gmail.com",
            "password": auth.bcrypt_context.hash("man123"),
            "profile_image": "images/man.jpg",
            "disabled": False
        },
        {
            "id": 210208945,
            "name": "Ahmed",
            "last_Name": "WithJohn",
            "email": "ahm@gmail.com",
            "password": auth.bcrypt_context.hash("ahm123"),
            "profile_image": "images/ahm.jpg",
            "disabled": False
        }
    ]
    for student in students:
        existing = db.query(mo.Student).filter_by(id=student["id"]).first()
        if existing:
            # Update existing student with correct path
            existing.profile_image = student["profile_image"]
        else:
            db.add(mo.Student(**student))

    db.commit()

    # Enroll students in all courses
    all_students = db.query(mo.Student).all()
    all_courses = db.query(mo.Course).all()
    for student in all_students:
        for course in all_courses:
            exists = db.query(mo.Enrollments).filter_by(student_id=student.id, course_id=course.id).first()
            if not exists:
                db.add(mo.Enrollments(student_id=student.id, course_id=course.id))

    db.commit()
    db.close()
    print("✅ Database seeded with courses, students, enrollments, and attendance.")