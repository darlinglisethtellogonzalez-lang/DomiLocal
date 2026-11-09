
import { useEffect, useState } from "react";
import type { Screen } from "../App";
import type { Pedido, EstadoPedido } from "../services/api";
import { ETIQUETAS_ESTADO, pedidosAPI } from "../services/api";

const COLORES: Record<EstadoPedido, string> = {
  pendiente: "bg-gray-100 text-gray-700",
  recibido: "bg-blue-100 text-blue-700",
  preparando: "bg-yellow-100 text-yellow-700",
  en_camino: "bg-orange-100 text-orange-700",
  entregado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-600",
};

const ICONOS: Record<EstadoPedido, string> = {
  pendiente: "⏳",
  recibido: "📋",
  preparando: "🍳",
  en_camino: "🛵",
  entregado: "✅",
  cancelado: "❌",
};

interface Props {
  navegar: (s: Screen, extra?: { pedidoId?: number }) => void;
}

export default function MisPedidosScreen({ navegar }: Props) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarPedidos() {
      try {
        setCargando(true);
        setError("");

        const respuesta = await pedidosAPI.misPedidos();

        if (activo) {
          setPedidos(respuesta);
        }
      } catch (err) {
        console.error("Error al cargar mis pedidos:", err);

        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "No fue posible cargar tus pedidos."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarPedidos();

    return () => {
      activo = false;
    };
  }, []);

  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const activos = pedidos.filter(
    (p) => p.estado !== "entregado" && p.estado !== "cancelado"
  );

  const historial = pedidos.filter(
    (p) => p.estado === "entregado" || p.estado === "cancelado"
  );

  if (cargando) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">⏳</p>
        <p className="text-gray-600 font-medium">
          Cargando tus pedidos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <h2 className="font-bold text-gray-800 mb-2">
          No pudimos cargar tus pedidos
        </h2>
        <p className="text-sm text-red-500 mb-5">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          Volver a intentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Mis pedidos
        </h1>

        <span className="text-sm text-gray-400">
          {pedidos.length} pedidos en total
        </span>
      </div>

      {activos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
            En curso
          </h2>

          <div className="space-y-3">
            {activos.map((pedido) => (
              <TarjetaPedido
                key={pedido.id}
                pedido={pedido}
                navegar={navegar}
                formatearFecha={formatearFecha}
              />
            ))}
          </div>
        </div>
      )}

      {historial.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
            Historial
          </h2>

          <div className="space-y-3">
            {historial.map((pedido) => (
              <TarjetaPedido
                key={pedido.id}
                pedido={pedido}
                navegar={navegar}
                formatearFecha={formatearFecha}
              />
            ))}
          </div>
        </div>
      )}

      {pedidos.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">📋</p>
          <p className="font-medium">Aún no tienes pedidos</p>

          <button
            onClick={() => navegar("productos")}
            className="mt-4 text-green-600 underline text-sm"
          >
            Hacer mi primer pedido
          </button>
        </div>
      )}
    </div>
  );
}

function TarjetaPedido({
  pedido,
  navegar,
  formatearFecha,
}: {
  pedido: Pedido;
  navegar: (s: Screen, extra?: { pedidoId?: number }) => void;
  formatearFecha: (iso: string) => string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg">
              {ICONOS[pedido.estado]}
            </span>

            <p className="font-bold text-gray-900">
              Pedido #{pedido.id}
            </p>

            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COLORES[pedido.estado]}`}
            >
              {ETIQUETAS_ESTADO[pedido.estado]}
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-1">
            {formatearFecha(pedido.created_at)}
          </p>

          <p className="text-xs text-gray-500">
            📍 {pedido.direccion_entrega}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-green-600">
            ${Number(pedido.total).toLocaleString("es-CO")}
          </p>

          <p className="text-xs text-gray-400">
            {pedido.items.length} producto
            {pedido.items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-3 flex flex-wrap gap-2">
        {pedido.items.map((item, index) => (
          <span
            key={`${item.producto_id}-${index}`}
            className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full"
          >
            {item.nombre_producto} ×{item.cantidad}
          </span>
        ))}
      </div>

      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {pedido.estado === "entregado" ? (
            <span className="text-green-600 font-medium">
              ✅ Domicilio completado
            </span>
          ) : pedido.estado === "cancelado" ? (
            <span className="text-red-600 font-medium">
              ❌ Pedido cancelado
            </span>
          ) : pedido.domiciliario_id ? (
            "🛵 Domiciliario asignado"
          ) : (
            "⏳ Esperando domiciliario"
          )}
        </span>

        <button
          onClick={() =>
            navegar("detalle-pedido", { pedidoId: pedido.id })
          }
          className="text-sm font-semibold text-green-600 hover:underline"
        >
          Ver detalles →
        </button>
      </div>
    </div>
  );
}

