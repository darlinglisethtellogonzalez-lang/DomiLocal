from pydantic import BaseModel
from typing import List
from decimal import Decimal
from datetime import datetime


class ItemPedidoCrear(BaseModel):
    producto_id: int
    cantidad: int


class PedidoCrear(BaseModel):
    direccion_entrega: str
    items: List[ItemPedidoCrear]


class DetallePedidoRespuesta(BaseModel):
    producto_id: int
    nombre_producto: str
    cantidad: int
    precio_unitario: Decimal


class PedidoRespuesta(BaseModel):
    id: int
    cliente_id: int
    domiciliario_id: int | None
    estado: str
    total: Decimal
    direccion_entrega: str
    items: List[DetallePedidoRespuesta]
    created_at: datetime