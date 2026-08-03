import { BarChart3, Home, Package, ShoppingCart, Tag, Users } from "@calumet/elise-icons";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNav,
  AppShellNavItem,
  AppShellNavSection,
  AppShellNavSubItem,
  AppShellNavSubList,
  AppShellNavToggle,
} from "@calumet/elise-ui/app-shell";
import { Badge } from "@calumet/elise-ui/badge";
import { Text } from "@calumet/elise-ui/text";
import { useState } from "react";

const AppShellDemo = () => {
  const [ruta, setRuta] = useState("/companies");

  const ir = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setRuta(href);
  };

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-xl border border-border">
      <AppShell className="h-full">
        <AppShellHeader>
          <AppShellNavToggle />
          <Text size="sm" weight="semibold">
            Calumet
          </Text>
          <Badge tone="neutral" size="sm" className="ms-auto">
            {ruta}
          </Badge>
        </AppShellHeader>

        <AppShellNav>
          <ul className="list-none p-0">
            <AppShellNavItem href="/" icon={<Home />} active={ruta === "/"} onClick={ir("/")}>
              Inicio
            </AppShellNavItem>
            <AppShellNavItem
              href="/pedidos"
              icon={<ShoppingCart />}
              active={ruta === "/pedidos"}
              onClick={ir("/pedidos")}
            >
              Pedidos
            </AppShellNavItem>
            <AppShellNavItem
              href="/productos"
              icon={<Package />}
              active={ruta === "/productos"}
              onClick={ir("/productos")}
            >
              Productos
            </AppShellNavItem>

            <AppShellNavItem
              href="/clientes"
              icon={<Users />}
              hasChildren
              active={ruta === "/clientes"}
              onClick={ir("/clientes")}
            >
              Clientes
            </AppShellNavItem>
            <AppShellNavSubList>
              <AppShellNavSubItem
                href="/segmentos"
                active={ruta === "/segmentos"}
                onClick={ir("/segmentos")}
              >
                Segmentos
              </AppShellNavSubItem>
              <AppShellNavSubItem
                href="/companies"
                active={ruta === "/companies"}
                onClick={ir("/companies")}
              >
                Compañías
              </AppShellNavSubItem>
            </AppShellNavSubList>

            <AppShellNavItem
              href="/descuentos"
              icon={<Tag />}
              active={ruta === "/descuentos"}
              onClick={ir("/descuentos")}
            >
              Descuentos
            </AppShellNavItem>
            <AppShellNavItem
              href="/analitica"
              icon={<BarChart3 />}
              active={ruta === "/analitica"}
              onClick={ir("/analitica")}
            >
              Analítica
            </AppShellNavItem>

            <AppShellNavSection title="Canales de venta">
              <AppShellNavItem href="/tienda" active={ruta === "/tienda"} onClick={ir("/tienda")}>
                Tienda online
              </AppShellNavItem>
              <AppShellNavItem href="/pos" active={ruta === "/pos"} onClick={ir("/pos")}>
                Punto de venta
              </AppShellNavItem>
            </AppShellNavSection>
          </ul>
        </AppShellNav>

        <AppShellMain className="p-5">
          <Text size="xl" weight="bold">
            {ruta}
          </Text>
          <Text size="sm" tone="muted" className="mt-1">
            La guía baja desde el icono del padre y dobla en codo hacia la hija activa. Elegí
            «Segmentos» para verla moverse.
          </Text>
        </AppShellMain>
      </AppShell>
    </div>
  );
};

export default AppShellDemo;
