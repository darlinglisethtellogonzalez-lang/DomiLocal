
import { useCallback, useEffect, useState } from "react";
import type { Screen } from "../App";
import {
  pedidosAPI,
  type PedidoNegocio,
  type EstadoPedido,
} from "../services/api";

interface Props {
  navegar: (s: Screen) => void;
}

type Tab = "pedidos" | "productos" | "estadisticas";

const COMISION = 3000;

const ETIQUETAS: Record<string, string> = {
  pendiente: "Pendiente",
  recibido: "Recibido",
  preparando: "Preparando",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const COLORES: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  recibido: "bg-blue-100 text-blue-700",
  preparando: "bg-orange-100 text-orange-700",
  en_camino: "bg-purple-100 text-purple-700",
  entregado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
};

const ICONOS: Record<string, string> = {
  pendiente: "⏳",
  recibido: "📋",
  preparando: "🍳",
  en_camino: "🛵",
  entregado: "✅",
  cancelado: "❌",
};

const dinero = (valor: number) =>
  `$${Number(valor || 0).toLocaleString("es-CO")}`;

const formatFecha = (fecha: string) => {
  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return "Fecha no disponible";
  }

  return fechaValida.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

// Determina el siguiente estado permitido.
const SIGUIENTE_ESTADO: Partial<
  Record<EstadoPedido, EstadoPedido>
> = {
  pendiente: "recibido",
  recibido: "preparando",
  preparando: "en_camino",
  en_camino: "entregado",
};

const BOTONES_ESTADO: Partial<
  Record<EstadoPedido, string>
> = {
  pendiente: "Aceptar pedido",
  recibido: "Comenzar preparación",
  preparando: "Enviar pedido",
  en_camino: "Marcar como entregado",
};

export default function PanelNegocioScreen({ navegar }: Props) {
  const [tab, setTab] = useState<Tab>("pedidos");
  const [pedidos, setPedidos] = useState<PedidoNegocio[]>([]);
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pedidoActualizando, setPedidoActualizando] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");

  const cargarPedidos = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await pedidosAPI.delNegocio();

      if (!respuesta || !Array.isArray(respuesta.pedidos)) {
        throw new Error(
          "El servidor devolvió una respuesta de pedidos inválida."
        );
      }

      setPedidos(respuesta.pedidos);
      setNombreNegocio(respuesta.negocio || "Mi negocio");
    } catch (err) {
      console.error("ERROR AL CARGAR PEDIDOS:", err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los pedidos."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  // Cambiar estado de un pedido.
  const actualizarEstado = async (
    pedidoId: number,
    nuevoEstado: EstadoPedido
  ) => {
    try {
      setPedidoActualizando(pedidoId);
      setMensaje("");
      setError("");

      await pedidosAPI.cambiarEstado(pedidoId, nuevoEstado);

      setMensaje(
        `El pedido #${pedidoId} ahora está en estado: ${
          ETIQUETAS[nuevoEstado]
        }.`
      );

      await cargarPedidos();
    } catch (err) {
      console.error("ERROR AL ACTUALIZAR ESTADO:", err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado del pedido."
      );
    } finally {
      setPedidoActualizando(null);
    }
  };

  // Pedidos que no están cancelados.
  const pedidosActivos = pedidos.filter(
    (pedido) => pedido.estado !== "cancelado"
  );

  // Resumen económico.
  const totalProductos = pedidosActivos.reduce(
    (suma, pedido) =>
      suma + Number(pedido.total_productos || 0),
    0
  );

  const totalComisiones = pedidosActivos.reduce(
    (suma, pedido) =>
      suma + Number(pedido.comision_domilocal ?? COMISION),
    0
  );

  const netoNegocio = pedidosActivos.reduce(
    (suma, pedido) =>
      suma +
      Number(
        pedido.neto_negocio ??
          (Number(pedido.total_productos || 0) -
            Number(pedido.comision_domilocal ?? COMISION))
      ),
    0
  );

  // Estadísticas de pedidos.
  const stats = {
    total: pedidos.length,

    nuevos: pedidos.filter(
      (pedido) =>
        pedido.estado === "pendiente" ||
        pedido.estado === "recibido"
    ).length,

    preparando: pedidos.filter(
      (pedido) => pedido.estado === "preparando"
    ).length,

    entregados: pedidos.filter(
      (pedido) => pedido.estado === "entregado"
    ).length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ENCABEZADO */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Panel del Negocio
          </h1>

          <p className="text-sm text-gray-500">
            {nombreNegocio || "Mi negocio"}
          </p>
        </div>

        <button
          onClick={() => navegar("inicio")}
          className="text-sm text-gray-500 hover:text-green-600"
        >
          ← Ir al inicio
        </button>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total pedidos", valor: stats.total },
          { label: "Nuevos", valor: stats.nuevos },
          { label: "En preparación", valor: stats.preparando },
          { label: "Entregados", valor: stats.entregados },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-2xl border p-4 text-center shadow-sm"
          >
            <p className="text-2xl font-bold text-gray-800">
              {item.valor}
            </p>

            <p className="text-xs text-gray-500">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* RESUMEN ECONÓMICO */}
      <div className="bg-white rounded-2xl border p-5 mb-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4">
          Resumen de ganancias
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Ventas de productos
            </p>

            <p className="text-xl font-bold text-gray-800">
              {dinero(totalProductos)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Comisión DomiLocal
            </p>

            <p className="text-xl font-bold text-orange-600">
              {dinero(totalComisiones)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Neto estimado del negocio
            </p>

            <p className="text-xl font-bold text-green-600">
              {dinero(netoNegocio)}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Comisión de DomiLocal: {dinero(COMISION)} por pedido.
          Los pedidos cancelados no se incluyen.
          El domicilio todavía no está incluido.
        </p>
      </div>

      {/* PESTAÑAS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["pedidos", "productos", "estadisticas"] as Tab[]).map(
          (t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border ${
                tab === t
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {t === "pedidos"
                ? "📋 Pedidos"
                : t === "productos"
                  ? "📦 Productos"
                  : "📊 Estadísticas"}
            </button>
          )
        )}
      </div>

      {/* PESTAÑA PEDIDOS */}
      {tab === "pedidos" && (
        <div className="space-y-4">

          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-800">
              Pedidos recibidos
            </h2>

            <button
              onClick={cargarPedidos}
              disabled={cargando || pedidoActualizando !== null}
              className="text-sm text-green-600 font-semibold disabled:opacity-50"
            >
              {cargando ? "Cargando..." : "↻ Actualizar"}
            </button>
          </div>

          {mensaje && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 text-sm">
                ✅ {mensaje}
              </p>
            </div>
          )}

          {cargando && (
            <p className="text-center py-10 text-gray-500">
              Cargando pedidos...
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">
                {error}
              </p>

              <button
                onClick={cargarPedidos}
                className="text-red-700 font-bold text-sm mt-2"
              >
                Intentar nuevamente
              </button>
            </div>
          )}

          {!cargando && !error && pedidos.length === 0 && (
            <div className="bg-white border rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">📦</p>

              <p className="font-bold text-gray-700">
                Todavía no tienes pedidos
              </p>

              <p className="text-sm text-gray-500">
                Cuando un cliente realice un pedido, aparecerá aquí.
              </p>
            </div>
          )}

          {!cargando && pedidos.map((pedido) => {
            const siguienteEstado =
              SIGUIENTE_ESTADO[pedido.estado as EstadoPedido];

            const botonEstado =
              BOTONES_ESTADO[pedido.estado as EstadoPedido];

            const actualizando =
              pedidoActualizando === pedido.pedido_id;

            return (
              <div
                key={pedido.pedido_id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-5">

                  {/* ESTADO Y FECHA */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-lg">
                      {ICONOS[pedido.estado] || "📋"}
                    </span>

                    <span className="font-bold text-gray-900">
                      Pedido #{pedido.pedido_id}
                    </span>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        COLORES[pedido.estado] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ETIQUETAS[pedido.estado] || pedido.estado}
                    </span>

                    <span className="text-xs text-gray-400 ml-auto">
                      {formatFecha(pedido.fecha_pedido)}
                    </span>
                  </div>

                  {/* CLIENTE Y DIRECCIÓN */}
                  <p className="text-sm text-gray-600 mb-1">
                    👤 Cliente #{pedido.cliente_id}
                  </p>

                  <p className="text-sm text-gray-500 mb-4">
                    📍 {pedido.direccion_entrega}
                  </p>

                  {/* PRODUCTOS */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-sm font-bold text-gray-700 mb-2">
                      Productos solicitados
                    </p>

                    {pedido.productos.map((producto, index) => (
                      <div
                        key={`${producto.producto_id}-${index}`}
                        className="flex justify-between text-sm py-1 gap-3"
                      >
                        <span className="text-gray-600">
                          {producto.nombre} × {producto.cantidad}
                        </span>

                        <span className="font-semibold text-gray-800">
                          {dinero(producto.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* TOTALES */}
                  <div className="border-t border-gray-100 mt-4 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Total productos
                      </span>

                      <span className="font-semibold">
                        {dinero(pedido.total_productos)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Comisión DomiLocal
                      </span>

                      <span className="text-orange-600 font-semibold">
                        - {dinero(pedido.comision_domilocal)}
                      </span>
                    </div>

                    <div className="flex justify-between border-t pt-3">
                      <span className="font-bold text-gray-800">
                        Neto del negocio
                      </span>

                      <span className="text-lg font-bold text-green-600">
                        {dinero(pedido.neto_negocio)}
                      </span>
                    </div>
                  </div>

                  {/* DOMICILIARIO */}
                  {pedido.domiciliario_id && (
                    <p className="text-xs text-gray-500 mt-3">
                      🛵 Domiciliario asignado: #{pedido.domiciliario_id}
                    </p>
                  )}

                  {/* BOTÓN PARA AVANZAR ESTADO */}
                  {siguienteEstado && botonEstado && (
                    <div className="border-t border-gray-100 mt-4 pt-4">
                      <button
                        onClick={() =>
                          actualizarEstado(
                            pedido.pedido_id,
                            siguienteEstado
                          )
                        }
                        disabled={
                          pedidoActualizando !== null || cargando
                        }
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actualizando
                          ? "Actualizando..."
                          : botonEstado}
                      </button>
                    </div>
                  )}

                  {pedido.estado === "entregado" && (
                    <p className="text-sm text-green-700 font-semibold mt-4 border-t pt-4">
                      ✅ Este pedido ya fue entregado.
                    </p>
                  )}

                  {pedido.estado === "cancelado" && (
                    <p className="text-sm text-red-600 font-semibold mt-4 border-t pt-4">
                      Este pedido fue cancelado.
                    </p>
                  )}

                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* PESTAÑA PRODUCTOS */}
      {tab === "productos" && (
        <div className="bg-white border rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">📦</p>

          <h3 className="font-bold text-gray-800">
            Gestión de productos
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            Esta sección se conectará con la gestión de productos del backend.
          </p>
        </div>
      )}

      {/* PESTAÑA ESTADÍSTICAS */}
      {tab === "estadisticas" && (
        <div className="bg-white border rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">📊</p>

          <h3 className="font-bold text-gray-800">
            Estadísticas del negocio
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            Aquí mostraremos las estadísticas calculadas a partir de los pedidos reales.
          </p>
        </div>
      )}

    </div>
  );
}

