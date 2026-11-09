
import { useCallback, useEffect, useState } from "react";
import type { Screen } from "../App";
import type { Pedido, EstadoPedido } from "../services/api";
import { ETIQUETAS_ESTADO } from "../services/api";

interface Props {
  navegar: (s: Screen) => void;
}

const API_URL = "http://localhost:8000";

const COLOR_ESTADO: Record<EstadoPedido, string> = {
  pendiente: "bg-gray-100 text-gray-700",
  recibido: "bg-blue-100 text-blue-700",
  preparando: "bg-yellow-100 text-yellow-700",
  en_camino: "bg-orange-100 text-orange-700",
  entregado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-600",
};

async function peticionDomiciliario<T>(
  ruta: string,
  metodo: "GET" | "PUT" = "GET"
): Promise<T> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Tu sesión ha terminado. Inicia sesión nuevamente.");
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!respuesta.ok) {
    let mensaje = "Ocurrió un error al consultar el servidor.";

    try {
      const datos = await respuesta.json();
      mensaje = datos.detail || mensaje;
    } catch {
      // Se conserva el mensaje predeterminado.
    }

    throw new Error(mensaje);
  }

  return respuesta.json() as Promise<T>;
}

function formatoFecha(fecha: string) {
  if (!fecha) return "Fecha no disponible";

  return new Date(fecha).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatoDinero(valor: number) {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

export default function PanelDomiciliarioScreen({ navegar }: Props) {
  const [entregas, setEntregas] = useState<Pedido[]>([]);
  const [disponibles, setDisponibles] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const [asignados, pendientes] = await Promise.all([
        peticionDomiciliario<Pedido[]>("/pedidos/domiciliario"),
        peticionDomiciliario<Pedido[]>(
          "/pedidos/domiciliario/disponibles"
        ),
      ]);

      setEntregas(asignados);
      setDisponibles(pendientes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las entregas."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const aceptarPedido = async (pedidoId: number) => {
    setProcesando(pedidoId);
    setError("");
    setMensaje("");

    try {
      await peticionDomiciliario(
        `/pedidos/${pedidoId}/asignar`,
        "PUT"
      );

      setMensaje(`¡Aceptaste el pedido #${pedidoId}!`);
      await cargarPedidos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo aceptar el pedido."
      );
    } finally {
      setProcesando(null);
    }
  };

  const confirmarEntrega = async (pedidoId: number) => {
    const confirmar = window.confirm(
      `¿Confirmas que el pedido #${pedidoId} fue entregado al cliente?`
    );

    if (!confirmar) return;

    setProcesando(pedidoId);
    setError("");
    setMensaje("");

    try {
      await peticionDomiciliario(
        `/pedidos/${pedidoId}/entrega`,
        "PUT"
      );

      setMensaje(`El pedido #${pedidoId} fue entregado correctamente.`);
      await cargarPedidos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo confirmar la entrega."
      );
    } finally {
      setProcesando(null);
    }
  };

  const enCamino = entregas.filter(
    (pedido) => pedido.estado === "en_camino"
  ).length;

  const entregados = entregas.filter(
    (pedido) => pedido.estado === "entregado"
  ).length;

  const totalEntregas = entregas.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* ENCABEZADO */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Panel del Domiciliario
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gestiona tus entregas de DomiLocal
          </p>
        </div>

        <button
          onClick={() => navegar("inicio")}
          className="text-sm text-gray-500 hover:text-green-600 hover:underline"
        >
          ← Ir al inicio
        </button>
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          <p className="font-semibold">No se pudo completar la operación</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {mensaje && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm">
          {mensaje}
        </div>
      )}

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">

        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-xl font-bold text-blue-600">
            {disponibles.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Disponibles
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-xl font-bold text-orange-600">
            {enCamino}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            En camino
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-xl font-bold text-green-600">
            {entregados}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Entregados
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-xl font-bold text-gray-800">
            {totalEntregas}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Mis pedidos
          </p>
        </div>

      </div>

      {/* ACTUALIZAR */}
      <div className="flex justify-end mb-5">
        <button
          onClick={cargarPedidos}
          disabled={cargando || procesando !== null}
          className="bg-white border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 disabled:opacity-50"
        >
          ↻ Actualizar pedidos
        </button>
      </div>

      {cargando ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-gray-500">
            Cargando tus pedidos...
          </p>
        </div>
      ) : (
        <>
          {/* PEDIDOS DISPONIBLES */}
          <section className="mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              Pedidos disponibles para entregar
            </h2>

            {disponibles.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <p className="text-3xl mb-2">🛵</p>
                <p className="font-semibold text-gray-700">
                  No hay pedidos disponibles
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Cuando un negocio prepare un pedido y lo marque en camino,
                  aparecerá aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disponibles.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden"
                  >
                    <div className="p-5">

                      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                        <span className="font-bold text-gray-900">
                          Pedido #{pedido.id}
                        </span>

                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COLOR_ESTADO[pedido.estado]}`}>
                          {ETIQUETAS_ESTADO[pedido.estado]}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2 text-sm">
                        <p className="text-gray-700">
                          👤 <strong>{pedido.cliente_nombre}</strong>
                        </p>

                        <p className="text-gray-600">
                          📍 {pedido.direccion_entrega}
                        </p>

                        <p className="text-gray-500">
                          📅 {formatoFecha(pedido.created_at)}
                        </p>

                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <p className="font-semibold text-gray-700 mb-1">
                            Productos:
                          </p>

                          {pedido.items.map((item, indice) => (
                            <p key={`${pedido.id}-${item.producto_id}-${indice}`} className="text-gray-600">
                              {item.nombre_producto} × {item.cantidad}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-xs text-gray-500">
                            Total de productos
                          </p>
                          <p className="font-bold text-gray-900">
                            {formatoDinero(pedido.total)}
                          </p>
                        </div>

                        <button
                          onClick={() => aceptarPedido(pedido.id)}
                          disabled={procesando !== null}
                          className="bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50"
                        >
                          {procesando === pedido.id
                            ? "Aceptando..."
                            : "🛵 Aceptar pedido"}
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* MIS ENTREGAS */}
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              Mis entregas
            </h2>

            {entregas.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <p className="text-gray-600 font-medium">
                  Todavía no tienes entregas asignadas.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Acepta un pedido disponible para comenzar.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {entregas.map((pedido) => {
                  const yaEntregado = pedido.estado === "entregado";

                  return (
                    <div
                      key={pedido.id}
                      className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${
                        yaEntregado
                          ? "border-green-200"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="p-5">

                        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900">
                              Pedido #{pedido.id}
                            </span>

                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COLOR_ESTADO[pedido.estado]}`}>
                              {ETIQUETAS_ESTADO[pedido.estado]}
                            </span>
                          </div>

                          <span className="font-bold text-green-600">
                            {formatoDinero(pedido.total)}
                          </span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2 text-sm">
                          <p className="text-gray-700">
                            👤 <strong>{pedido.cliente_nombre}</strong>
                          </p>

                          <p className="text-gray-600">
                            📍 {pedido.direccion_entrega}
                          </p>

                          <p className="text-gray-500">
                            📅 {formatoFecha(pedido.created_at)}
                          </p>

                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <p className="font-semibold text-gray-700 mb-1">
                              Productos:
                            </p>

                            {pedido.items.map((item, indice) => (
                              <p key={`${pedido.id}-${item.producto_id}-${indice}`} className="text-gray-600">
                                {item.nombre_producto} × {item.cantidad}
                              </p>
                            ))}
                          </div>
                        </div>

                        {yaEntregado ? (
                          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                            <span className="text-xl">✅</span>
                            Entrega completada
                          </div>
                        ) : pedido.estado === "en_camino" ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm text-orange-600 font-semibold bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl">
                              🛵 Pedido en camino
                            </span>

                            <button
                              onClick={() => confirmarEntrega(pedido.id)}
                              disabled={procesando !== null}
                              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                            >
                              {procesando === pedido.id
                                ? "Guardando..."
                                : "✓ Confirmar entrega"}
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Estado actual: {ETIQUETAS_ESTADO[pedido.estado]}
                          </p>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

    </div>
  );
}

