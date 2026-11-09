
import { useEffect, useState } from "react";
import type { Screen } from "../App";
import { useCarrito } from "../context/CarritoContext";
import { productosAPI } from "../services/api";
import type { Producto } from "../services/api";

const NEGOCIOS = [
  {
    nombre: "Burger House",
    categoria: "Comidas",
    emoji: "🍔",
    rating: 4.8,
    tiempo: "25 min",
    imagen: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=240&fit=crop&auto=format",
  },
  {
    nombre: "Jugos & Más",
    categoria: "Bebidas",
    emoji: "🧃",
    rating: 4.6,
    tiempo: "20 min",
    imagen: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=240&fit=crop&auto=format",
  },
  {
    nombre: "Snack Attack",
    categoria: "Aperitivos",
    emoji: "🍟",
    rating: 4.5,
    tiempo: "15 min",
    imagen: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=240&fit=crop&auto=format",
  },
  {
    nombre: "Dulce Tentación",
    categoria: "Postres",
    emoji: "🍰",
    rating: 4.9,
    tiempo: "30 min",
    imagen: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=240&fit=crop&auto=format",
  },
];

const CATEGORIAS = [
  {
    label: "Comidas",
    emoji: "🍔",
    bg: "bg-orange-50 border-orange-200 hover:border-orange-400 hover:bg-orange-100",
  },
  {
    label: "Bebidas",
    emoji: "🧃",
    bg: "bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100",
  },
  {
    label: "Aperitivos",
    emoji: "🍟",
    bg: "bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100",
  },
  {
    label: "Postres",
    emoji: "🍰",
    bg: "bg-pink-50 border-pink-200 hover:border-pink-400 hover:bg-pink-100",
  },
];

const OFERTAS = [
  {
    titulo: "2×1 en Hamburguesas",
    desc: "Todos los martes de septiembre 2026",
    badge: "HOY",
    color: "bg-orange-500",
    imagen: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600&h=360&fit=crop&auto=format",
  },
  {
    titulo: "Envío gratis",
    desc: "En tu primer pedido del día",
    badge: "NUEVO",
    color: "bg-green-600",
    imagen: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&h=360&fit=crop&auto=format",
  },
];

interface Props {
  navegar: (
    s: Screen,
    extra?: { pedidoId?: number; categoria?: string }
  ) => void;
}

export default function InicioScreen({ navegar }: Props) {
  const { agregar } = useCarrito();

  const [agregado, setAgregado] = useState<number | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Cargar productos desde MySQL mediante FastAPI
  useEffect(() => {
    let activo = true;

    async function cargarProductos() {
      try {
        setCargando(true);
        setError("");

        const datos = await productosAPI.listarPrueba();

        if (activo) {
          setProductos(datos);
        }
      } catch (err) {
        console.error("Error al cargar productos:", err);

        if (activo) {
          setError("No se pudieron cargar los productos. Intenta nuevamente.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarProductos();

    return () => {
      activo = false;
    };
  }, []);

  // Abrir catálogo en una categoría específica
  const abrirCategoria = (categoria: string) => {
    navegar("productos", { categoria });
  };

  // Agregar productos al carrito
  const handleAgregar = (p: Producto) => {
    agregar(p);
    setAgregado(p.id);

    setTimeout(() => {
      setAgregado(null);
    }, 1200);
  };

  return (
    <div>

      {/* HERO */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-10">

          <div className="flex-1">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              🛵 Domicilios rápidos · DomiLocal
            </span>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Tus pedidos,<br />
              a la puerta<br />
              de tu casa
            </h1>

            <p className="text-green-100 text-base md:text-lg mb-8 max-w-md leading-relaxed">
              Encuentra los mejores productos de negocios locales y recibe tu domicilio de forma rápida y organizada.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => abrirCategoria("Todos")}
                className="bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg"
              >
                Ver productos →
              </button>

              <button
                onClick={() => navegar("registro")}
                className="bg-yellow-400 text-green-900 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg"
              >
                Crear cuenta gratis
              </button>
            </div>
          </div>

          <div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1526367790999-0150786686a2?w=640&h=640&fit=crop&auto=format"
              alt="Domiciliario en moto"
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* ESTADÍSTICAS */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-3 gap-4 text-center">
          {[
            {
              num: productos.length.toString(),
              label: "Productos disponibles",
              icon: "📦",
            },
            {
              num: "+50",
              label: "Negocios registrados",
              icon: "🏪",
            },
            {
              num: "<30",
              label: "Minutos de entrega",
              icon: "⚡",
            },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl">{s.icon}</p>
              <p className="text-xl font-bold text-green-600">{s.num}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OFERTAS */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Ofertas especiales
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {OFERTAS.map((o) => (
            <div
              key={o.titulo}
              className="relative rounded-2xl overflow-hidden h-40 cursor-pointer group"
              onClick={() => abrirCategoria("Todos")}
            >
              <img
                src={o.imagen}
                alt={o.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=360&fit=crop&auto=format";
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />

              <div className="absolute top-3 left-3">
                <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${o.color}`}>
                  {o.badge}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-bold text-lg leading-tight">{o.titulo}</p>
                <p className="text-sm text-white/80">{o.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Explorar por categoría
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.label}
              onClick={() => abrirCategoria(cat.label)}
              className={`flex flex-col items-center gap-2 border-2 rounded-2xl py-4 transition-all ${cat.bg}`}
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-semibold text-gray-700">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* NEGOCIOS DESTACADOS */}
      <section className="bg-gray-50 border-y border-gray-200 py-10">
        <div className="max-w-6xl mx-auto px-4">

          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800">
              Negocios cerca de ti
            </h2>

            <span className="text-xs text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full">
              📍 Tu ciudad
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {NEGOCIOS.map((n) => (
              <button
                key={n.nombre}
                onClick={() => abrirCategoria(n.categoria)}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left hover:shadow-md transition-shadow"
              >
                <div className="h-36 overflow-hidden">
                  <img
                    src={n.imagen}
                    alt={n.nombre}
                    className="w-full h-full object-cover transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=240&fit=crop&auto=format";
                    }}
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{n.emoji}</span>
                    <span className="text-xs text-yellow-600 font-semibold">
                      ⭐ {n.rating}
                    </span>
                  </div>

                  <p className="font-bold text-gray-900 text-sm">{n.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {n.categoria} · {n.tiempo}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="max-w-6xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            Productos destacados
          </h2>

          <button
            onClick={() => abrirCategoria("Todos")}
            className="text-green-600 text-sm font-semibold hover:underline"
          >
            Ver todos →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">

          {cargando && (
            <p className="text-gray-500 col-span-full text-center py-8">
              Cargando productos...
            </p>
          )}

          {!cargando && error && (
            <p className="text-red-600 col-span-full text-center py-8">
              {error}
            </p>
          )}

          {!cargando && !error && productos.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-8">
              No hay productos disponibles.
            </p>
          )}

          {!cargando && !error && productos.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative h-52 overflow-hidden bg-white flex items-center justify-center">
                <img
                  src={p.imagen_url}
                  alt={p.nombre}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&h=320&fit=crop&auto=format";
                  }}
                />

                <span className="absolute top-2 right-2 bg-white/90 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full shadow">
                  {p.categoria || "General"}
                </span>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <p className="font-bold text-gray-900">{p.nombre}</p>

                <p className="text-xs text-gray-400 mt-1 mb-3 flex-1 leading-relaxed">
                  {p.descripcion}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-bold text-lg">
                    ${p.precio.toLocaleString("es-CO")}
                  </span>

                  <button
                    onClick={() => handleAgregar(p)}
                    className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                      agregado === p.id
                        ? "bg-green-100 text-green-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {agregado === p.id ? "✓ Listo" : "Agregar"}
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="bg-green-50 border-y border-green-100">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-8">
            ¿Cómo funciona?
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              {
                n: "1",
                emoji: "🔍",
                titulo: "Explora",
                desc: "Busca productos de negocios locales cerca de ti.",
              },
              {
                n: "2",
                emoji: "🛒",
                titulo: "Agrega",
                desc: "Selecciona lo que quieres y agrégalo al carrito.",
              },
              {
                n: "3",
                emoji: "📦",
                titulo: "Pide",
                desc: "Confirma tu dirección y realiza el pedido.",
              },
              {
                n: "4",
                emoji: "🛵",
                titulo: "Recibe",
                desc: "Un domiciliario lleva tu pedido hasta tu puerta.",
              },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
                  {s.n}
                </div>

                <div className="text-4xl">{s.emoji}</div>
                <p className="font-bold text-gray-800">{s.titulo}</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIPOS DE USUARIO */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          ¿Eres parte del equipo?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              emoji: "👤",
              rol: "Cliente",
              desc: "Busca productos, haz pedidos y rastrea tus domicilios.",
              color: "border-blue-200 bg-blue-50",
              btn: "registro" as Screen,
            },
            {
              emoji: "🏪",
              rol: "Negocio",
              desc: "Administra tu catálogo y gestiona todos los pedidos.",
              color: "border-orange-200 bg-orange-50",
              btn: "registro" as Screen,
            },
            {
              emoji: "🛵",
              rol: "Domiciliario",
              desc: "Consulta los pedidos asignados y actualiza el estado.",
              color: "border-green-200 bg-green-50",
              btn: "registro" as Screen,
            },
          ].map((u) => (
            <div key={u.rol} className={`border-2 rounded-2xl p-6 ${u.color}`}>
              <div className="text-4xl mb-3">{u.emoji}</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{u.rol}</h3>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {u.desc}
              </p>

              <button
                onClick={() => navegar(u.btn)}
                className="text-sm font-semibold text-green-700 hover:underline"
              >
                Registrarse como {u.rol} →
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

