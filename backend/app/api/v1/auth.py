from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse, TokenResponse
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registro rápido de nuevo operador / analista SOC.
    No requiere campos complejos, ideal para pruebas.
    """
    existing = db.query(User).filter(
        or_(User.username == user_in.username.strip(), User.email == user_in.email.strip())
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario o correo ya se encuentra registrado"
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        username=user_in.username.strip(),
        email=user_in.email.strip().lower(),
        hashed_password=hashed_pwd,
        role=user_in.role or "SOC Analyst"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": str(user.id), "username": user.username, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Inicio de sesión para obtener token JWT Bearer.
    Acepta nombre de usuario o correo electrónico.
    """
    user = db.query(User).filter(
        or_(
            User.username == credentials.username.strip(),
            User.email == credentials.username.strip().lower()
        )
    ).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas. Verifica tu usuario y contraseña",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta se encuentra inactiva o deshabilitada"
        )
    
    token = create_access_token({"sub": str(user.id), "username": user.username, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Obtiene la información del usuario autenticado actual."""
    return current_user

@router.get("/demo-account")
def get_demo_account():
    """Retorna los datos del usuario de prueba precargado para facilitar la sustentación."""
    return {
        "username": "analista",
        "password": "Password123!",
        "role": "SOC Lead Analyst",
        "description": "Usuario predeterminado para pruebas de sustentación"
    }
