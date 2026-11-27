from typing import List
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

VALID_ROLES = [
    "Administrator",
    "SOC Lead Analyst",
    "Security Engineer",
    "Auditor Externo"
]

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registro de nuevo operador / analista / administrador / auditor.
    Valida unicidad de usuario y correo y persiste en PostgreSQL.
    """
    clean_username = user_in.username.strip()
    clean_email = user_in.email.strip().lower()
    
    if not clean_username or len(clean_username) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario debe tener al menos 3 caracteres"
        )
        
    if not user_in.password or len(user_in.password) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña debe tener al menos 4 caracteres"
        )
    
    existing = db.query(User).filter(
        or_(User.username == clean_username, User.email == clean_email)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El nombre de usuario '{clean_username}' o correo '{clean_email}' ya se encuentra registrado en la base de datos"
        )
    
    # Asignar rol seleccionado o por defecto
    selected_role = (user_in.role or "").strip()
    if not selected_role or selected_role not in VALID_ROLES:
        selected_role = "SOC Lead Analyst"
        
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        username=clean_username,
        email=clean_email,
        hashed_password=hashed_pwd,
        role=selected_role,
        is_active=True
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
    clean_identifier = credentials.username.strip()
    user = db.query(User).filter(
        or_(
            User.username == clean_identifier,
            User.email == clean_identifier.lower()
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

@router.get("/users", response_model=List[UserResponse])
def list_all_users(db: Session = Depends(get_db)):
    """
    Lista todos los usuarios registrados directamente desde la base de datos PostgreSQL.
    Permite verificar en tiempo real que los registros persisten correctamente.
    """
    return db.query(User).order_by(User.id.asc()).all()

@router.get("/roles")
def get_roles_matrix():
    """Retorna la matriz de roles y permisos del sistema (RBAC)."""
    return [
        {
            "role": "Administrator",
            "description": "Control total del sistema, gestión de usuarios, creación y eliminación de políticas WAF.",
            "permissions": {"read": True, "create": True, "update": True, "delete": True, "ai_mitigate": True}
        },
        {
            "role": "SOC Lead Analyst",
            "description": "Líder de ciberseguridad, análisis forense de IA, creación, actualización y eliminación de reglas.",
            "permissions": {"read": True, "create": True, "update": True, "delete": True, "ai_mitigate": True}
        },
        {
            "role": "Security Engineer",
            "description": "Ingeniero de políticas defensivas, creación y actualización de reglas. No puede eliminar reglas críticas.",
            "permissions": {"read": True, "create": True, "update": True, "delete": False, "ai_mitigate": True}
        },
        {
            "role": "Auditor Externo",
            "description": "Auditor de cumplimiento normativo (ISO 27001 / SOC 2). Solo lectura en todo el Gateway.",
            "permissions": {"read": True, "create": False, "update": False, "delete": False, "ai_mitigate": False}
        }
    ]

@router.get("/demo-account")
def get_demo_account():
    """Retorna los datos del usuario de prueba precargado para facilitar la sustentación."""
    return {
        "username": "analista",
        "password": "Password123!",
        "role": "SOC Lead Analyst",
        "description": "Usuario predeterminado para pruebas de sustentación"
    }

@router.get("/demo-accounts")
def get_all_demo_accounts():
    """Retorna las 3 cuentas de demostración para probar los diferentes niveles de Roles (RBAC)."""
    return [
        {
            "role": "Administrator",
            "username": "admin",
            "password": "AdminPassword123!",
            "badge": "bg-red-950/60 text-red-400 border-red-700",
            "description": "Acceso total (Crear, Editar, Borrar, Sembrar)"
        },
        {
            "role": "SOC Lead Analyst",
            "username": "analista",
            "password": "Password123!",
            "badge": "bg-emerald-950/60 text-emerald-400 border-emerald-700",
            "description": "Operador principal (Forense IA + Gestión de Reglas)"
        },
        {
            "role": "Auditor Externo",
            "username": "auditor",
            "password": "AuditorPassword123!",
            "badge": "bg-amber-950/60 text-amber-400 border-amber-700",
            "description": "Solo lectura (Auditoría de cumplimiento, no puede modificar)"
        }
    ]
