import { useState } from "react";
import type { Screen } from "../App";
import { useAuth } from "../context/AuthContext";
import type { TipoUsuario } from "../services/api";

interface Props { navegar: (s: Screen) => void }

const ROLES: { valor: TipoUsuario; emoji: string; titulo: string; desc: string }[] = [
  { valor: "cliente",      emoji: "👤", titulo: "Cliente",      desc: "Realiza pedidos y haz seguimiento." },
  { valor: "negocio",      emoji: "🏪", titulo: "Negocio",      desc: "Gestiona productos y pedidos."      },
  { valor: "domiciliario", emoji: "🛵", titulo: "Domiciliario", desc: "Entrega pedidos asignados."         },
];

export default function RegistroScreen({ navegar }: Props) {
  const { registrar } = useAuth();
  const [nombre, setNombre]         = useState("");
  const [correo, setCorreo]         = useState("");
  const [contrasena, setContrasena] = useState("");
  const [tipo, setTipo]             = useState<TipoUsuario>("cliente");
  const [cargando, setCargando]     = useState(false);
  const [error, setError]           = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre || !correo || !contrasena) { setError("Completa todos los campos."); return; }
    if (contrasena.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    setCargando(true);
    try {
      await registrar({ nombre, correo, contrasena, tipo });
      if (tipo === "negocio")      navegar("panel-negocio");
      else if (tipo === "domiciliario") navegar("panel-domiciliario");
      else navegar("inicio");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900">Crea tu cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Únete a DomiLocal hoy mismo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Selección de rol */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de cuenta</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.valor}
                    type="button"
                    onClick={() => setTipo(r.valor)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs transition-all ${
                      tipo === r.valor
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-green-300 text-gray-600"
                    }`}
                  >
                    <span className="text-2xl">{r.emoji}</span>
                    <span className="font-semibold">{r.titulo}</span>
                    <span className="text-center text-gray-400 leading-tight hidden sm:block">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            {/* Correo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-green-600 text-white font-bold rounded-xl py-3 hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <button onClick={() => navegar("login")} className="text-green-600 font-semibold hover:underline">
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

