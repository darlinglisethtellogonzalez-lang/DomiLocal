import { useState } from "react";
import type { Screen } from "../App";
import { useCarrito } from "../context/CarritoContext";
import type { Producto } from "../services/api";

// Datos de demostración — en producción: productosAPI.listar()
const TODOS: Producto[] = [
  { id: 1,  nombre: "Hamburguesa Clásica",    precio: 18000, descripcion: "Carne 200g, queso, lechuga y tomate.",     imagen_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=280&fit=crop&auto=format", categoria: "Comidas",  disponible: true, negocio_id: 1 },
  { id: 2,  nombre: "Jugo Natural de Mora",   precio: 6000,  descripcion: "Mora fresca, leche y azúcar.",             imagen_url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=280&fit=crop&auto=format", categoria: "Bebidas",  disponible: true, negocio_id: 1 },
  { id: 3,  nombre: "Papas a la Francesa",    precio: 8000,  descripcion: "Papas fritas crujientes con sal.",         imagen_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=280&fit=crop&auto=format", categoria: "Snacks",   disponible: true, negocio_id: 1 },
  { id: 4,  nombre: "Galletas de Chocolate",  precio: 5000,  descripcion: "Galletas suaves con chips de chocolate.",  imagen_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=280&fit=crop&auto=format", categoria: "Postres",  disponible: true, negocio_id: 1 },
  { id: 5,  nombre: "Pizza Margarita",        precio: 22000, descripcion: "Salsa tomate, mozzarella y albahaca.",     imagen_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=280&fit=crop&auto=format", categoria: "Comidas",  disponible: true, negocio_id: 1 },
  { id: 6,  nombre: "Limonada Natural",       precio: 5000,  descripcion: "Limón, agua y azúcar. Muy refrescante.",   imagen_url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=280&fit=crop&auto=format", categoria: "Bebidas",  disponible: true, negocio_id: 1 },
  { id: 7,  nombre: "Empanadas x3",           precio: 9000,  descripcion: "Empanadas de pipián recién horneadas.",    imagen_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=280&fit=crop&auto=format", categoria: "Snacks",   disponible: true, negocio_id: 1 },
  { id: 8,  nombre: "Helado de Vainilla",     precio: 7000,  descripcion: "Helado artesanal de vainilla bourbon.",    imagen_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=280&fit=crop&auto=format", categoria: "Postres",  disponible: true, negocio_id: 1 },
  { id: 9,  nombre: "Bandeja Paisa",          precio: 28000, descripcion: "Arroz, frijoles, chicharrón, carne y más.",imagen_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=280&fit=crop&auto=format", categoria: "Comidas",  disponible: true, negocio_id: 1 },
  { id: 10, nombre: "Café Americano",         precio: 4000,  descripcion: "Café negro de origen colombiano.",         imagen_url: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&h=280&fit=crop&auto=format", categoria: "Bebidas",  disponible: true, negocio_id: 1 },
  { id: 11, nombre: "Arepas con Queso",       precio: 6500,  descripcion: "Arepas de choclo con queso derretido.",    imagen_url: "https://images.unsplash.com/photo-1539198769068-37ef97abb0e0?w=400&h=280&fit=crop&auto=format", categoria: "Snacks",   disponible: true, negocio_id: 1 },
  { id: 12, nombre: "Brownie de Chocolate",   precio: 5500,  descripcion: "Brownie esponjoso con nueces.",            imagen_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=280&fit=crop&auto=format", categoria: "Postres",  disponible: true, negocio_id: 1 },
];

const CATEGORIAS = ["Todos", "Comidas", "Bebidas", "Snacks", "Postres"];

interface Props { navegar: (s: Screen) => void }

export default function ProductosScreen({ navegar }: Props) {
  const { agregar } = useCarrito();
  const [busqueda, setBusqueda]       = useState("");
  const [categoria, setCategoria]     = useState("Todos");
  const [agregado, setAgregado]       = useState<number | null>(null);
  const [ordenPrecio, setOrdenPrecio] = useState<"asc" | "desc" | "">("");

  const handleAgregar = (p: Producto) => {
    agregar(p);
    setAgregado(p.id);
    setTimeout(() => setAgregado(null), 1200);
  };

  const filtrados = TODOS
    .filter(p => (categoria === "Todos" || p.categoria === categoria))
    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (ordenPrecio === "asc")  return a.precio - b.precio;
      if (ordenPrecio === "desc") return b.precio - a.precio;
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Catálogo de productos</h1>

      {/* ── Barra de búsqueda y filtros ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <select
          value={ordenPrecio}
          onChange={e => setOrdenPrecio(e.target.value as typeof ordenPrecio)}
          className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="">Ordenar por</option>
          <option value="asc">Precio: menor a mayor</option>
          <option value="desc">Precio: mayor a menor</option>
        </select>
        <button
          onClick={() => navegar("carrito")}
          className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
        >
          Ver carrito →
        </button>
      </div>

      {/* ── Pestañas de categoría ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIAS.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              categoria === cat
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 self-center">
          {filtrados.length} producto{filtrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Grilla de productos ── */}
      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No se encontraron productos</p>
          <button onClick={() => { setBusqueda(""); setCategoria("Todos"); }} className="mt-3 text-green-600 text-sm hover:underline">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtrados.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="relative">
                <img src={p.imagen_url} alt={p.nombre} className="w-full h-40 object-cover bg-gray-100" loading="lazy"
                onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=280&fit=crop&auto=format"; }} />
                <span className="absolute top-2 left-2 bg-white/90 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {p.categoria}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="font-bold text-gray-900 mb-1">{p.nombre}</p>
                <p className="text-xs text-gray-400 leading-relaxed flex-1 mb-3">{p.descripcion}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-bold">${p.precio.toLocaleString("es-CO")}</span>
                  <button
                    onClick={() => handleAgregar(p)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      agregado === p.id
                        ? "bg-green-100 text-green-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {agregado === p.id ? "✓ Agregado" : "Agregar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
