
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database.database import get_db, engine, Base

from backend.models import (
    Usuario,
    Negocio,
    Producto,
    Pedido,
    DetallePedido,
)

from backend.routers.auth import router as auth_router
from backend.routers.pedidos import router as pedidos_router
from backend.routers.productos import router as productos_router


app = FastAPI(
    title="API DomiLocal",
    description="API de gestión de productos, usuarios y pedidos de DomiLocal",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def crear_tablas():
    Base.metadata.create_all(bind=engine)


# Rutas
app.include_router(auth_router)
app.include_router(pedidos_router)
app.include_router(productos_router)


@app.get("/")
def inicio():
    return {
        "mensaje": "API DomiLocal funcionando correctamente",
        "base_de_datos": "MySQL"
    }


# Mantener la ruta anterior para compatibilidad
@app.get("/api/productos")
def obtener_productos(db: Session = Depends(get_db)):
    productos_db = db.query(Producto).filter(
        Producto.disponible == True
    ).order_by(Producto.id).all()

    return [
        {
            "id": producto.id,
            "negocio_id": producto.negocio_id,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "precio": float(producto.precio),
            "categoria": producto.categoria,
            "imagen_url": producto.imagen_url,
            "disponible": producto.disponible
        }
        for producto in productos_db
    ]

