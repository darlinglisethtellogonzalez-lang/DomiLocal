import type { Screen } from "../App";
import type { EstadoPedido } from "../services/api";
import { ETIQUETAS_ESTADO } from "../services/api";

const PASOS: EstadoPedido[] = ["recibido", "preparando", "en_camino", "entregado"];

const PEDIDO_DEMO = {
  id: 1, cliente_id: 1, cliente_nombre: "Juan Pérez", domiciliario_id: 2,
  estado: "en_camino" as EstadoPedido, total: 24000,
  direccion_entrega: "Cra 10 #20-30, Barrio Centro",
  created_at: "2026-09-05T14:30:00",
  items: [
    { producto_id: 1, cantidad: 1, precio_unitario: 18000, nombre_producto: "Hamburguesa Clásica",
      imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop&auto=format" },
    { producto_id: 2, cantidad: 1, precio_unitario: 6000,  nombre_producto: "Jugo Natural de Mora",
      imagen: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=80&h=80&fit=crop&auto=format" },
  ],
};

const PASO_HORA: Record<EstadoPedido, string> = {
  recibido:  "2026-09-05T14:30:00",
  preparando:"2026-09-05T14:35:00",
  en_camino: "2026-09-05T14:55:00",
  entregado: "",
  cancelado: "",
};

interface Props {
  pedidoId: number | null;
  navegar: (s: Screen) => void;
}

export default function DetallePedidoScreen({ navegar }: Props) {
  const pedido = PEDIDO_DEMO;
  const pasoActual = PASOS.indexOf(pedido.estado);

  const formatHora = (iso: string) =>
    iso ? new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "";

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-CO", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navegar("mis-pedidos")}
        className="text-green-600 text-sm hover:underline mb-5 flex items-center gap-1">
        ← Volver a mis pedidos
      </button>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedido #{pedido.id}</h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{formatFecha(pedido.created_at)}</p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
          pedido.estado === "entregado" ? "bg-green-100 text-green-700" :
          pedido.estado === "en_camino" ? "bg-orange-100 text-orange-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {ETIQUETAS_ESTADO[pedido.estado]}
        </span>
      </div>

      {/* Seguimiento visual */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        <h2 className="font-bold text-gray-800 mb-6">Seguimiento en tiempo real</h2>
        <div className="space-y-0">
          {PASOS.map((paso, i) => {
            const completado = i <= pasoActual;
            const esActual   = i === pasoActual;
            const hora = PASO_HORA[paso];
            return (
              <div key={paso} className="flex gap-4">
                {/* Línea + circulo */}
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 z-10 border-2 transition-all ${
                    completado
                      ? "bg-green-600 border-green-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}>
                    {completado ? "✓" : i + 1}
                  </div>
                  {i < PASOS.length - 1 && (
                    <div className={`w-0.5 flex-1 my-1 min-h-[28px] ${completado ? "bg-green-500" : "bg-gray-200"}`} />
                  )}
                </div>
                {/* Texto */}
                <div className="pb-5 pt-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-semibold text-sm ${esActual ? "text-green-700" : completado ? "text-gray-700" : "text-gray-400"}`}>
                      {ETIQUETAS_ESTADO[paso]}
                    </p>
                    {esActual && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium animate-pulse">
                        ● En curso
                      </span>
                    )}
                  </div>
                  {completado && hora && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatHora(hora)}</p>
                  )}
                  {esActual && paso === "en_camino" && (
                    <p className="text-xs text-orange-600 mt-1">🛵 Tu domiciliario está en camino</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info de entrega y resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">Entrega</h2>
          <p className="text-sm text-gray-600 mb-1">📍 {pedido.direccion_entrega}</p>
          <p className="text-sm text-gray-600 mb-1">👤 {pedido.cliente_nombre}</p>
          {pedido.domiciliario_id && (
            <p className="text-sm text-gray-600">🛵 Domiciliario #D{pedido.domiciliario_id} asignado</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">Resumen</h2>
          <p className="text-sm text-gray-600 mb-1">Productos: {pedido.items.length}</p>
          <p className="text-sm text-gray-600 mb-1">Fecha: {new Date(pedido.created_at).toLocaleDateString("es-CO")}</p>
          <p className="text-lg font-bold text-green-600 mt-2">
            Total: ${pedido.total.toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      {/* Productos con imágenes */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm">Productos del pedido</h2>
        </div>
        {pedido.items.map(item => (
          <div key={item.producto_id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
            <img
              src={item.imagen}
              alt={item.nombre_producto}
              className="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0"
              onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop&auto=format"; }}
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">{item.nombre_producto}</p>
              <p className="text-xs text-gray-400">Cantidad: {item.cantidad}</p>
            </div>
            <p className="font-bold text-gray-800">
              ${(item.precio_unitario * item.cantidad).toLocaleString("es-CO")}
            </p>
          </div>
        ))}
        <div className="px-5 py-4 bg-gray-50 flex justify-between">
          <span className="font-bold text-gray-800">Total</span>
          <span className="font-bold text-green-600 text-lg">${pedido.total.toLocaleString("es-CO")}</span>
        </div>
      </div>
    </div>
  );
}
