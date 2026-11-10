
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional


class RegistroUsuario(BaseModel):
    nombre: str
    correo: EmailStr
    contrasena: str
    tipo: str

    # Datos adicionales para cuentas de negocio
    nombre_negocio: Optional[str] = Field(
        default=None,
        max_length=100
    )
    categoria: Optional[str] = Field(
        default=None,
        max_length=50
    )


class LoginUsuario(BaseModel):
    correo: EmailStr
    contrasena: str


class UsuarioRespuesta(BaseModel):
    id: int
    nombre: str
    correo: str
    tipo: str


class TokenRespuesta(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioRespuesta

