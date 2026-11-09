

import { useEffect, useState } from "react";
import type { Screen } from "../App";
import type { Pedido, EstadoPedido } from "../services/api";
import { ETIQUETAS_ESTADO, pedidosAPI } from "../services/api";

const PASOS: EstadoPedido[] = [
  "pendiente",
  "recibido",
  "preparando",
  "en_camino",
  "entregado",
];

interface Props {
  pedidoId: number | null;
  navegar: (s: Screen) => void;
}

export default function DetallePedidoScreen({
  pedidoId,
  navegar,
}: Props) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarDetalle() {
      if (!pedidoId) {
        setError("No se seleccionó ningún pedido.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const respuesta = await pedidosAPI.obtener(pedidoId);

        if (activo) {
          setPedido(respuesta);
        }
      } catch (err) {
        console.error("Error al consultar el pedido:", err);

        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "No fue posible cargar el detalle del pedido."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarDetalle();

    return () => {
      activo = false;
    };
  }, [pedidoId]);

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (cargando) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">⏳</p>
        <p className="text-gray-600">Cargando detalle del pedido...</p>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="font-bold text-gray-800 mb-2">
          No pudimos cargar el pedido
        </p>
        <p className="text-sm text-red-500 mb-5">
          {error || "Pedido no encontrado."}
        </p>
        <button
          onClick={() => navegar("mis-pedidos")}
          className="text-green-600 underline"
        >
          Volver a mis pedidos
        </button>
      </div>
    );
  }

  const pasoActual = PASOS.indexOf(pedido.estado);

  const estadoColor =
    pedido.estado === "entregado"
      ? "bg-green-100 text-green-700"
      : pedido.estado === "en_camino"
      ? "bg-orange-100 text-orange-700"
      : pedido.estado === "cancelado"
      ? "bg-red-100 text-red-600"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navegar("mis-pedidos")}
        className="text-green-600 text-sm hover:underline mb-5 flex items-center gap-1"
      >
        ← Volver a mis pedidos
      </button>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido #{pedido.id}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">
            {formatFecha(pedido.created_at)}
          </p>
        </div>

        <span
          className={`text-sm font-semibold px-3 py-1.5 rounded-full ${estadoColor}`}
        >
          {ETIQUETAS_ESTADO[pedido.estado]}
        </span>
      </div>

      {/* Seguimiento */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        <h2 className="font-bold text-gray-800 mb-6">
          Seguimiento de tu pedido
        </h2>

        {pedido.estado === "cancelado" ? (
          <p className="text-red-600 font-semibold">
            Este pedido fue cancelado.
          </p>
        ) : (
          <div className="space-y-0">
            {PASOS.map((paso, i) => {
              const completado = pasoActual >= 0 && i <= pasoActual;
              const esActual = i === pasoActual;

              return (
                <div key={paso} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 z-10 border-2 ${
                        completado
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {completado ? "✓" : i + 1}
                    </div>

                    {i < PASOS.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 my-1 min-h-[28px] ${
                          completado ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>

                  <div className="pb-5 pt-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`font-semibold text-sm ${
                          esActual
                            ? "text-green-700"
                            : completado
                            ? "text-gray-700"
                            : "text-gray-400"
                        }`}
                      >
                        {ETIQUETAS_ESTADO[paso]}
                      </p>

                      {esActual && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium animate-pulse">
                          ● En curso
                        </span>
                      )}
                    </div>

                    {esActual && paso === "pendiente" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Tu pedido está esperando confirmación del negocio.
                      </p>
                    )}

                    {esActual && paso === "preparando" && (
                      <p className="text-xs text-yellow-600 mt-1">
                        🍳 El negocio está preparando tu pedido.
                      </p>
                    )}

                    {esActual && paso === "en_camino" && (
                      <p className="text-xs text-orange-600 mt-1">
                        🛵 Tu domiciliario está en camino.
                      </p>
                    )}

                    {esActual && paso === "entregado" && (
                      <p className="text-xs text-green-600 mt-1">
                        ¡Tu pedido fue entregado!
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Información de entrega */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">
            Entrega
          </h2>

          <p className="text-sm text-gray-600 mb-2">
            📍 {pedido.direccion_entrega}
          </p>

          <p className="text-sm text-gray-600 mb-2">
            👤 {pedido.cliente_nombre}
          </p>

          {pedido.estado === "cancelado" ? (
            <p className="text-sm text-red-600 font-medium">
              ❌ Pedido cancelado.
            </p>
          ) : pedido.estado === "entregado" ? (
            <p className="text-sm text-green-600 font-medium">
              ✅ Domicilio completado. ¡Tu pedido fue entregado!
            </p>
          ) : pedido.domiciliario_id ? (
            <p className="text-sm text-gray-600">
              🛵 Domiciliario #{pedido.domiciliario_id} asignado
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              ⏳ Esperando domiciliario
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">
            Resumen
          </h2>

          <p className="text-sm text-gray-600 mb-1">
            Productos: {pedido.items.length}
          </p>

          <p className="text-sm text-gray-600 mb-1">
            Fecha: {new Date(pedido.created_at).toLocaleDateString("es-CO")}
          </p>

          <p className="text-lg font-bold text-green-600 mt-2">
            Total: ${Number(pedido.total).toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm">
            Productos del pedido
          </h2>
        </div>

        {pedido.items.map((item, index) => (
          <div
            key={`${item.producto_id}-${index}`}
            className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0"
          >
            <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center text-2xl flex-shrink-0">
              🍔
            </div>

            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">
                {item.nombre_producto}
              </p>
              <p className="text-xs text-gray-400">
                Cantidad: {item.cantidad}
              </p>
            </div>

            <p className="font-bold text-gray-800">
              ${(Number(item.precio_unitario) * item.cantidad).toLocaleString("es-CO")}
            </p>
          </div>
        ))}

        <div className="px-5 py-4 bg-gray-50 flex justify-between">
          <span className="font-bold text-gray-800">Total</span>
          <span className="font-bold text-green-600 text-lg">
            ${Number(pedido.total).toLocaleString("es-CO")}
          </span>
        </div>
      </div>
    </div>
  );
}
