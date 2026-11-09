
import { useEffect, useState } from "react";
import { productosAPI } from "../services/api";
import type { Screen } from "../App";
import { useCarrito } from "../context/CarritoContext";
import type { Producto } from "../services/api";

const CATEGORIAS = [
  "Todos",
  "Comidas",
  "Bebidas",
  "Aperitivos",
  "Postres",
];

interface Props {
  navegar: (s: Screen) => void;
  categoriaInicial?: string;
}

export default function ProductosScreen({
  navegar,
  categoriaInicial = "Todos",
}: Props) {
  const { agregar } = useCarrito();

  const [todos, setTodos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorAPI, setErrorAPI] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [agregado, setAgregado] = useState<number | null>(null);
  const [ordenPrecio, setOrdenPrecio] = useState<"asc" | "desc" | "">("");

  // Actualizar la categoría cuando se recibe una nueva desde Inicio
  useEffect(() => {
    setCategoria(categoriaInicial);
  }, [categoriaInicial]);

  // Consultar productos del backend
  useEffect(() => {
    let activo = true;

    productosAPI.listarPrueba()
      .then((datos) => {
        if (activo) {
          setTodos(datos);
          setErrorAPI("");
        }
      })
      .catch(() => {
        if (activo) {
          setErrorAPI(
            "No fue posible cargar los productos. Verifica que la API esté funcionando."
          );
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  // Agregar producto al carrito
  const handleAgregar = (p: Producto) => {
    agregar(p);
    setAgregado(p.id);

    setTimeout(() => {
      setAgregado(null);
    }, 1200);
  };

  // Filtrar productos
  const filtrados = todos
    .filter(
      (p) => categoria === "Todos" || p.categoria === categoria
    )
    .filter((p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => {
      if (ordenPrecio === "asc") return a.precio - b.precio;
      if (ordenPrecio === "desc") return b.precio - a.precio;
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Catálogo de productos
      </h1>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">

        <input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />

        <select
          value={ordenPrecio}
          onChange={(e) =>
            setOrdenPrecio(e.target.value as typeof ordenPrecio)
          }
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

      {/* Categorías */}
      <div className="flex flex-wrap gap-2 mb-6">

        {CATEGORIAS.map((cat) => (
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
          {filtrados.length} producto
          {filtrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Productos */}
      {cargando ? (

        <div className="text-center py-16 text-green-700">
          <p className="text-lg font-semibold">
            Cargando productos...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Consultando la API de DomiLocal.
          </p>
        </div>

      ) : errorAPI ? (

        <div className="text-center py-16 text-red-600">
          <p className="text-lg font-semibold">
            No se pudieron cargar los productos
          </p>

          <p className="text-sm mt-2">{errorAPI}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            Reintentar
          </button>
        </div>

      ) : filtrados.length === 0 ? (

        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>

          <p className="font-medium">
            No se encontraron productos
          </p>

          <button
            onClick={() => {
              setBusqueda("");
              setCategoria("Todos");
            }}
            className="mt-3 text-green-600 text-sm hover:underline"
          >
            Limpiar filtros
          </button>
        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

          {filtrados.map((p) => (

            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >

              <div className="relative">
                <img
                  src={
                    p.imagen_url ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=280&fit=crop&auto=format"
                  }
                  alt={p.nombre}
                  className="w-full h-40 object-cover bg-gray-100"
                  loading="lazy"
                />

                <span className="absolute top-2 left-2 bg-white/90 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {p.categoria}
                </span>
              </div>

              <div className="p-4 flex flex-col flex-1">

                <p className="font-bold text-gray-900 mb-1">
                  {p.nombre}
                </p>

                <p className="text-xs text-gray-400 leading-relaxed flex-1 mb-3">
                  {p.descripcion}
                </p>

                <div className="flex items-center justify-between">

                  <span className="text-green-600 font-bold">
                    ${p.precio.toLocaleString("es-CO")}
                  </span>

                  <button
                    onClick={() => handleAgregar(p)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      agregado === p.id
                        ? "bg-green-100 text-green-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {agregado === p.id
                      ? "✓ Agregado"
                      : "Agregar"}
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

