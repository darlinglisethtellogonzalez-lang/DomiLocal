
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from "react";

import { authAPI, type Usuario } from "../services/api";

interface DatosRegistro {
  nombre: string;
  correo: string;
  contrasena: string;
  tipo: "cliente" | "negocio" | "domiciliario";
  nombre_negocio?: string;
  categoria?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  registrar: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && token !== "demo-token") {
      authAPI.yo()
        .then(setUsuario)
        .catch(() => {
          localStorage.removeItem("token");
          setUsuario(null);
        })
        .finally(() => setCargando(false));
    } else {
      localStorage.removeItem("token");
      setCargando(false);
    }
  }, []);

  const login = async (correo: string, contrasena: string) => {
    const respuesta = await authAPI.login(correo, contrasena);

    localStorage.setItem("token", respuesta.access_token);
    setUsuario(respuesta.usuario);
  };

  const registrar = async (datos: DatosRegistro) => {
    const respuesta = await authAPI.registrar(datos);

    localStorage.setItem("token", respuesta.access_token);
    setUsuario(respuesta.usuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        login,
        registrar,
        cerrarSesion
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return contexto;
}

