
import { useCallback, useEffect, useState } from "react";
import type { Screen } from "../App";
import {
  pedidosAPI,
  productosAPI,
  type PedidoNegocio,
  type EstadoPedido,
  type Producto,
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

const CATEGORIAS = [
  "Comidas",
  "Bebidas",
  "Aperitivos",
  "Postres",
  "Otros",
];

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

const FORMULARIO_VACIO = {
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: "Comidas",
  imagen_url: "",
  disponible: true,
};

export default function PanelNegocioScreen({ navegar }: Props) {
  const [tab, setTab] = useState<Tab>("pedidos");

  const [pedidos, setPedidos] = useState<PedidoNegocio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const [nombreNegocio, setNombreNegocio] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [pedidoActualizando, setPedidoActualizando] =
    useState<number | null>(null);

  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [productoEditando, setProductoEditando] =
    useState<number | null>(null);
  const [guardandoProducto, setGuardandoProducto] = useState(false);

  // ========================================================
  // PEDIDOS
  // ========================================================

  const cargarPedidos = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await pedidosAPI.delNegocio();

      if (!respuesta || !Array.isArray(respuesta.pedidos)) {
        throw new Error("El servidor devolvió una respuesta inválida.");
      }

      setPedidos(respuesta.pedidos);
      setNombreNegocio(respuesta.negocio || "Mi negocio");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los pedidos."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  // ========================================================
  // PRODUCTOS
  // ========================================================

  const cargarProductos = useCallback(async () => {
    try {
      setCargandoProductos(true);
      setError("");

      const respuesta = await productosAPI.misProductos();
      setProductos(respuesta);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los productos."
      );
    } finally {
      setCargandoProductos(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  useEffect(() => {
    if (tab === "productos") {
      cargarProductos();
    }
  }, [tab, cargarProductos]);

  // ========================================================
  // CAMBIAR ESTADO DE PEDIDO
  // ========================================================

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
        `El pedido #${pedidoId} ahora está en estado: ${ETIQUETAS[nuevoEstado]}.`
      );

      await cargarPedidos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el pedido."
      );
    } finally {
      setPedidoActualizando(null);
    }
  };

  // ========================================================
  // FORMULARIO DE PRODUCTOS
  // ========================================================

  const cambiarCampo = (
    campo: keyof typeof FORMULARIO_VACIO,
    valor: string | boolean
  ) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const limpiarFormulario = () => {
    setFormulario(FORMULARIO_VACIO);
    setProductoEditando(null);
  };

  const guardarProducto = async (
    evento: React.FormEvent<HTMLFormElement>
  ) => {
    evento.preventDefault();

    const precio = Number(formulario.precio);

    if (!formulario.nombre.trim()) {
      setError("Escribe el nombre del producto.");
      return;
    }

    if (!Number.isFinite(precio) || precio <= 0) {
      setError("Ingresa un precio válido mayor que cero.");
      return;
    }

    try {
      setGuardandoProducto(true);
      setError("");
      setMensaje("");

      const datos = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim(),
        precio,
        categoria: formulario.categoria,
        imagen_url: formulario.imagen_url.trim(),
        disponible: formulario.disponible,
      };

      if (productoEditando !== null) {
        await productosAPI.editar(productoEditando, datos);
        setMensaje("Producto actualizado correctamente.");
      } else {
        await productosAPI.crear({
          ...datos,
          negocio_id: 0,
        });
        setMensaje("Producto agregado correctamente.");
      }

      limpiarFormulario();
      await cargarProductos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el producto."
      );
    } finally {
      setGuardandoProducto(false);
    }
  };

  // ========================================================
  // CARGAR PRODUCTO PARA EDITAR
  // ========================================================

  const editarProducto = (producto: Producto) => {
    setProductoEditando(producto.id);

    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: String(producto.precio),
      categoria: producto.categoria || "Comidas",
      imagen_url: producto.imagen_url || "",
      disponible: producto.disponible,
    });

    setError("");
    setMensaje("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ========================================================
  // ELIMINAR PRODUCTO
  // ========================================================

  const eliminarProducto = async (producto: Producto) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${producto.nombre}"?`
    );

    if (!confirmar) return;

    try {
      setError("");
      setMensaje("");

      await productosAPI.eliminar(producto.id);

      setMensaje("Producto eliminado correctamente.");

      if (productoEditando === producto.id) {
        limpiarFormulario();
      }

      await cargarProductos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el producto."
      );
    }
  };

  // ========================================================
  // DISPONIBILIDAD
  // ========================================================

  const cambiarDisponibilidad = async (producto: Producto) => {
    try {
      setError("");
      setMensaje("");

      await productosAPI.editar(producto.id, {
        disponible: !producto.disponible,
      });

      setMensaje(
        producto.disponible
          ? "Producto marcado como no disponible."
          : "Producto publicado en el catálogo."
      );

      await cargarProductos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar la disponibilidad."
      );
    }
  };

  // ========================================================
  // RESUMEN ECONÓMICO
  // ========================================================

  const pedidosActivos = pedidos.filter(
    (pedido) => pedido.estado !== "cancelado"
  );

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

  // ========================================================
  // INTERFAZ
  // ========================================================

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

      {/* MENSAJES */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm">
          {mensaje}
        </div>
      )}

      {/* ESTADÍSTICAS */}

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

      {/* ================================================== */}
      {/* PESTAÑA PEDIDOS */}
      {/* ================================================== */}

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

          {cargando && (
            <p className="text-center py-10 text-gray-500">
              Cargando pedidos...
            </p>
          )}

          {!cargando && pedidos.length === 0 && (
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

                  <p className="text-sm text-gray-600 mb-1">
                    👤 Cliente #{pedido.cliente_id}
                  </p>

                  <p className="text-sm text-gray-500 mb-4">
                    📍 {pedido.direccion_entrega}
                  </p>

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

                  {pedido.domiciliario_id && (
                    <p className="text-xs text-gray-500 mt-3">
                      🛵 Domiciliario asignado: #{pedido.domiciliario_id}
                    </p>
                  )}

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
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 disabled:opacity-50"
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

      {/* ================================================== */}
      {/* PESTAÑA PRODUCTOS */}
      {/* ================================================== */}

      {tab === "productos" && (
        <div className="space-y-6">

          {/* FORMULARIO */}

          <form
            onSubmit={guardarProducto}
            className="bg-white border rounded-2xl p-5 shadow-sm space-y-4"
          >
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {productoEditando !== null
                  ? "Editar producto"
                  : "Agregar producto"}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Administra los productos que verán tus clientes.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nombre del producto *
              </label>
              <input
                required
                maxLength={100}
                value={formulario.nombre}
                onChange={(e) =>
                  cambiarCampo("nombre", e.target.value)
                }
                placeholder="Ejemplo: Hamburguesa especial"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formulario.descripcion}
                onChange={(e) =>
                  cambiarCampo("descripcion", e.target.value)
                }
                placeholder="Describe tu producto..."
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Precio en pesos *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={formulario.precio}
                  onChange={(e) =>
                    cambiarCampo("precio", e.target.value)
                  }
                  placeholder="15000"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={formulario.categoria}
                  onChange={(e) =>
                    cambiarCampo("categoria", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-green-500"
                >
                  {CATEGORIAS.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                URL de la imagen
              </label>
              <input
                type="url"
                value={formulario.imagen_url}
                onChange={(e) =>
                  cambiarCampo("imagen_url", e.target.value)
                }
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Pega el enlace público de una imagen.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formulario.disponible}
                onChange={(e) =>
                  cambiarCampo("disponible", e.target.checked)
                }
                className="w-4 h-4 accent-green-600"
              />
              Producto disponible para los clientes
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={guardandoProducto}
                className="bg-green-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-green-700 disabled:opacity-50"
              >
                {guardandoProducto
                  ? "Guardando..."
                  : productoEditando !== null
                    ? "Guardar cambios"
                    : "Agregar producto"}
              </button>

              {productoEditando !== null && (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="bg-gray-100 text-gray-700 font-semibold px-5 py-3 rounded-xl hover:bg-gray-200"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          {/* LISTA DE PRODUCTOS */}

          <section>
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h2 className="text-lg font-bold text-gray-800">
                Mis productos ({productos.length})
              </h2>

              <button
                onClick={cargarProductos}
                disabled={cargandoProductos}
                className="text-sm font-semibold text-green-600 disabled:opacity-50"
              >
                {cargandoProductos ? "Cargando..." : "↻ Actualizar"}
              </button>
            </div>

            {cargandoProductos ? (
              <div className="bg-white border rounded-2xl p-8 text-center text-gray-500">
                Cargando productos...
              </div>
            ) : productos.length === 0 ? (
              <div className="bg-white border rounded-2xl p-8 text-center">
                <p className="text-4xl mb-3">🍔</p>
                <p className="font-bold text-gray-700">
                  Todavía no tienes productos
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Utiliza el formulario para agregar tu primer producto.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {productos.map((producto) => (
                  <article
                    key={producto.id}
                    className="bg-white border rounded-2xl overflow-hidden shadow-sm"
                  >
                    {producto.imagen_url ? (
                      <img
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        className="w-full h-44 object-cover"
                      />
                    ) : (
                      <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-5xl">
                        🍽️
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-800">
                          {producto.nombre}
                        </h3>

                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            producto.disponible
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {producto.disponible
                            ? "Disponible"
                            : "No disponible"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mt-1">
                        {producto.categoria}
                      </p>

                      {producto.descripcion && (
                        <p className="text-sm text-gray-600 mt-2">
                          {producto.descripcion}
                        </p>
                      )}

                      <p className="text-xl font-bold text-green-600 mt-3">
                        {dinero(producto.precio)}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => editarProducto(producto)}
                          className="flex-1 bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-blue-100"
                        >
                          ✏️ Editar
                        </button>

                        <button
                          onClick={() =>
                            cambiarDisponibilidad(producto)
                          }
                          className="flex-1 bg-orange-50 text-orange-700 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-orange-100"
                        >
                          {producto.disponible
                            ? "Ocultar"
                            : "Publicar"}
                        </button>

                        <button
                          onClick={() => eliminarProducto(producto)}
                          className="bg-red-50 text-red-700 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-red-100"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ================================================== */}
      {/* PESTAÑA ESTADÍSTICAS */}
      {/* ================================================== */}

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

