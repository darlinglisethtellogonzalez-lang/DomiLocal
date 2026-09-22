import type { Screen } from "../App";
import type { Pedido, EstadoPedido } from "../services/api";
import { ETIQUETAS_ESTADO } from "../services/api";

const PEDIDOS_DEMO: Pedido[] = [
  {
    id: 1, cliente_id: 1, cliente_nombre: "Juan Pérez", domiciliario_id: 2,
    estado: "en_camino", total: 24000, direccion_entrega: "Cra 10 #20-30, Barrio Centro",
    created_at: "2026-09-05T14:30:00",
    items: [
      { producto_id: 1, cantidad: 1, precio_unitario: 18000, nombre_producto: "Hamburguesa Clásica" },
      { producto_id: 2, cantidad: 1, precio_unitario: 6000,  nombre_producto: "Jugo Natural de Mora" },
    ],
  },
  {
    id: 2, cliente_id: 1, cliente_nombre: "Juan Pérez", domiciliario_id: null,
    estado: "preparando", total: 31000, direccion_entrega: "Cl 45 #12-15, Barrio Sur",
    created_at: "2026-09-06T09:00:00",
    items: [
      { producto_id: 5, cantidad: 1, precio_unitario: 22000, nombre_producto: "Pizza Margarita" },
      { producto_id: 3, cantidad: 1, precio_unitario: 8000,  nombre_producto: "Papas a la Francesa" },
      { producto_id: 6, cantidad: 1, precio_unitario: 1000,  nombre_producto: "Limonada Natural" },
    ],
  },
  {
    id: 3, cliente_id: 1, cliente_nombre: "Juan Pérez", domiciliario_id: 3,
    estado: "entregado", total: 13000, direccion_entrega: "Av 68 #30-20, Barrio Norte",
    created_at: "2026-09-01T18:00:00",
    items: [
      { producto_id: 4, cantidad: 1, precio_unitario: 5000, nombre_producto: "Galletas de Chocolate" },
      { producto_id: 8, cantidad: 1, precio_unitario: 7000, nombre_producto: "Helado de Vainilla" },
      { producto_id: 2, cantidad: 1, precio_unitario: 1000, nombre_producto: "Jugo Natural de Mora" },
    ],
  },
  {
    id: 4, cliente_id: 1, cliente_nombre: "Juan Pérez", domiciliario_id: 3,
    estado: "entregado", total: 9000, direccion_entrega: "Cra 15 #80-10, Chapinero",
    created_at: "2026-08-28T12:00:00",
    items: [
      { producto_id: 7, cantidad: 1, precio_unitario: 9000, nombre_producto: "Empanadas x3" },
    ],
  },
];

const COLORES: Record<EstadoPedido, string> = {
  recibido:  "bg-blue-100 text-blue-700",
  preparando:"bg-yellow-100 text-yellow-700",
  en_camino: "bg-orange-100 text-orange-700",
  entregado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-600",
};

const ICONOS: Record<EstadoPedido, string> = {
  recibido:  "📋",
  preparando:"🍳",
  en_camino: "🛵",
  entregado: "✅",
  cancelado: "❌",
};

interface Props { navegar: (s: Screen, extra?: { pedidoId?: number }) => void }

export default function MisPedidosScreen({ navegar }: Props) {
  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-CO", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const activos    = PEDIDOS_DEMO.filter(p => p.estado !== "entregado" && p.estado !== "cancelado");
  const historial  = PEDIDOS_DEMO.filter(p => p.estado === "entregado" || p.estado === "cancelado");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis pedidos</h1>
        <span className="text-sm text-gray-400">{PEDIDOS_DEMO.length} pedidos en total</span>
      </div>

      {/* Pedidos activos */}
      {activos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">En curso</h2>
          <div className="space-y-3">
            {activos.map(pedido => (
              <TarjetaPedido key={pedido.id} pedido={pedido} navegar={navegar}
                formatearFecha={formatearFecha} colores={COLORES} iconos={ICONOS} />
            ))}
          </div>
        </div>
      )}

      {/* Historial */}
      {historial.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Historial</h2>
          <div className="space-y-3">
            {historial.map(pedido => (
              <TarjetaPedido key={pedido.id} pedido={pedido} navegar={navegar}
                formatearFecha={formatearFecha} colores={COLORES} iconos={ICONOS} />
            ))}
          </div>
        </div>
      )}

      {PEDIDOS_DEMO.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">📋</p>
          <p className="font-medium">Aún no tienes pedidos</p>
          <button onClick={() => navegar("productos")} className="mt-4 text-green-600 underline text-sm">
            Hacer mi primer pedido
          </button>
        </div>
      )}
    </div>
  );
}

function TarjetaPedido({ pedido, navegar, formatearFecha, colores, iconos }: {
  pedido: Pedido;
  navegar: (s: Screen, extra?: { pedidoId?: number }) => void;
  formatearFecha: (iso: string) => string;
  colores: Record<EstadoPedido, string>;
  iconos: Record<EstadoPedido, string>;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg">{iconos[pedido.estado]}</span>
            <p className="font-bold text-gray-900">Pedido #{pedido.id}</p>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colores[pedido.estado]}`}>
              {ETIQUETAS_ESTADO[pedido.estado]}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-1">{formatearFecha(pedido.created_at)}</p>
          <p className="text-xs text-gray-500">📍 {pedido.direccion_entrega}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-green-600">${pedido.total.toLocaleString("es-CO")}</p>
          <p className="text-xs text-gray-400">{pedido.items.length} producto{pedido.items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-3 flex flex-wrap gap-2">
        {pedido.items.map(item => (
          <span key={item.producto_id} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
            {item.nombre_producto} ×{item.cantidad}
          </span>
        ))}
      </div>

      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {pedido.domiciliario_id ? "🛵 Domiciliario asignado" : "⏳ Esperando domiciliario"}
        </span>
        <button
          onClick={() => navegar("detalle-pedido", { pedidoId: pedido.id })}
          className="text-sm font-semibold text-green-600 hover:underline"
        >
          Ver detalles →
        </button>
      </div>
    </div>
  );
}
