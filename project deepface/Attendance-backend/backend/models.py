from sqlalchemy import Column, Integer, String, ForeignKey, Date,Enum, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class Student(Base):
    __tablename__ = 'students'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    last_Name = Column(String, index=True)
    email = Column(String, index=True)
    password = Column(String, index=True)
    enrollments = relationship("Enrollments", back_populates="student")
    attendance = relationship("Attendance", back_populates="student")
    profile_image= Column(String, index=True)
    disabled = Column(Boolean, index=True)

    
class Course(Base):
    __tablename__ = 'courses'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    instructor = Column(String, index=True)
    description = Column(String, index=True)
    enrollments = relationship("Enrollments", back_populates="course")
    attendance = relationship("Attendance", back_populates="course")

class Enrollments(Base):
    __tablename__ = 'enrollments'

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('students.id'))
    course_id = Column(Integer, ForeignKey('courses.id'))
    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class Attendance(Base):
    __tablename__ = 'attendance'

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    status = Column(Enum('Present', 'Absent', name="attendance_status"), index=True)
    face_image = Column(String, index=True)
    student_id = Column(Integer, ForeignKey('students.id'))
    course_id = Column(Integer, ForeignKey('courses.id'))
    student = relationship("Student", back_populates="attendance")
    course = relationship("Course", back_populates="attendance")