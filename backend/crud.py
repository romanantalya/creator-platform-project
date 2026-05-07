from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    # Check if role exists, if not, create it
    role = db.query(models.Role).filter(models.Role.name == user.role_name).first()
    if not role:
        role = models.Role(name=user.role_name)
        db.add(role)
        db.commit()
        db.refresh(role)

    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, role_id=role.id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_roles(db: Session):
    return db.query(models.Role).all()

def get_role_by_name(db: Session, role_name: str):
    return db.query(models.Role).filter(models.Role.name == role_name).first()
