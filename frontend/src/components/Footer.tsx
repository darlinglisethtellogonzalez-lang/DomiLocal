import type { Screen } from "../App";

interface Props {
  navegar: (s: Screen) => void;
}

export default function Footer({ navegar }: Props) {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">

        {/* Marca */}
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <span className="text-2xl">🛵</span> DomiLocal
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Plataforma de gestión de pedidos y domicilios para negocios locales.
            Rápido, organizado y confiable.
          </p>
        </div>

        {/* Navegación */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm">Navegación</h3>
          <ul className="space-y-2 text-sm">
            {([
              ["inicio",    "Inicio"],
              ["productos", "Productos"],
              ["carrito",   "Mi carrito"],
              ["login",     "Iniciar sesión"],
              ["registro",  "Registrarse"],
            ] as [Screen, string][]).map(([pantalla, etiqueta]) => (
              <li key={pantalla}>
                <button
                  onClick={() => navegar(pantalla)}
                  className="hover:text-green-400 transition-colors"
                >
                  {etiqueta}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tecnologías */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm">Tecnologías</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
              React + Vite — Frontend
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              FastAPI (Python) — Backend / API
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
              MySQL — Base de datos
            </li>
          </ul>

          {/* Flujo rápido */}
          <div className="mt-5 bg-gray-800 rounded-lg p-3 text-xs text-gray-400 font-mono leading-relaxed">
            Usuario → React<br />
            React → FastAPI<br />
            FastAPI → MySQL<br />
            MySQL → FastAPI<br />
            FastAPI → React<br />
            React → Usuario
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} DomiLocal — Proyecto académico
      </div>
    </footer>
  );
}
