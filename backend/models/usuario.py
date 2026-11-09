
from sqlalchemy import Column, Integer, String, DateTime, text
from database.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False)
    fecha_registro = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP")
    )
