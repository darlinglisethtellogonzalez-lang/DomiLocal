
import { useState } from "react";
import type { Screen } from "../App";
import { useAuth } from "../context/AuthContext";

interface Props {
  navegar: (s: Screen) => void;
}

export default function LoginScreen({ navegar }: Props) {
  const { login } = useAuth();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!correo || !contrasena) {
      setError("Completa todos los campos.");
      return;
    }

    setCargando(true);

    try {
      await login(correo, contrasena);
      navegar("inicio");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Credenciales incorrectas."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido de nuevo
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Inicia sesión en tu cuenta DomiLocal
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Correo electrónico
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                  ✉
                </span>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Contraseña
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔒
                </span>
                <input
                  type={verPass ? "text" : "password"}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setVerPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {verPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

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
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => navegar("registro")}
              className="text-green-600 font-semibold hover:underline"
            >
              Regístrate gratis
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

