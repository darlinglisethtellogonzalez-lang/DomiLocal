
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="API DomiLocal",
    description="API simulada para la Actividad 4",
    version="1.0.0"
)

# Permitir la comunicación con React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Productos simulados para la Actividad 4
productos = [
    {
        "id": 1,
        "nombre": "Hamburguesa especial",
        "descripcion": "Hamburguesa con queso, lechuga y tomate",
        "precio": 18000,
        "categoria": "Comidas"
    },
    {
        "id": 2,
        "nombre": "Pizza familiar",
        "descripcion": "Pizza familiar con queso y jamón",
        "precio": 30000,
        "categoria": "Comidas"
    },
    {
        "id": 3,
        "nombre": "Pollo apanado",
        "descripcion": "Pollo apanado acompañado de papas fritas",
        "precio": 22000,
        "categoria": "Comidas"
    },
    {
        "id": 4,
        "nombre": "Perro caliente",
        "descripcion": "Perro caliente con queso y salsas",
        "precio": 12000,
        "categoria": "Comidas"
    },
    {
        "id": 5,
        "nombre": "Jugo natural de naranja",
        "descripcion": "Jugo natural preparado con naranjas",
        "precio": 6000,
        "categoria": "Bebidas"
    },
    {
        "id": 6,
        "nombre": "Limonada natural",
        "descripcion": "Limonada refrescante",
        "precio": 5000,
        "categoria": "Bebidas"
    },
    {
        "id": 7,
        "nombre": "Papas a la francesa",
        "descripcion": "Papas fritas crujientes",
        "precio": 8000,
        "categoria": "Snacks"
    },
    {
        "id": 8,
        "nombre": "Empanadas",
        "descripcion": "Empanadas recién preparadas",
        "precio": 9000,
        "categoria": "Snacks"
    },
    {
        "id": 9,
        "nombre": "Brownie de chocolate",
        "descripcion": "Brownie de chocolate",
        "precio": 5500,
        "categoria": "Postres"
    },
    {
        "id": 10,
        "nombre": "Helado de vainilla",
        "descripcion": "Helado cremoso de vainilla",
        "precio": 7000,
        "categoria": "Postres"
    }
]


@app.get("/")
def inicio():
    return {
        "mensaje": "API DomiLocal funcionando correctamente"
    }


@app.get("/api/productos")
def obtener_productos():
    return productos

