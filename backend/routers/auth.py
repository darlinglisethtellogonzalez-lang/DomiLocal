
import os
from pathlib import Path
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database.database import get_db
from backend.models.usuario import Usuario
from backend.schemas.usuario import (
    RegistroUsuario,
    LoginUsuario,
    UsuarioRespuesta,
    TokenRespuesta,
)

# ==========================================================
# CONFIGURACIÓN
# ==========================================================

PROJECT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_DIR / ".env", override=False)

router = APIRouter(prefix="/auth", tags=["Autenticación"])

password_hash = PasswordHash.recommended()

# Recibir tokens Bearer desde Swagger y el frontend
oauth2_scheme = HTTPBearer(auto_error=False)

# Configuración JWT
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

if not SECRET_KEY:
    raise RuntimeError(
        "Falta configurar JWT_SECRET_KEY en el archivo .env"
    )


# ==========================================================
# CREAR TOKEN
# ==========================================================

def crear_token(usuario_id: int):
    datos = {
        "sub": str(usuario_id),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
    }

    return jwt.encode(
        datos,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ==========================================================
# DATOS PÚBLICOS DEL USUARIO
# ==========================================================

def usuario_publico(usuario: Usuario):
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "correo": usuario.email,
        "tipo": usuario.rol,
    }


# ==========================================================
# OBTENER USUARIO AUTENTICADO
# ==========================================================

def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    if credenciales is None:
        raise HTTPException(
            status_code=401,
            detail="No se recibió el token de autenticación",
        )

    token = credenciales.credentials

    try:
        datos = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        usuario_id = int(datos.get("sub"))

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="La sesión ha expirado. Inicia sesión nuevamente.",
        )

    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Sesión inválida o expirada",
        )

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Usuario no encontrado",
        )

    return usuario


# ==========================================================
# REGISTRO
# ==========================================================

@router.post("/registro", response_model=TokenRespuesta)
def registrar(
    datos: RegistroUsuario,
    db: Session = Depends(get_db),
):
    if datos.tipo not in ["cliente", "negocio", "domiciliario"]:
        raise HTTPException(
            status_code=400,
            detail="Tipo de usuario inválido",
        )

    existente = db.query(Usuario).filter(
        Usuario.email == datos.correo
    ).first()

    if existente:
        raise HTTPException(
            status_code=400,
            detail="Este correo ya está registrado",
        )

    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        email=datos.correo,
        password=password_hash.hash(datos.contrasena),
        rol=datos.tipo,
    )

    try:
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="No se pudo registrar el usuario",
        )

    token = crear_token(nuevo_usuario.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": usuario_publico(nuevo_usuario),
    }


# ==========================================================
# INICIAR SESIÓN
# ==========================================================

@router.post("/login", response_model=TokenRespuesta)
def iniciar_sesion(
    datos: LoginUsuario,
    db: Session = Depends(get_db),
):
    usuario = db.query(Usuario).filter(
        Usuario.email == datos.correo
    ).first()

    if not usuario or not password_hash.verify(
        datos.contrasena,
        usuario.password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos",
        )

    token = crear_token(usuario.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": usuario_publico(usuario),
    }


# ==========================================================
# CONSULTAR USUARIO ACTUAL
# ==========================================================

@router.get("/yo", response_model=UsuarioRespuesta)
def obtener_mi_usuario(
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    return usuario_publico(usuario)

