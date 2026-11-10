
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from database.database import get_db
from backend.models.producto import Producto
from backend.models.negocio import Negocio
from backend.models.usuario import Usuario
from backend.routers.auth import obtener_usuario_actual


router = APIRouter(prefix="/productos", tags=["Productos"])


# ==========================================================
# ESQUEMAS
# ==========================================================

class ProductoCrear(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    precio: Decimal = Field(gt=0)
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    categoria: str = Field(default="General", max_length=50)
    disponible: bool = True


class ProductoActualizar(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=100)
    precio: Optional[Decimal] = Field(default=None, gt=0)
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    categoria: Optional[str] = Field(default=None, max_length=50)
    disponible: Optional[bool] = None


class ProductoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    negocio_id: Optional[int]
    nombre: str
    precio: Decimal
    descripcion: Optional[str]
    imagen_url: Optional[str]
    categoria: str
    disponible: bool


# ==========================================================
# OBTENER EL NEGOCIO DEL USUARIO AUTENTICADO
# ==========================================================

def obtener_mi_negocio(
    usuario: Usuario,
    db: Session
):
    if usuario.rol != "negocio":
        raise HTTPException(
            status_code=403,
            detail="Esta función solamente está disponible para negocios"
        )

    negocio = db.query(Negocio).filter(
        Negocio.usuario_id == usuario.id
    ).first()

    if not negocio:
        raise HTTPException(
            status_code=404,
            detail="No se encontró un negocio asociado a esta cuenta"
        )

    return negocio


def obtener_producto_del_negocio(
    producto_id: int,
    negocio_id: int,
    db: Session
):
    producto = db.query(Producto).filter(
        Producto.id == producto_id,
        Producto.negocio_id == negocio_id
    ).first()

    if not producto:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado en tu negocio"
        )

    return producto


# ==========================================================
# LISTAR PRODUCTOS PÚBLICOS
# ==========================================================

@router.get("", response_model=list[ProductoRespuesta])
def listar_productos(
    categoria: Optional[str] = None,
    busqueda: Optional[str] = None,
    db: Session = Depends(get_db)
):
    consulta = db.query(Producto).filter(
        Producto.disponible == True
    )

    if categoria:
        consulta = consulta.filter(
            Producto.categoria == categoria
        )

    if busqueda:
        consulta = consulta.filter(
            Producto.nombre.ilike(f"%{busqueda}%")
        )

    return consulta.order_by(Producto.id.desc()).all()


# ==========================================================
# LISTAR PRODUCTOS DEL NEGOCIO AUTENTICADO
# ==========================================================

@router.get(
    "/negocio/mis-productos",
    response_model=list[ProductoRespuesta]
)
def mis_productos(
    usuario: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    negocio = obtener_mi_negocio(usuario, db)

    return db.query(Producto).filter(
        Producto.negocio_id == negocio.id
    ).order_by(Producto.id.desc()).all()


# ==========================================================
# CONSULTAR UN PRODUCTO
# ==========================================================

@router.get("/{producto_id}", response_model=ProductoRespuesta)
def obtener_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    producto = db.query(Producto).filter(
        Producto.id == producto_id
    ).first()

    if not producto:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    return producto


# ==========================================================
# CREAR PRODUCTO
# ==========================================================

@router.post("", response_model=ProductoRespuesta, status_code=201)
def crear_producto(
    datos: ProductoCrear,
    usuario: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    negocio = obtener_mi_negocio(usuario, db)

    nuevo_producto = Producto(
        negocio_id=negocio.id,
        nombre=datos.nombre.strip(),
        precio=datos.precio,
        descripcion=datos.descripcion,
        imagen_url=datos.imagen_url,
        categoria=datos.categoria,
        disponible=datos.disponible
    )

    try:
        db.add(nuevo_producto)
        db.commit()
        db.refresh(nuevo_producto)
        return nuevo_producto

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="No se pudo guardar el producto"
        )


# ==========================================================
# EDITAR PRODUCTO
# ==========================================================

@router.put("/{producto_id}", response_model=ProductoRespuesta)
def editar_producto(
    producto_id: int,
    datos: ProductoActualizar,
    usuario: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    negocio = obtener_mi_negocio(usuario, db)

    producto = obtener_producto_del_negocio(
        producto_id,
        negocio.id,
        db
    )

    cambios = datos.model_dump(exclude_unset=True)

    for campo, valor in cambios.items():
        setattr(producto, campo, valor)

    try:
        db.commit()
        db.refresh(producto)
        return producto

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="No se pudo actualizar el producto"
        )


# ==========================================================
# ELIMINAR PRODUCTO
# ==========================================================

@router.delete("/{producto_id}")
def eliminar_producto(
    producto_id: int,
    usuario: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    negocio = obtener_mi_negocio(usuario, db)

    producto = obtener_producto_del_negocio(
        producto_id,
        negocio.id,
        db
    )

    try:
        db.delete(producto)
        db.commit()

        return {
            "mensaje": "Producto eliminado correctamente",
            "producto_id": producto_id
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="No se pudo eliminar el producto"
        )
