
import { useState } from "react";
import type { Screen } from "../App";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { pedidosAPI } from "../services/api";

interface Props {
  navegar: (s: Screen) => void;
}

export default function CarritoScreen({ navegar }: Props) {
  const { items, totalPrecio, cambiarCantidad, quitar, vaciar } = useCarrito();
  const { usuario } = useAuth();

  const [direccion, setDireccion] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [pedidoRealizado, setPedidoRealizado] = useState(false);
  const [error, setError] = useState("");

  const handleConfirmar = async () => {
    if (!usuario) {
      navegar("login");
      return;
    }

    if (!direccion.trim()) {
      setError("Escribe la dirección de entrega.");
      return;
    }

    if (items.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    setConfirmando(true);
    setError("");

    try {
      await pedidosAPI.crear({
        direccion_entrega: direccion.trim(),
        items: items.map(({ producto, cantidad }) => ({
          producto_id: producto.id,
          cantidad,
        })),
      });

      vaciar();
      setPedidoRealizado(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el pedido."
      );
    } finally {
      setConfirmando(false);
    }
  };

  if (pedidoRealizado) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🎉</div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Pedido realizado!
        </h2>

        <p className="text-gray-500 mb-8">
          Tu pedido fue registrado correctamente. Puedes seguir su estado
          en Mis pedidos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navegar("mis-pedidos")}
            className="bg-green-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            Ver mis pedidos
          </button>

          <button
            onClick={() => navegar("productos")}
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:border-green-400 transition-colors"
          >
            Seguir comprando
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Tu carrito está vacío
        </h2>

        <p className="text-gray-500 mb-6">
          Agrega productos para continuar con tu pedido.
        </p>

        <button
          onClick={() => navegar("productos")}
          className="bg-green-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
        >
          Ver productos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Mi carrito
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ producto, cantidad }) => (
            <div
              key={producto.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 items-center"
            >
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-20 h-20 rounded-xl object-cover bg-gray-100 flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">
                  {producto.nombre}
                </p>

                <p className="text-green-600 font-semibold text-sm mt-0.5">
                  ${producto.precio.toLocaleString("es-CO")}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                  {producto.categoria}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => cambiarCantidad(producto.id, -1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center font-bold"
                >
                  −
                </button>

                <span className="w-7 text-center font-bold text-gray-900">
                  {cantidad}
                </span>

                <button
                  onClick={() => cambiarCantidad(producto.id, 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center font-bold"
                >
                  +
                </button>

                <button
                  onClick={() => quitar(producto.id)}
                  className="ml-1 w-8 h-8 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                  title="Eliminar"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">
              Resumen del pedido
            </h2>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {items.map(({ producto, cantidad }) => (
                <div key={producto.id} className="flex justify-between">
                  <span className="truncate mr-2">
                    {producto.nombre} ×{cantidad}
                  </span>

                  <span className="flex-shrink-0 font-medium">
                    ${(producto.precio * cantidad).toLocaleString("es-CO")}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 mb-5 flex justify-between font-bold text-gray-900">
              <span>Total</span>

              <span className="text-green-600 text-lg">
                ${totalPrecio.toLocaleString("es-CO")}
              </span>
            </div>

            {/* Dirección */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Dirección de entrega
              </label>

              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Cra 10 #20-30, Barrio..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {!usuario && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                Debes{" "}
                <button
                  onClick={() => navegar("login")}
                  className="underline font-semibold"
                >
                  iniciar sesión
                </button>{" "}
                para confirmar el pedido.
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                {error}
              </p>
            )}

            <button
              onClick={handleConfirmar}
              disabled={confirmando || !direccion.trim()}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {confirmando ? "Enviando pedido..." : "Confirmar pedido"}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              🔒 Pago contra entrega · Envío seguro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

