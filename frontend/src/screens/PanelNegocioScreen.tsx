import { useState } from "react";
import type { Screen } from "../App";
import type { Pedido, EstadoPedido } from "../services/api";
import { ETIQUETAS_ESTADO } from "../services/api";

const PEDIDOS_DEMO: Pedido[] = [
  { id: 1, cliente_id: 1, cliente_nombre: "Juan Pérez",   domiciliario_id: null, estado: "recibido",  total: 24000, direccion_entrega: "Cra 10 #20-30, Barrio Centro", created_at: "2026-09-07T10:00:00",
    items: [{ producto_id: 1, cantidad: 1, precio_unitario: 18000, nombre_producto: "Hamburguesa Clásica" }, { producto_id: 2, cantidad: 1, precio_unitario: 6000, nombre_producto: "Jugo Natural de Mora" }] },
  { id: 2, cliente_id: 2, cliente_nombre: "Ana Gómez",    domiciliario_id: null, estado: "preparando", total: 15000, direccion_entrega: "Cl 45 #12-15, Barrio Sur",     created_at: "2026-09-07T09:30:00",
    items: [{ producto_id: 3, cantidad: 1, precio_unitario: 8000, nombre_producto: "Papas a la Francesa" }, { producto_id: 2, cantidad: 1, precio_unitario: 7000, nombre_producto: "Helado de Vainilla" }] },
  { id: 3, cliente_id: 3, cliente_nombre: "Luis Ramírez", domiciliario_id: 2,    estado: "en_camino",  total: 31000, direccion_entrega: "Av 68 #30-20, Barrio Norte",   created_at: "2026-09-07T08:00:00",
    items: [{ producto_id: 5, cantidad: 1, precio_unitario: 22000, nombre_producto: "Pizza Margarita" }, { producto_id: 3, cantidad: 1, precio_unitario: 9000, nombre_producto: "Empanadas x3" }] },
  { id: 4, cliente_id: 4, cliente_nombre: "María Torres", domiciliario_id: 3,    estado: "entregado",  total: 12000, direccion_entrega: "Cra 7 #45-20, Chapinero",       created_at: "2026-09-07T07:00:00",
    items: [{ producto_id: 4, cantidad: 2, precio_unitario: 5000, nombre_producto: "Galletas de Chocolate" }, { producto_id: 6, cantidad: 1, precio_unitario: 2000, nombre_producto: "Limonada Natural" }] },
];

const COLOR_ESTADO: Record<EstadoPedido, string> = {
  recibido:  "bg-blue-100 text-blue-700",
  preparando:"bg-yellow-100 text-yellow-700",
  en_camino: "bg-orange-100 text-orange-700",
  entregado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-600",
};

const ICONO_ESTADO: Record<EstadoPedido, string> = {
  recibido:"📋", preparando:"🍳", en_camino:"🛵", entregado:"✅", cancelado:"❌",
};

type Tab = "pedidos" | "productos" | "estadisticas";

interface Props { navegar: (s: Screen) => void }

export default function PanelNegocioScreen({ navegar }: Props) {
  const [tab, setTab]         = useState<Tab>("pedidos");
  const [pedidos, setPedidos] = useState(PEDIDOS_DEMO);
  const [abierto, setAbierto] = useState<number | null>(null);

  const cambiarEstado = (id: number, estado: EstadoPedido) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
    setAbierto(null);
  };

  const stats = {
    total:     pedidos.length,
    nuevos:    pedidos.filter(p => p.estado === "recibido").length,
    enCamino:  pedidos.filter(p => p.estado === "en_camino").length,
    entregados:pedidos.filter(p => p.estado === "entregado").length,
    ingresos:  pedidos.filter(p => p.estado !== "cancelado").reduce((a,b) => a + b.total, 0),
  };

  const formatHora = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel del Negocio</h1>
          <p className="text-sm text-gray-500">Domingo, 7 de septiembre de 2026</p>
        </div>
        <button onClick={() => navegar("inicio")} className="text-sm text-gray-500 hover:text-green-600 hover:underline">
          ← Ir al inicio
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Pedidos hoy",  valor: stats.total,                                           color: "text-gray-800"   },
          { label: "Nuevos",       valor: stats.nuevos,                                           color: "text-blue-600"   },
          { label: "En cocina",    valor: pedidos.filter(p=>p.estado==="preparando").length,       color: "text-yellow-600" },
          { label: "En camino",    valor: stats.enCamino,                                         color: "text-orange-600" },
          { label: "Ingresos",     valor: `$${stats.ingresos.toLocaleString("es-CO")}`,           color: "text-green-600"  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.valor}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["pedidos","productos","estadisticas"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              tab === t ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
            }`}>
            {t === "pedidos" ? "📋 Pedidos" : t === "productos" ? "📦 Productos" : "📊 Estadísticas"}
          </button>
        ))}
      </div>

      {/* ── Tab Pedidos ── */}
      {tab === "pedidos" && (
        <div className="space-y-3">
          {pedidos.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-lg">{ICONO_ESTADO[p.estado]}</span>
                    <span className="font-bold text-gray-900">Pedido #{p.id}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COLOR_ESTADO[p.estado]}`}>
                      {ETIQUETAS_ESTADO[p.estado]}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">{formatHora(p.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600">👤 {p.cliente_nombre}</p>
                  <p className="text-sm text-gray-500">📍 {p.direccion_entrega}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.items.map(i => (
                      <span key={i.producto_id} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {i.nombre_producto} ×{i.cantidad}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-xl font-bold text-green-600">${p.total.toLocaleString("es-CO")}</p>
                  {p.estado !== "entregado" && p.estado !== "cancelado" && (
                    <button onClick={() => setAbierto(abierto === p.id ? null : p.id)}
                      className="text-sm font-semibold bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors">
                      {abierto === p.id ? "Cerrar ▲" : "Cambiar estado ▼"}
                    </button>
                  )}
                </div>
              </div>
              {abierto === p.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Selecciona el nuevo estado:</p>
                  <div className="flex flex-wrap gap-2">
                    {(["recibido","preparando","en_camino","entregado","cancelado"] as EstadoPedido[]).map(estado => (
                      <button key={estado} onClick={() => cambiarEstado(p.id, estado)}
                        className={`text-xs px-3 py-2 rounded-xl border font-semibold transition-all ${
                          p.estado === estado
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-700"
                        }`}>
                        {ICONO_ESTADO[estado]} {ETIQUETAS_ESTADO[estado]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Tab Productos ── */}
      {tab === "productos" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { nombre:"Hamburguesa Clásica", precio:18000, pedidos:12, img:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=140&fit=crop&auto=format" },
              { nombre:"Pizza Margarita",     precio:22000, pedidos:8,  img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=140&fit=crop&auto=format" },
              { nombre:"Papas a la Francesa", precio:8000,  pedidos:15, img:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=140&fit=crop&auto=format" },
            ].map(prod => (
              <div key={prod.nombre} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <img src={prod.img} alt={prod.nombre} className="w-full h-32 object-cover bg-gray-100"
                  onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=140&fit=crop&auto=format"; }} />
                <div className="p-4">
                  <p className="font-bold text-gray-800 text-sm">{prod.nombre}</p>
                  <p className="text-green-600 font-bold">${prod.precio.toLocaleString("es-CO")}</p>
                  <p className="text-xs text-gray-400 mt-1">{prod.pedidos} pedidos hoy</p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 text-xs bg-green-600 text-white rounded-lg py-1.5 font-semibold hover:bg-green-700 transition-colors">Editar</button>
                    <button className="text-xs border border-gray-300 text-gray-600 rounded-lg px-3 py-1.5 hover:border-red-300 hover:text-red-600 transition-colors">Ocultar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full border-2 border-dashed border-green-300 text-green-600 font-semibold rounded-2xl py-4 hover:bg-green-50 transition-colors text-sm">
            + Agregar nuevo producto
          </button>
        </div>
      )}

      {/* ── Tab Estadísticas ── */}
      {tab === "estadisticas" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">Pedidos — Sep 2026</h3>
            <div className="space-y-3">
              {[
                { dia:"Lunes 1",     cant:8  },
                { dia:"Martes 2",    cant:12 },
                { dia:"Miércoles 3", cant:7  },
                { dia:"Jueves 4",    cant:15 },
                { dia:"Viernes 5",   cant:20 },
                { dia:"Sábado 6",    cant:18 },
                { dia:"Hoy (7)",     cant:4  },
              ].map(d => (
                <div key={d.dia} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-28 flex-shrink-0">{d.dia}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full transition-all"
                      style={{ width: `${(d.cant / 20) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-6 text-right">{d.cant}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">Productos más vendidos</h3>
            <div className="space-y-3">
              {[
                { nombre:"Hamburguesa Clásica", pct:35, color:"bg-orange-500" },
                { nombre:"Papas a la Francesa", pct:25, color:"bg-yellow-500" },
                { nombre:"Pizza Margarita",     pct:20, color:"bg-red-500"    },
                { nombre:"Jugo Natural",         pct:15, color:"bg-blue-500"   },
                { nombre:"Otros",               pct:5,  color:"bg-gray-400"   },
              ].map(item => (
                <div key={item.nombre} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-36 flex-shrink-0 truncate">{item.nombre}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
