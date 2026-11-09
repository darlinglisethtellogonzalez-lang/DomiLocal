
import logging
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.database import get_db
from backend.models.usuario import Usuario
from backend.models.producto import Producto
from backend.models.negocio import Negocio
from backend.models.pedido import Pedido, DetallePedido
from backend.routers.auth import obtener_usuario_actual
from backend.schemas.pedido import PedidoCrear

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

COMISION_DOMILOCAL = Decimal("3000.00")


class PedidoEstadoActualizar(BaseModel):
    estado: Literal[
        "recibido",
        "preparando",
        "en_camino"
    ]


# ==========================================================
# FUNCION AUXILIAR PARA OBTENER LOS DETALLES
# ==========================================================

def construir_pedido_respuesta(pedido, db, cliente=None):
    detalles = db.query(DetallePedido).filter(
        DetallePedido.pedido_id == pedido.id
    ).all()

    return {
        "id": pedido.id,
        "cliente_id": pedido.cliente_id,
        "cliente_nombre": cliente.nombre if cliente else "Cliente",
        "domiciliario_id": pedido.domiciliario_id,
        "estado": pedido.estado,
        "total": float(pedido.total),
        "direccion_entrega": pedido.direccion_entrega,
        "created_at": (
            pedido.fecha_pedido.isoformat()
            if pedido.fecha_pedido else None
        ),
        "items": [
            {
                "producto_id": detalle.producto_id,
                "nombre_producto": detalle.nombre_producto,
                "cantidad": detalle.cantidad,
                "precio_unitario": float(detalle.precio_unitario)
            }
            for detalle in detalles
        ]
    }


# ==========================================================
# CREAR PEDIDO (CLIENTE)
# ==========================================================

@router.post("")
def crear_pedido(
    datos: PedidoCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    if usuario.rol != "cliente":
        raise HTTPException(
            status_code=403,
            detail="Solo los clientes pueden realizar pedidos"
        )

    if not datos.direccion_entrega.strip():
        raise HTTPException(
            status_code=400,
            detail="La dirección de entrega es obligatoria"
        )

    if not datos.items:
        raise HTTPException(
            status_code=400,
            detail="El pedido debe tener productos"
        )

    productos_pedido = []
    total = Decimal("0.00")
    negocio_id = None

    for item in datos.items:
        if item.cantidad <= 0:
            raise HTTPException(
                status_code=400,
                detail="La cantidad debe ser mayor que cero"
            )

        producto = db.query(Producto).filter(
            Producto.id == item.producto_id
        ).first()

        if not producto:
            raise HTTPException(
                status_code=404,
                detail=f"Producto {item.producto_id} no encontrado"
            )

        if producto.negocio_id is None:
            raise HTTPException(
                status_code=400,
                detail="El producto no tiene un negocio asociado"
            )

        if negocio_id is None:
            negocio_id = producto.negocio_id
        elif negocio_id != producto.negocio_id:
            raise HTTPException(
                status_code=400,
                detail="Cada pedido debe contener productos de un solo negocio"
            )

        precio = Decimal(str(producto.precio))
        total += precio * item.cantidad

        productos_pedido.append({
            "producto": producto,
            "cantidad": item.cantidad,
            "precio": precio
        })

    try:
        nuevo_pedido = Pedido(
            cliente_id=usuario.id,
            negocio_id=negocio_id,
            total=total,
            estado="pendiente",
            direccion_entrega=datos.direccion_entrega.strip()
        )

        db.add(nuevo_pedido)
        db.flush()

        for item in productos_pedido:
            detalle = DetallePedido(
                pedido_id=nuevo_pedido.id,
                producto_id=item["producto"].id,
                nombre_producto=item["producto"].nombre,
                cantidad=item["cantidad"],
                precio_unitario=item["precio"]
            )
            db.add(detalle)

        db.commit()
        db.refresh(nuevo_pedido)

        return {
            "mensaje": "Pedido registrado correctamente",
            "pedido_id": nuevo_pedido.id,
            "total": float(total),
            "estado": nuevo_pedido.estado
        }

    except Exception:
        db.rollback()
        logger.exception("Error al crear un pedido")
        raise HTTPException(
            status_code=500,
            detail="No se pudo registrar el pedido. Revisa la terminal del backend."
        )


# ==========================================================
# CONSULTAR MIS PEDIDOS (CLIENTE)
# ==========================================================

@router.get("/mis-pedidos")
def consultar_mis_pedidos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    if usuario.rol != "cliente":
        raise HTTPException(
            status_code=403,
            detail="Solo los clientes pueden consultar sus pedidos"
        )

    pedidos = db.query(Pedido).filter(
        Pedido.cliente_id == usuario.id
    ).order_by(Pedido.id.desc()).all()

    return [
        construir_pedido_respuesta(pedido, db, usuario)
        for pedido in pedidos
    ]


# ==========================================================
# CONSULTAR PEDIDOS DEL NEGOCIO
# ==========================================================

@router.get("/negocio/mis-pedidos")
def consultar_pedidos_negocio(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    if usuario.rol != "negocio":
        raise HTTPException(
            status_code=403,
            detail="Solo los negocios pueden consultar estos pedidos"
        )

    negocio = db.query(Negocio).filter(
        Negocio.usuario_id == usuario.id
    ).first()

    if not negocio:
        raise HTTPException(
            status_code=404,
            detail="No se encontró un negocio asociado a este usuario"
        )

    pedidos = db.query(Pedido).filter(
        Pedido.negocio_id == negocio.id
    ).order_by(Pedido.id.desc()).all()

    resultado = []

    for pedido in pedidos:
        detalles = db.query(DetallePedido).filter(
            DetallePedido.pedido_id == pedido.id
        ).all()

        comision = COMISION_DOMILOCAL
        neto_negocio = pedido.total - comision

        resultado.append({
            "pedido_id": pedido.id,
            "cliente_id": pedido.cliente_id,
            "domiciliario_id": pedido.domiciliario_id,
            "direccion_entrega": pedido.direccion_entrega,
            "fecha_pedido": (
                pedido.fecha_pedido.isoformat()
                if pedido.fecha_pedido else None
            ),
            "estado": pedido.estado,
            "productos": [
                {
                    "producto_id": detalle.producto_id,
                    "nombre": detalle.nombre_producto,
                    "cantidad": detalle.cantidad,
                    "precio_unitario": float(detalle.precio_unitario),
                    "subtotal": float(
                        detalle.precio_unitario * detalle.cantidad
                    )
                }
                for detalle in detalles
            ],
            "total_productos": float(pedido.total),
            "comision_domilocal": float(comision),
            "neto_negocio": float(neto_negocio)
        })

    return {
        "negocio": negocio.nombre_negocio,
        "cantidad_pedidos": len(resultado),
        "pedidos": resultado
    }


# ==========================================================
# ACTUALIZAR ESTADO DEL PEDIDO (NEGOCIO)
# ==========================================================

@router.put("/{pedido_id}/estado")
def actualizar_estado_pedido(
    pedido_id: int,
    datos: PedidoEstadoActualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    if usuario.rol != "negocio":
        raise HTTPException(
            status_code=403,
            detail="Solo los negocios pueden actualizar pedidos"
        )

    negocio = db.query(Negocio).filter(
        Negocio.usuario_id == usuario.id
    ).first()

    if not negocio:
        raise HTTPException(
            status_code=404,
            detail="No se encontró un negocio asociado a este usuario"
        )

    pedido = db.query(Pedido).filter(
        Pedido.id == pedido_id,
        Pedido.negocio_id == negocio.id
    ).first()

    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado para este negocio"
        )

    transiciones = {
        "pendiente": "recibido",
        "recibido": "preparando",
        "preparando": "en_camino"
    }

    estado_anterior = pedido.estado
    siguiente_estado = transiciones.get(estado_anterior)

    if siguiente_estado != datos.estado:
        raise HTTPException(
            status_code=400,
            detail=(
                f"No puedes cambiar el pedido de {estado_anterior} "
                f"a {datos.estado}. "
                f"El siguiente estado permitido es "
                f"{siguiente_estado or 'ninguno'}."
            )
        )

    try:
        pedido.estado = datos.estado
        db.commit()
        db.refresh(pedido)

        return {
            "mensaje": "Estado del pedido actualizado correctamente",
            "pedido_id": pedido.id,
            "estado_anterior": estado_anterior,
            "estado": pedido.estado
        }

    except Exception:
        db.rollback()
        logger.exception(
            "Error al actualizar el estado del pedido %s",
            pedido_id
        )
        raise HTTPException(
            status_code=500,
            detail="No se pudo actualizar el estado del pedido"
        )


# ==========================================================
# PEDIDOS DISPONIBLES PARA DOMICILIARIOS
# ==========================================================

@router.get("/domiciliario/disponibles")
def pedidos_disponibles(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    if usuario.rol != "domiciliario":
        raise HTTPException(
            status_code=403,
            detail="Solo los domiciliarios pueden consultar estos pedidos"
        )

    pedidos = db.query(Pedido).filter(
        Pedido.estado == "en_camino",
        Pedido.domiciliario_id.is_(None)
    ).order_by(Pedido.id.desc()).all()

    return [
        construir_pedido_respuesta(
            pedido,
            db,
            db.query(Usuario).filter(
                Usuario.id == pedido.cliente_id
            ).first()
        )
        for pedido in pedidos
    ]


# ==========================================================
# ACEPTAR UN PEDIDO (DOMICILIARIO)
# ==========================================================

@router.put("/{pedido_id}/asignar")
def asignar_pedido_domiciliario(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    if usuario.rol != "domiciliario":
        raise HTTPException(
            status_code=403,
            detail="Solo los domiciliarios pueden aceptar pedidos"
        )

    try:
        pedido = db.query(Pedido).filter(
            Pedido.id == pedido_id,
            Pedido.estado == "en_camino",
            Pedido.domiciliario_id.is_(None)
        ).with_for_update().first()

        if not pedido:
            raise HTTPException(
                status_code=409,
                detail="El pedido ya no está disponible para aceptar"
            )

        pedido.domiciliario_id = usuario.id

        db.commit()
        db.refresh(pedido)

        return {
            "mensaje": "Pedido asignado correctamente",
            "pedido_id": pedido.id,
            "domiciliario_id": usuario.id,
            "estado": pedido.estado
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        logger.exception("Error al asignar el pedido %s", pedido_id)
        raise HTTPException(
            status_code=500,
            detail="No se pudo aceptar el pedido"
        )


# ==========================================================
# CONSULTAR PEDIDOS ASIGNADOS AL DOMICILIARIO
# ==========================================================

@router.get("/domiciliario")
def consultar_pedidos_domiciliario(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    if usuario.rol != "domiciliario":
        raise HTTPException(
            status_code=403,
            detail="Solo los domiciliarios pueden consultar sus entregas"
        )

    pedidos = db.query(Pedido).filter(
        Pedido.domiciliario_id == usuario.id
    ).order_by(Pedido.id.desc()).all()

    resultado = []

    for pedido in pedidos:
        cliente = db.query(Usuario).filter(
            Usuario.id == pedido.cliente_id
        ).first()

        resultado.append(
            construir_pedido_respuesta(pedido, db, cliente)
        )

    return resultado


# ==========================================================
# MARCAR PEDIDO COMO ENTREGADO (DOMICILIARIO)
# ==========================================================

@router.put("/{pedido_id}/entrega")
def completar_entrega(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    if usuario.rol != "domiciliario":
        raise HTTPException(
            status_code=403,
            detail="Solo los domiciliarios pueden completar entregas"
        )

    pedido = db.query(Pedido).filter(
        Pedido.id == pedido_id,
        Pedido.domiciliario_id == usuario.id
    ).first()

    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="No se encontró una entrega asignada a tu cuenta"
        )

    if pedido.estado != "en_camino":
        raise HTTPException(
            status_code=400,
            detail="Esta entrega no se encuentra en camino"
        )

    try:
        pedido.estado = "entregado"
        db.commit()
        db.refresh(pedido)

        return {
            "mensaje": "Entrega completada correctamente",
            "pedido_id": pedido.id,
            "estado": pedido.estado
        }

    except Exception:
        db.rollback()
        logger.exception(
            "Error al completar la entrega %s",
            pedido_id
        )
        raise HTTPException(
            status_code=500,
            detail="No se pudo completar la entrega"
        )


# ==========================================================
# CONSULTAR DETALLE DE UN PEDIDO (CLIENTE)
# ==========================================================

@router.get("/{pedido_id}")
def consultar_detalle_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    if usuario.rol != "cliente":
        raise HTTPException(
            status_code=403,
            detail="Solo los clientes pueden consultar este pedido"
        )

    pedido = db.query(Pedido).filter(
        Pedido.id == pedido_id,
        Pedido.cliente_id == usuario.id
    ).first()

    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el pedido o no tienes permiso para verlo"
        )

    return construir_pedido_respuesta(pedido, db, usuario)

