from typing import Annotated, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status
from fastapi import HTTPException, Depends
from database import SessionLocal, engine
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import os
from fastapi import APIRouter
import datetime
from datetime import datetime, timedelta, timezone
import models as mo

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

# Constants for JWT
SECRET_KEY = os.getenv("JWT_SECRET", "default_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    id: Optional[int] = None

class User(BaseModel):
    name: str
    password: str
    id: Optional[int] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    image_path: Optional[str] = None
    disabled: bool = False
    
class UserInDB(User):
    hashed_password: str

def verify_password(plain_password: str, hashed_password: str) :
    return bcrypt_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return bcrypt_context.hash(password)

# Update the `get_user` function to query the actual database
def get_user(db: Session, username: str) -> Optional[mo.Student]:
    user = db.query(mo.Student).filter(mo.Student.username == username).first()
    if user:
        return user
    return None



# Update the `authenticate_user` function to use the actual database
def authenticate_user(db: Session, email: str, password: str) -> Optional[mo.Student]:
    user = db.query(mo.Student).filter(mo.Student.email == email).first()
    if not user or not verify_password(password, user.password):  # Fix password comparison
        return None
    return user


def create_access_token(email: str, user_id: int, expires_delta: Optional[timedelta] = None):
    to_encode = {"sub": email, "user_id": user_id}  # Change 'sub' from username to email
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)




def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)]

# Dependency functions
async def get_current_user(db: db_dependency, token: str = Depends(oauth2_bearer)) -> UserInDB:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")  # Extract email instead of username
        user_id: int = payload.get("user_id")
        
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = db.query(mo.Student).filter(mo.Student.email == email).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )



async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@router.get("/user/me", response_model=User)
async def read_current_user(current_user: UserInDB = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    #hide the password field in the response
    current_user.password = f"********"
    #display full name 
    current_user.full_name = f"{current_user.name} {current_user.last_Name}"
    return current_user


@router.post("/register", response_model=User)
async def register_user(user: User, db: db_dependency):
    db_user = db.query(mo.Student).filter(mo.Student.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    db_user = mo.Student(username=user.username, password=hashed_password, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: db_dependency,
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(user.email, user.id, access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}