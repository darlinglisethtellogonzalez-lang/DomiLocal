// ============================================================
//  CAPA DE COMUNICACIÓN: React → FastAPI
//  Todos los fetch() hacia el backend pasan por aquí.
//  Cambiar BASE_URL cuando se despliegue el servidor real.
// ============================================================

const BASE_URL = "http://localhost:8000"; // URL del servidor FastAPI

// ---------- Utilidad de petición ----------
async function peticion<T>(
  ruta: string,
  opciones: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opciones,
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.detail || `Error ${respuesta.status}`);
  }

  return respuesta.json();
}

// ─────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────
export const authAPI = {
  /** POST /auth/registro  →  crea usuario y devuelve token */
  registrar: (datos: {
    nombre: string;
    correo: string;
    contrasena: string;
    tipo: "cliente" | "negocio" | "domiciliario";
  }) =>
    peticion<{ access_token: string; token_type: string; usuario: Usuario }>(
      "/auth/registro",
      { method: "POST", body: JSON.stringify(datos) }
    ),

  /** POST /auth/login  →  devuelve token JWT */
  login: (correo: string, contrasena: string) =>
    peticion<{ access_token: string; token_type: string; usuario: Usuario }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ correo, contrasena }) }
    ),

  /** GET /auth/yo  →  devuelve el usuario autenticado */
  yo: () => peticion<Usuario>("/auth/yo"),
};

// ─────────────────────────────────────────
//  PRODUCTOS
// ─────────────────────────────────────────
export const productosAPI = {
  /** GET /productos  →  lista de productos con filtros opcionales */
  listar: (params?: { categoria?: string; busqueda?: string }) => {
    const query = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => v) as string[][]
    ).toString();
    return peticion<Producto[]>(`/productos${query ? `?${query}` : ""}`);
  },

  /** GET /productos/:id  →  detalle de un producto */
  obtener: (id: number) => peticion<Producto>(`/productos/${id}`),

  /** POST /productos  →  crear producto (solo negocio) */
  crear: (datos: Omit<Producto, "id">) =>
    peticion<Producto>("/productos", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  /** PUT /productos/:id  →  editar producto */
  editar: (id: number, datos: Partial<Producto>) =>
    peticion<Producto>(`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    }),

  /** DELETE /productos/:id  →  eliminar producto */
  eliminar: (id: number) =>
    peticion<{ mensaje: string }>(`/productos/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────
//  PEDIDOS
// ─────────────────────────────────────────
export const pedidosAPI = {
  /** POST /pedidos  →  crear nuevo pedido */
  crear: (datos: CrearPedido) =>
    peticion<Pedido>("/pedidos", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  /** GET /pedidos/mis-pedidos  →  pedidos del cliente autenticado */
  misPedidos: () => peticion<Pedido[]>("/pedidos/mis-pedidos"),

  /** GET /pedidos/:id  →  detalle de un pedido */
  obtener: (id: number) => peticion<Pedido>(`/pedidos/${id}`),

  /** PATCH /pedidos/:id/estado  →  cambiar estado (negocio/domiciliario) */
  cambiarEstado: (id: number, estado: EstadoPedido) =>
    peticion<Pedido>(`/pedidos/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    }),

  /** GET /pedidos/negocio  →  todos los pedidos del negocio */
  delNegocio: () => peticion<Pedido[]>("/pedidos/negocio"),

  /** GET /pedidos/domiciliario  →  pedidos asignados al domiciliario */
  delDomiciliario: () => peticion<Pedido[]>("/pedidos/domiciliario"),
};

// ─────────────────────────────────────────
//  TIPOS TypeScript
// ─────────────────────────────────────────
export type TipoUsuario = "cliente" | "negocio" | "domiciliario";
export type EstadoPedido =
  | "recibido"
  | "preparando"
  | "en_camino"
  | "entregado"
  | "cancelado";

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  tipo: TipoUsuario;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria: string;
  disponible: boolean;
  negocio_id: number;
}

export interface ItemPedido {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  nombre_producto: string;
}

export interface Pedido {
  id: number;
  cliente_id: number;
  cliente_nombre: string;
  domiciliario_id: number | null;
  estado: EstadoPedido;
  total: number;
  direccion_entrega: string;
  items: ItemPedido[];
  created_at: string;
}

export interface CrearPedido {
  direccion_entrega: string;
  items: { producto_id: number; cantidad: number }[];
}

// Etiquetas en español para los estados
export const ETIQUETAS_ESTADO: Record<EstadoPedido, string> = {
  recibido:   "Pedido recibido",
  preparando: "Preparando pedido",
  en_camino:  "En camino",
  entregado:  "Entregado",
  cancelado:  "Cancelado",
};
