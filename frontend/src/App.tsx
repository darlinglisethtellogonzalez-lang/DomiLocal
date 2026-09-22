import { useState } from "react";
import './index.css';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// ── Pantallas ──────────────────────────────────────────────
import InicioScreen from "./screens/InicioScreen";
import LoginScreen from "./screens/LoginScreen";
import RegistroScreen from "./screens/RegistroScreen";
import ProductosScreen from "./screens/ProductosScreen";
import CarritoScreen from "./screens/CarritoScreen";
import MisPedidosScreen from "./screens/MisPedidosScreen";
import DetallePedidoScreen from "./screens/DetallePedidoScreen";
import PanelNegocioScreen from "./screens/PanelNegocioScreen";
import PanelDomiciliarioScreen from "./screens/PanelDomiciliarioScreen";

// ── Tipo de pantallas disponibles ──────────────────────────
export type Screen =
  | "inicio"
  | "login"
  | "registro"
  | "productos"
  | "carrito"
  | "mis-pedidos"
  | "detalle-pedido"
  | "panel-negocio"
  | "panel-domiciliario";

export default function App() {
  const [pantalla, setPantalla] = useState<Screen>("inicio");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<number | null>(null);

  const navegar = (s: Screen, extra?: { pedidoId?: number }) => {
    if (extra?.pedidoId !== undefined) setPedidoSeleccionado(extra.pedidoId);
    setPantalla(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const props = { navegar };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar pantallaActual={pantalla} navegar={navegar} />

      <main className="flex-1">
        {pantalla === "inicio"              && <InicioScreen {...props} />}
        {pantalla === "login"               && <LoginScreen {...props} />}
        {pantalla === "registro"            && <RegistroScreen {...props} />}
        {pantalla === "productos"           && <ProductosScreen {...props} />}
        {pantalla === "carrito"             && <CarritoScreen {...props} />}
        {pantalla === "mis-pedidos"         && <MisPedidosScreen navegar={navegar} />}
        {pantalla === "detalle-pedido"      && <DetallePedidoScreen pedidoId={pedidoSeleccionado} navegar={navegar} />}
        {pantalla === "panel-negocio"       && <PanelNegocioScreen navegar={navegar} />}
        {pantalla === "panel-domiciliario"  && <PanelDomiciliarioScreen navegar={navegar} />}
      </main>

      <Footer navegar={navegar} />
    </div>
  );
}
