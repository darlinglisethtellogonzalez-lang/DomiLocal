
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database.database import get_db
from backend.models.producto import Producto
from backend.routers.auth import router as auth_router
from backend.routers.pedidos import router as pedidos_router

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

# Rutas de autenticación
app.include_router(auth_router)

# Rutas de pedidos
app.include_router(pedidos_router)


@app.get("/")
def inicio():
    return {
        "mensaje": "API DomiLocal funcionando correctamente",
        "base_de_datos": "MySQL"
    }


@app.get("/api/productos")
def obtener_productos(db: Session = Depends(get_db)):
    productos_db = db.query(Producto).order_by(Producto.id).all()

    return [
        {
            "id": producto.id,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "precio": float(producto.precio),
            "categoria": "General",
            "imagen_url": producto.imagen_url
        }
        for producto in productos_db
    ]

