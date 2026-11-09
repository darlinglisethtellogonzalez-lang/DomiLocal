
from pydantic import BaseModel, EmailStr, ConfigDict


class RegistroUsuario(BaseModel):
    nombre: str
    correo: EmailStr
    contrasena: str
    tipo: str


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
