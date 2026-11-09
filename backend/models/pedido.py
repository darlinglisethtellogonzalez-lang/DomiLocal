from sqlalchemy import Column, Integer, Numeric, String, DateTime, text
from database.database import Base


class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=True)
    negocio_id = Column(Integer, nullable=True)
    domiciliario_id = Column(Integer, nullable=True)
    total = Column(Numeric(10, 2), nullable=False)
    estado = Column(String(30), default="pendiente")
    direccion_entrega = Column(String(255), nullable=True)
    fecha_pedido = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))


class DetallePedido(Base):
    __tablename__ = "detalle_pedido"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, nullable=False)
    producto_id = Column(Integer, nullable=False)
    nombre_producto = Column(String(100), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)