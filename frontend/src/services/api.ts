
// ============================================================
// CAPA DE COMUNICACIÓN: React → FastAPI
// Todos los fetch() hacia el backend pasan por aquí.
// ============================================================

const BASE_URL = (
  import.meta.env.VITE_API_URL || "https://domilocal.onrender.com"
).replace(/\/$/, "");

// ============================================================
// UTILIDAD DE PETICIÓN
// ============================================================

async function peticion<T>(
  ruta: string,
  opciones: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));

    throw new Error(
      error.detail || `Error ${respuesta.status}`
    );
  }

  return respuesta.json();
}

// ============================================================
// AUTH
// ============================================================

export const authAPI = {
  registrar: (datos: {
    nombre: string;
    correo: string;
    contrasena: string;
    tipo: "cliente" | "negocio" | "domiciliario";
  }) =>
    peticion<{
      access_token: string;
      token_type: string;
      usuario: Usuario;
    }>("/auth/registro", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  login: (correo: string, contrasena: string) =>
    peticion<{
      access_token: string;
      token_type: string;
      usuario: Usuario;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, contrasena }),
    }),

  yo: () => peticion<Usuario>("/auth/yo"),
};

// ============================================================
// PRODUCTOS
// ============================================================

export const productosAPI = {
  listarPrueba: async (): Promise<Producto[]> => {
    type ProductoSimulado = {
      id: number;
      nombre: string;
      descripcion: string;
      precio: number;
      categoria: string;
    };

    const datos = await peticion<ProductoSimulado[]>(
      "/api/productos"
    );

    return datos.map((p) => {
      const nombre = p.nombre.toLowerCase();

      let categoria = "Comidas";

      if (
        nombre.includes("jugo") ||
        nombre.includes("limonada") ||
        nombre.includes("bebida")
      ) {
        categoria = "Bebidas";
      } else if (
        nombre.includes("papas") ||
        nombre.includes("empanadas") ||
        nombre.includes("aperitivo")
      ) {
        categoria = "Aperitivos";
      } else if (
        nombre.includes("brownie") ||
        nombre.includes("helado") ||
        nombre.includes("postre")
      ) {
        categoria = "Postres";
      }

      let imagen =
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop";

      if (nombre.includes("hamburguesa")) {
        imagen =
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop";
      } else if (nombre.includes("pizza")) {
        imagen =
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop";
      } else if (nombre.includes("pollo")) {
        imagen =
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop";
      } else if (nombre.includes("perro caliente")) {
        imagen =
          "https://images.unsplash.com/photo-1612392061981-9d086fe894ed?auto=format&fit=crop&fm=jpg&q=80&w=500";
      } else if (nombre.includes("jugo")) {
        imagen =
          "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop";
      } else if (nombre.includes("limonada")) {
        imagen =
          "https://images.unsplash.com/photo-1631308492942-3a713d7fd02e?auto=format&fit=crop&fm=jpg&q=80&w=500";
      } else if (nombre.includes("papas")) {
        imagen =
          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop";
      } else if (nombre.includes("empanadas")) {
        imagen =
          "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop";
      } else if (nombre.includes("brownie")) {
        imagen =
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop";
      } else if (nombre.includes("helado")) {
        imagen =
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop";
      }

      return {
        ...p,
        categoria,
        imagen_url: imagen,
        disponible: true,
        negocio_id: 52,
      };
    });
  },

  listar: (params?: {
    categoria?: string;
    busqueda?: string;
  }) => {
    const query = new URLSearchParams(
      Object.entries(params ?? {}).filter(
        ([, valor]) => valor
      ) as string[][]
    ).toString();

    return peticion<Producto[]>(
      `/productos${query ? `?${query}` : ""}`
    );
  },

  obtener: (id: number) =>
    peticion<Producto>(`/productos/${id}`),

  crear: (datos: Omit<Producto, "id">) =>
    peticion<Producto>("/productos", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  editar: (id: number, datos: Partial<Producto>) =>
    peticion<Producto>(`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    }),

  eliminar: (id: number) =>
    peticion<{ mensaje: string }>(
      `/productos/${id}`,
      { method: "DELETE" }
    ),
};

// ============================================================
// PEDIDOS
// ============================================================

export const pedidosAPI = {
  crear: (datos: CrearPedido) =>
    peticion<Pedido>("/pedidos", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  misPedidos: () =>
    peticion<Pedido[]>("/pedidos/mis-pedidos"),

  obtener: (id: number) =>
    peticion<Pedido>(`/pedidos/${id}`),

  cambiarEstado: (
    id: number,
    estado: EstadoPedido
  ) =>
    peticion<{
      mensaje: string;
      pedido_id: number;
      estado_anterior: string;
      estado: EstadoPedido;
    }>(`/pedidos/${id}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    }),

  delNegocio: () =>
    peticion<RespuestaPedidosNegocio>(
      "/pedidos/negocio/mis-pedidos"
    ),

  delDomiciliario: () =>
    peticion<Pedido[]>("/pedidos/domiciliario"),
};

// ============================================================
// TIPOS TYPESCRIPT
// ============================================================

export type TipoUsuario =
  | "cliente"
  | "negocio"
  | "domiciliario";

export type EstadoPedido =
  | "pendiente"
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
  items: {
    producto_id: number;
    cantidad: number;
  }[];
}

// ============================================================
// RESPUESTA REAL DEL BACKEND PARA EL NEGOCIO
// ============================================================

export interface ProductoPedidoNegocio {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface PedidoNegocio {
  pedido_id: number;
  cliente_id: number;
  domiciliario_id: number | null;
  direccion_entrega: string;
  fecha_pedido: string;
  estado: EstadoPedido;
  productos: ProductoPedidoNegocio[];
  total_productos: number;
  comision_domilocal: number;
  neto_negocio: number;
}

export interface RespuestaPedidosNegocio {
  negocio: string;
  cantidad_pedidos: number;
  pedidos: PedidoNegocio[];
}

// ============================================================
// ETIQUETAS DE LOS ESTADOS
// ============================================================

export const ETIQUETAS_ESTADO: Record<
  EstadoPedido,
  string
> = {
  pendiente: "Pendiente",
  recibido: "Pedido recibido",
  preparando: "Preparando pedido",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

