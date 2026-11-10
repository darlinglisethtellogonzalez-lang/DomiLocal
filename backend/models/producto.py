
from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, ForeignKey
from database.database import Base


class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    negocio_id = Column(
        Integer,
        ForeignKey("negocios.id", ondelete="CASCADE"),
        nullable=True
    )
    nombre = Column(String(100), nullable=False)
    precio = Column(Numeric(10, 2), nullable=False)
    descripcion = Column(Text, nullable=True)
    imagen_url = Column(String(255), nullable=True)
    categoria = Column(String(50), nullable=False, default="General")
    disponible = Column(Boolean, nullable=False, default=True)
