import { useState } from "react";
import type { Screen } from "../App";
import { useCarrito } from "../context/CarritoContext";
import type { Producto } from "../services/api";

const PRODUCTOS_DEMO: Producto[] = [
  { id: 1,  nombre: "Hamburguesa Clásica",   precio: 18000, descripcion: "Carne 200g, queso, lechuga y tomate.",    imagen_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&h=320&fit=crop&auto=format", categoria: "Comidas",  disponible: true, negocio_id: 1 },
  { id: 2,  nombre: "Jugo Natural de Mora",  precio: 6000,  descripcion: "Mora fresca, leche y azúcar.",            imagen_url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=480&h=320&fit=crop&auto=format", categoria: "Bebidas",  disponible: true, negocio_id: 1 },
  { id: 3,  nombre: "Papas a la Francesa",   precio: 8000,  descripcion: "Papas fritas crujientes con sal.",        imagen_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=480&h=320&fit=crop&auto=format", categoria: "Snacks",   disponible: true, negocio_id: 1 },
  { id: 5,  nombre: "Pizza Margarita",       precio: 22000, descripcion: "Salsa tomate, mozzarella y albahaca.",    imagen_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=480&h=320&fit=crop&auto=format", categoria: "Comidas",  disponible: true, negocio_id: 1 },
];

const NEGOCIOS = [
  { nombre: "Burger House",     categoria: "Comidas",  emoji: "🍔", rating: 4.8, tiempo: "25 min", imagen: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=240&fit=crop&auto=format" },
  { nombre: "Jugos & Más",      categoria: "Bebidas",  emoji: "🧃", rating: 4.6, tiempo: "20 min", imagen: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=240&fit=crop&auto=format" },
  { nombre: "Snack Attack",     categoria: "Snacks",   emoji: "🍟", rating: 4.5, tiempo: "15 min", imagen: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=240&fit=crop&auto=format" },
  { nombre: "Dulce Tentación",  categoria: "Postres",  emoji: "🍰", rating: 4.9, tiempo: "30 min", imagen: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=240&fit=crop&auto=format" },
];

const CATEGORIAS = [
  { label: "Comidas",  emoji: "🍔", bg: "bg-orange-50 border-orange-200 hover:border-orange-400 hover:bg-orange-100" },
  { label: "Bebidas",  emoji: "🧃", bg: "bg-blue-50   border-blue-200   hover:border-blue-400   hover:bg-blue-100"   },
  { label: "Snacks",   emoji: "🍟", bg: "bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100" },
  { label: "Postres",  emoji: "🍰", bg: "bg-pink-50   border-pink-200   hover:border-pink-400   hover:bg-pink-100"   },
  { label: "Pizzas",   emoji: "🍕", bg: "bg-red-50    border-red-200    hover:border-red-400    hover:bg-red-100"    },
  { label: "Otros",    emoji: "📦", bg: "bg-gray-50   border-gray-200   hover:border-gray-400   hover:bg-gray-100"   },
];

const OFERTAS = [
  { titulo: "2×1 en Hamburguesas", desc: "Todos los martes de septiembre 2026", badge: "HOY", color: "bg-orange-500", imagen: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600&h=360&fit=crop&auto=format" },
  { titulo: "Envío gratis",        desc: "En tu primer pedido del día",          badge: "NUEVO", color: "bg-green-600",  imagen: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&h=360&fit=crop&auto=format" },
];

interface Props { navegar: (s: Screen) => void }

export default function InicioScreen({ navegar }: Props) {
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState<number | null>(null);

  const handleAgregar = (p: Producto) => {
    agregar(p);
    setAgregado(p.id);
    setTimeout(() => setAgregado(null), 1200);
  };

  return (
    <div>
      {/* ── HERO ─────────────────────────────── */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              🛵 Domicilios rápidos · Septiembre 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Tus pedidos,<br />a la puerta<br />de tu casa
            </h1>
            <p className="text-green-100 text-base md:text-lg mb-8 max-w-md leading-relaxed">
              Encuentra los mejores productos de negocios locales y recibe tu domicilio de forma rápida y organizada.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navegar("productos")}
                className="bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg">
                Ver productos →
              </button>
              <button onClick={() => navegar("registro")}
                className="bg-yellow-400 text-green-900 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg">
                Crear cuenta gratis
              </button>
            </div>
          </div>
          {/* Imagen hero */}
          <div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1526367790999-0150786686a2?w=640&h=640&fit=crop&auto=format"
              alt="Domiciliario en moto"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────── */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-3 gap-4 text-center">
          {[
            { num: "+200", label: "Productos disponibles", icon: "📦" },
            { num: "+50",  label: "Negocios registrados",  icon: "🏪" },
            { num: "<30",  label: "Minutos de entrega",    icon: "⚡" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl">{s.icon}</p>
              <p className="text-xl font-bold text-green-600">{s.num}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── OFERTAS ────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ofertas de septiembre 2026</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {OFERTAS.map(o => (
            <div key={o.titulo} className="relative rounded-2xl overflow-hidden h-40 cursor-pointer group"
              onClick={() => navegar("productos")}>
              <img src={o.imagen} alt={o.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=360&fit=crop&auto=format"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${o.color}`}>{o.badge}</span>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-bold text-lg leading-tight">{o.titulo}</p>
                <p className="text-sm text-white/80">{o.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORÍAS ─────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Explorar por categoría</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIAS.map(cat => (
            <button key={cat.label} onClick={() => navegar("productos")}
              className={`flex flex-col items-center gap-2 border-2 rounded-2xl py-4 transition-all ${cat.bg}`}>
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-semibold text-gray-700">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── NEGOCIOS DESTACADOS ─────────────── */}
      <section className="bg-gray-50 border-y border-gray-200 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800">Negocios cerca de ti</h2>
            <span className="text-xs text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full">
              📍 Tu ciudad · Sep 2026
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {NEGOCIOS.map(n => (
              <button key={n.nombre} onClick={() => navegar("productos")}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left hover:shadow-md transition-shadow">
                <div className="h-36 overflow-hidden">
                  <img src={n.imagen} alt={n.nombre}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=240&fit=crop&auto=format"; }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{n.emoji}</span>
                    <span className="text-xs text-yellow-600 font-semibold">⭐ {n.rating}</span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{n.nombre}</p>
                  <p className="text-xs text-gray-500">{n.categoria} · {n.tiempo}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS DESTACADOS ─────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800">Productos destacados</h2>
          <button onClick={() => navegar("productos")} className="text-green-600 text-sm font-semibold hover:underline">
            Ver todos →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {PRODUCTOS_DEMO.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="relative h-44 overflow-hidden bg-gray-100">
                <img src={p.imagen_url} alt={p.nombre}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&h=320&fit=crop&auto=format"; }}
                />
                <span className="absolute top-2 right-2 bg-white/90 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full shadow">
                  {p.categoria}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="font-bold text-gray-900">{p.nombre}</p>
                <p className="text-xs text-gray-400 mt-1 mb-3 flex-1 leading-relaxed">{p.descripcion}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-bold text-lg">${p.precio.toLocaleString("es-CO")}</span>
                  <button onClick={() => handleAgregar(p)}
                    className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                      agregado === p.id ? "bg-green-100 text-green-700" : "bg-green-600 text-white hover:bg-green-700"
                    }`}>
                    {agregado === p.id ? "✓ Listo" : "Agregar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────── */}
      <section className="bg-green-50 border-y border-green-100">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-8">¿Cómo funciona?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { n:"1", emoji:"🔍", titulo:"Explora", desc:"Busca productos de negocios locales cerca de ti." },
              { n:"2", emoji:"🛒", titulo:"Agrega",  desc:"Selecciona lo que quieres y agrégalo al carrito." },
              { n:"3", emoji:"📦", titulo:"Pide",    desc:"Confirma tu dirección y realiza el pedido."      },
              { n:"4", emoji:"🛵", titulo:"Recibe",  desc:"Un domiciliario lleva tu pedido hasta tu puerta."},
            ].map(s => (
              <div key={s.n} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
                  {s.n}
                </div>
                <div className="text-4xl">{s.emoji}</div>
                <p className="font-bold text-gray-800">{s.titulo}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIPOS DE USUARIO ─────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6">¿Eres parte del equipo?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { emoji:"👤", rol:"Cliente",      desc:"Busca productos, haz pedidos y rastrea tus domicilios.", color:"border-blue-200 bg-blue-50",   btn:"registro" as Screen },
            { emoji:"🏪", rol:"Negocio",       desc:"Administra tu catálogo y gestiona todos los pedidos.",  color:"border-orange-200 bg-orange-50",btn:"registro" as Screen },
            { emoji:"🛵", rol:"Domiciliario",  desc:"Consulta los pedidos asignados y actualiza el estado.", color:"border-green-200 bg-green-50",  btn:"registro" as Screen },
          ].map(u => (
            <div key={u.rol} className={`border-2 rounded-2xl p-6 ${u.color}`}>
              <div className="text-4xl mb-3">{u.emoji}</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{u.rol}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{u.desc}</p>
              <button onClick={() => navegar(u.btn)}
                className="text-sm font-semibold text-green-700 hover:underline">
                Registrarse como {u.rol} →
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
