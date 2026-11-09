
from database.database import SessionLocal
from backend.models.producto import Producto

NEGOCIO_ID = 52

PRODUCTOS = [
    {
        "nombre": "Hamburguesa especial",
        "descripcion": "Hamburguesa con queso, lechuga y tomate",
        "precio": 18000,
        "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop",
    },
    {
        "nombre": "Pizza familiar",
        "descripcion": "Pizza familiar con queso y jamón",
        "precio": 30000,
        "imagen_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop",
    },
    {
        "nombre": "Pollo apanado",
        "descripcion": "Pollo apanado acompañado de papas fritas",
        "precio": 22000,
        "imagen_url": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop",
    },
    {
        "nombre": "Perro caliente",
        "descripcion": "Perro caliente con queso y salsas",
        "precio": 12000,
        "imagen_url": "https://images.unsplash.com/photo-1612392061981-9d086fe894ed?auto=format&fit=crop&fm=jpg&q=80&w=500",
    },
    {
        "nombre": "Jugo natural de naranja",
        "descripcion": "Jugo natural preparado con naranjas",
        "precio": 6000,
        "imagen_url": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop",
    },
    {
        "nombre": "Limonada natural",
        "descripcion": "Limonada refrescante",
        "precio": 5000,
        "imagen_url": "https://images.unsplash.com/photo-1631308492942-3a713d7fd02e?auto=format&fit=crop&fm=jpg&q=80&w=500",
    },
    {
        "nombre": "Papas a la francesa",
        "descripcion": "Papas fritas crujientes con sal",
        "precio": 8000,
        "imagen_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop",
    },
    {
        "nombre": "Empanadas",
        "descripcion": "Empanadas recién preparadas",
        "precio": 9000,
        "imagen_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop",
    },
    {
        "nombre": "Brownie de chocolate",
        "descripcion": "Brownie de chocolate",
        "precio": 5500,
        "imagen_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop",
    },
    {
        "nombre": "Helado de vainilla",
        "descripcion": "Helado cremoso de vainilla",
        "precio": 7000,
        "imagen_url": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop",
    },
]


def cargar_productos():
    db = SessionLocal()

    try:
        existentes = {
            p[0]
            for p in db.query(Producto.nombre)
            .filter(Producto.negocio_id == NEGOCIO_ID)
            .all()
        }

        nuevos = 0

        for datos in PRODUCTOS:
            if datos["nombre"] in existentes:
                continue

            producto = Producto(
                negocio_id=NEGOCIO_ID,
                nombre=datos["nombre"],
                descripcion=datos["descripcion"],
                precio=datos["precio"],
                imagen_url=datos["imagen_url"],
            )

            db.add(producto)
            nuevos += 1

        db.commit()

        total = (
            db.query(Producto)
            .filter(Producto.negocio_id == NEGOCIO_ID)
            .count()
        )

        print(f"Proceso terminado. Productos nuevos guardados: {nuevos}")
        print(f"Total de productos del negocio: {total}")

    except Exception as error:
        db.rollback()
        print("Error al guardar los productos:", error)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    cargar_productos()
