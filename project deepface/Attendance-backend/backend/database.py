import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import psycopg2

#url of postgres database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:2002@localhost:5432/Attendance")


# create the database engine
engine = create_engine(DATABASE_URL)

# create a session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# create a base class
Base = declarative_base()

try:
    conn = psycopg2.connect(DATABASE_URL)
    print("Connected successfully!")
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")


#https://www.youtube.com/watch?v=398DuQbQJq0 keep for reference