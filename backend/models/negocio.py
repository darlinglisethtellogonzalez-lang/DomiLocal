from sqlalchemy import Column, Integer, String, ForeignKey
from database.database import Base

class Negocio(Base):
    __tablename__ = "negocios"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=True)
    nombre_negocio = Column(String(100), nullable=False)
    categoria = Column(String(50), nullable=False)