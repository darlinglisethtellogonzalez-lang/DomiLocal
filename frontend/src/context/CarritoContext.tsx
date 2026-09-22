// ============================================================
//  CONTEXTO DEL CARRITO DE COMPRAS
//  Persiste en localStorage.
//  Disponible en toda la app mediante useCarrito().
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Producto } from "../services/api";

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

interface CarritoContextType {
  items: ItemCarrito[];
  totalItems: number;
  totalPrecio: number;
  agregar: (producto: Producto) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, delta: number) => void;
  vaciar: () => void;
}

const CarritoContext = createContext<CarritoContextType | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>(() => {
    try {
      const guardado = localStorage.getItem("carrito");
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  // Sincronizar con localStorage cada vez que cambie el carrito
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(items));
  }, [items]);

  // ── Agregar al carrito ──────────────────
  const agregar = (producto: Producto) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.producto.id === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  // ── Quitar del carrito ──────────────────
  const quitar = (productoId: number) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== productoId));
  };

  // ── Cambiar cantidad (+1 / -1) ──────────
  const cambiarCantidad = (productoId: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.producto.id === productoId
            ? { ...i, cantidad: i.cantidad + delta }
            : i
        )
        .filter((i) => i.cantidad > 0)
    );
  };

  // ── Vaciar carrito ──────────────────────
  const vaciar = () => setItems([]);

  const totalItems = items.reduce((a, b) => a + b.cantidad, 0);
  const totalPrecio = items.reduce(
    (a, b) => a + b.producto.precio * b.cantidad,
    0
  );

  return (
    <CarritoContext.Provider
      value={{ items, totalItems, totalPrecio, agregar, quitar, cambiarCantidad, vaciar }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

/** Hook para usar el carrito en cualquier componente */
export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}

