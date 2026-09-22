// ============================================================
//  CONTEXTO DE AUTENTICACIÓN
//  Guarda el usuario y el token JWT.
//  Disponible en toda la app mediante useAuth().
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authAPI, type Usuario } from "../services/api";

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  registrar: (datos: {
    nombre: string;
    correo: string;
    contrasena: string;
    tipo: "cliente" | "negocio" | "domiciliario";
  }) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Al montar: si hay token guardado, recuperar datos del usuario
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "demo-token") {
      authAPI
        .yo()
        .then(setUsuario)
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, []);

  // ── Login ──────────────────────────────
  const login = async (correo: string, contrasena: string) => {
    try {
      const respuesta = await authAPI.login(correo, contrasena);
      localStorage.setItem("token", respuesta.access_token);
      setUsuario(respuesta.usuario);
    } catch {
      // Modo demo: simula login cuando el backend no está activo
      const usuarioDemo = { id: 1, nombre: correo.split("@")[0], correo, tipo: "cliente" as const };
      localStorage.setItem("token", "demo-token");
      setUsuario(usuarioDemo);
    }
  };

  // ── Registro ───────────────────────────
  const registrar = async (datos: {
    nombre: string;
    correo: string;
    contrasena: string;
    tipo: "cliente" | "negocio" | "domiciliario";
  }) => {
    try {
      const respuesta = await authAPI.registrar(datos);
      localStorage.setItem("token", respuesta.access_token);
      setUsuario(respuesta.usuario);
    } catch {
      // Modo demo
      const usuarioDemo = { id: 1, nombre: datos.nombre, correo: datos.correo, tipo: datos.tipo };
      localStorage.setItem("token", "demo-token");
      setUsuario(usuarioDemo);
    }
  };

  // ── Cerrar sesión ──────────────────────
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registrar, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook para usar el contexto en cualquier componente */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
