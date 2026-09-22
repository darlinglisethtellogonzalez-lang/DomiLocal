import { useState } from "react";
import type { Screen } from "../App";
import type { Pedido, EstadoPedido } from "../services/api";
import { ETIQUETAS_ESTADO } from "../services/api";

const ENTREGAS_DEMO: Pedido[] = [
  { id: 1, cliente_id: 1, cliente_nombre: "Juan Pérez",   domiciliario_id: 2, estado: "preparando", total: 24000,
    direccion_entrega: "Cra 10 #20-30, Barrio Centro", created_at: "2026-09-07T10:00:00",
    items: [
      { producto_id: 1, cantidad: 1, precio_unitario: 18000, nombre_producto: "Hamburguesa Clásica"  },
      { producto_id: 2, cantidad: 1, precio_unitario: 6000,  nombre_producto: "Jugo Natural de Mora" },
    ] },
  { id: 2, cliente_id: 2, cliente_nombre: "Ana Gómez",    domiciliario_id: 2, estado: "en_camino",  total: 15000,
    direccion_entrega: "Cl 45 #12-15, Barrio Sur", created_at: "2026-09-07T09:30:00",
    items: [
      { producto_id: 3, cantidad: 2, precio_unitario: 7500, nombre_producto: "Papas a la Francesa" },
    ] },
  { id: 3, cliente_id: 3, cliente_nombre: "Luis Ramírez", domiciliario_id: 2, estado: "entregado",  total: 9000,
    direccion_entrega: "Av 68 #30-20, Barrio Norte", created_at: "2026-09-07T08:00:00",
    items: [
      { producto_id: 7, cantidad: 1, precio_unitario: 9000, nombre_producto: "Empanadas x3" },
    ] },
];

const COLOR_ESTADO: Record<EstadoPedido, string> = {
  recibido:  "bg-blue-100 text-blue-700",
  preparando:"bg-yellow-100 text-yellow-700",
  en_camino: "bg-orange-100 text-orange-700",
  entregado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-600",
};

interface Props { navegar: (s: Screen) => void }

export default function PanelDomiciliarioScreen({ navegar }: Props) {
  const [entregas, setEntregas] = useState(ENTREGAS_DEMO);

  const cambiarEstado = (id: number, estado: EstadoPedido) =>
    setEntregas(prev => prev.map(e => e.id === id ? { ...e, estado } : e));

  const pendientes  = entregas.filter(e => e.estado !== "entregado").length;
  const enCamino    = entregas.filter(e => e.estado === "en_camino").length;
  const entregados  = entregas.filter(e => e.estado === "entregado").length;
  const ganancias   = entregas.filter(e => e.estado === "entregado").reduce((a,b) => a + b.total * 0.1, 0);

  const formatHora = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel del Domiciliario</h1>
          <p className="text-sm text-gray-500">Domingo, 7 de septiembre de 2026</p>
        </div>
        <button onClick={() => navegar("inicio")} className="text-sm text-gray-500 hover:text-green-600 hover:underline">
          ← Ir al inicio
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label:"Pendientes",  valor: pendientes, color:"text-yellow-600" },
          { label:"En camino",   valor: enCamino,   color:"text-orange-600" },
          { label:"Entregados",  valor: entregados, color:"text-green-600"  },
          { label:"Ganancias",   valor: `$${Math.round(ganancias).toLocaleString("es-CO")}`, color:"text-green-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.valor}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mapa simulado */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-5">
        <div className="relative h-40">
          <img
            src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=300&fit=crop&auto=format"
            alt="Mapa de la ciudad"
            className="w-full h-full object-cover opacity-70"
            onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=300&fit=crop&auto=format"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4 text-white">
            <p className="font-bold text-sm">📍 Tu ubicación actual</p>
            <p className="text-xs text-white/80">{enCamino} entrega{enCamino !== 1 ? "s" : ""} activa{enCamino !== 1 ? "s" : ""} en ruta</p>
          </div>
          <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            🟢 En línea
          </div>
        </div>
      </div>

      {/* Lista de entregas */}
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Entregas del día</h2>
      <div className="space-y-4">
        {entregas.map(e => {
          const yaEntregado = e.estado === "entregado";
          return (
            <div key={e.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${
              yaEntregado ? "border-green-200" : "border-gray-200"
            }`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">Pedido #{e.id}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COLOR_ESTADO[e.estado]}`}>
                      {ETIQUETAS_ESTADO[e.estado]}
                    </span>
                    <span className="text-xs text-gray-400">{formatHora(e.created_at)}</span>
                  </div>
                  <p className="font-bold text-green-600">${e.total.toLocaleString("es-CO")}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1 text-sm">
                  <p className="text-gray-700">👤 <span className="font-medium">{e.cliente_nombre}</span></p>
                  <p className="text-gray-600">📍 {e.direccion_entrega}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {e.items.map(i => `${i.nombre_producto} ×${i.cantidad}`).join(" · ")}
                  </p>
                </div>

                {yaEntregado ? (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                      <span className="text-xl">✅</span> Entrega completada
                    </span>
                    <span className="text-xs text-gray-400 bg-green-50 px-3 py-1 rounded-full">
                      +${Math.round(e.total * 0.1).toLocaleString("es-CO")} de comisión
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {e.estado === "preparando" && (
                      <button onClick={() => cambiarEstado(e.id, "en_camino")}
                        className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-1">
                        🛵 Aceptar y salir a entregar
                      </button>
                    )}
                    {e.estado === "en_camino" && (
                      <>
                        <span className="text-sm text-orange-600 font-semibold flex items-center gap-1 bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl">
                          🛵 En camino al cliente
                        </span>
                        <button onClick={() => cambiarEstado(e.id, "entregado")}
                          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                          ✓ Confirmar entrega
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
