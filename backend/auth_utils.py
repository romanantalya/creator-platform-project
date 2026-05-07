from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import models, crud, auth
from typing import List

def get_user_role(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user and user.role:
        return user.role.name
    return None

def role_required(required_roles: List[str]):
    def role_checker(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(auth.get_db)):
        user_role_name = get_user_role(db, current_user.id)
        if user_role_name not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker
