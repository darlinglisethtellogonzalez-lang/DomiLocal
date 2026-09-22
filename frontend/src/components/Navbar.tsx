import { useState } from "react";
import type { Screen } from "../App";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";

interface Props {
  pantallaActual: Screen;
  navegar: (s: Screen) => void;
}

export default function Navbar({ pantallaActual, navegar }: Props) {
  const { usuario, cerrarSesion } = useAuth();
  const { totalItems } = useCarrito();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const activo = (s: Screen) =>
    pantallaActual === s
      ? "text-yellow-300 underline underline-offset-4"
      : "hover:text-yellow-200 transition-colors";

  return (
    <header className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <button onClick={() => navegar("inicio")}
          className="text-xl font-bold tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0">
          <span className="text-2xl">🛵</span>
          <span>DomiLocal</span>
        </button>

        {/* ── Menú principal (escritorio) ── */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium">
          <button onClick={() => navegar("inicio")} className={activo("inicio")}>Inicio</button>
          <button onClick={() => navegar("productos")} className={activo("productos")}>Productos</button>
          {usuario && (
            <>
              <button onClick={() => navegar("mis-pedidos")} className={activo("mis-pedidos")}>
                Mis pedidos
              </button>
              {usuario.tipo === "negocio" && (
                <button onClick={() => navegar("panel-negocio")} className={activo("panel-negocio")}>
                  Mi negocio
                </button>
              )}
              {usuario.tipo === "domiciliario" && (
                <button onClick={() => navegar("panel-domiciliario")} className={activo("panel-domiciliario")}>
                  Mis entregas
                </button>
              )}
            </>
          )}
          {/* Menú desplegable "Más" */}
          <div className="relative group">
            <button className="hover:text-yellow-200 transition-colors flex items-center gap-1">
              Más <span className="text-xs">▾</span>
            </button>
            <div className="absolute top-full left-0 mt-2 w-52 bg-white text-gray-700 rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <MenuItem label="🏪 Negocios locales"    onClick={() => navegar("productos")} />
              <MenuItem label="📋 Cómo funciona"       onClick={() => navegar("inicio")}    />
              <MenuItem label="🛵 Ser domiciliario"    onClick={() => navegar("registro")}  />
              <MenuItem label="🏢 Registrar negocio"   onClick={() => navegar("registro")}  />
              <div className="border-t border-gray-100 my-1" />
              <MenuItem label="💬 Soporte"             onClick={() => navegar("inicio")}    />
              <MenuItem label="❓ Preguntas frecuentes" onClick={() => navegar("inicio")}   />
            </div>
          </div>
        </div>

        {/* ── Acciones derechas ── */}
        <div className="flex items-center gap-2 text-sm font-medium">

          {/* Carrito */}
          <button onClick={() => navegar("carrito")}
            className="relative flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors">
            🛒
            <span className="hidden sm:inline">Carrito</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-green-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {!usuario ? (
            <>
              <button onClick={() => navegar("login")}
                className="hidden sm:block border border-white/50 rounded-xl px-3 py-2 hover:bg-white hover:text-green-700 transition-colors">
                Iniciar sesión
              </button>
              <button onClick={() => navegar("registro")}
                className="bg-yellow-400 text-green-900 font-bold rounded-xl px-3 py-2 hover:bg-yellow-300 transition-colors">
                Registrarse
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-yellow-400 text-green-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold leading-tight">{usuario.nombre.split(" ")[0]}</p>
                  <p className="text-xs text-green-200 leading-tight capitalize">{usuario.tipo}</p>
                </div>
              </div>
              <button onClick={cerrarSesion}
                className="text-white/60 hover:text-white text-xs hover:underline hidden sm:block">
                Salir
              </button>
            </div>
          )}

          {/* Hamburguesa móvil */}
          <button onClick={() => setMenuAbierto(v => !v)}
            className="md:hidden bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
            {menuAbierto ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* ── Menú móvil ── */}
      {menuAbierto && (
        <div className="md:hidden border-t border-green-600 bg-green-700 px-4 py-3 space-y-1">
          {[
            ["inicio",    "🏠 Inicio"],
            ["productos", "📦 Productos"],
            ...(usuario ? [["mis-pedidos","📋 Mis pedidos"]] : []),
            ...(usuario?.tipo === "negocio"      ? [["panel-negocio",      "🏪 Mi negocio"]]   : []),
            ...(usuario?.tipo === "domiciliario" ? [["panel-domiciliario", "🛵 Mis entregas"]]  : []),
            ["carrito",   "🛒 Carrito"],
            ["login",     "🔐 Iniciar sesión"],
            ["registro",  "✨ Registrarse"],
          ].map(([pantalla, label]) => (
            <button key={pantalla}
              onClick={() => { navegar(pantalla as Screen); setMenuAbierto(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pantallaActual === pantalla ? "bg-white/20 text-yellow-300" : "hover:bg-white/10"
              }`}>
              {label}
            </button>
          ))}
          {usuario && (
            <button onClick={() => { cerrarSesion(); setMenuAbierto(false); }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-white/10">
              🚪 Cerrar sesión
            </button>
          )}
        </div>
      )}
    </header>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition-colors">
      {label}
    </button>
  );
}
