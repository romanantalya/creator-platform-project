from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role_name: str # 'customer', 'creator', 'project_manager', 'administrator'

class User(UserBase):
    id: int
    is_active: bool
    role_id: int

    class Config:
        from_attributes = True # for SQLAlchemy
