import {
  BarChart3,
  CreditCard,
  Home,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Store,
  Tag,
  Users,
} from "@calumet/elise-icons";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNav,
  AppShellNavAction,
  AppShellNavFooter,
  AppShellNavGroup,
  AppShellNavItem,
  AppShellNavSection,
  AppShellNavSubItem,
  AppShellNavSubList,
  AppShellNavToggle,
} from "@calumet/elise-ui/app-shell";
import { Button } from "@calumet/elise-ui/button";
import { Kbd } from "@calumet/elise-ui/kbd";
import { Text } from "@calumet/elise-ui/text";
import { useState } from "react";

const AppShellDemo = () => {
  /* Arranca en la primera hija a propósito: es el caso donde la vertical tiene
     hermanas por debajo y donde se ve que el codo la termina. */
  const [ruta, setRuta] = useState("/segmentos");

  const ir = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setRuta(href);
  };

  const hijasDeClientes = ["/segmentos", "/companies"];

  /* La estrella es un interruptor de verdad y no un adorno: se queda pulsada,
     lo dice con `aria-pressed`, y por eso la fila la sigue mostrando cuando el
     ratón se va. */
  const [fijado, setFijado] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const guardar = () => {
    setGuardando(true);
    setTimeout(() => setGuardando(false), 1600);
  };

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-xl border border-border">
      <AppShell className="h-full">
        {/* Tres bandas para que el buscador quede centrado en la ventana: las
            laterales valen 1fr, así que miden lo mismo y el centro no se
            desplaza cuando el nombre crece. */}
        <AppShellHeader className="grid grid-cols-[1fr_minmax(0,420px)_1fr] gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <AppShellNavToggle />
            <Text size="lg" weight="bold" className="truncate">
              Calumet
            </Text>
          </div>

          {/* Es un botón que abre la búsqueda y no un campo, y por eso lleva el
              atajo dentro. Las piezas de la cabecera usan `bg-card`,
              la superficie que se levanta bajo su tema oscuro, más un borde:
              contra un fondo casi negro, 0.044 de diferencia de luminosidad no
              alcanzan a dibujar la caja, y lo que la define es el contorno. */}
          <button
            type="button"
            className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 text-muted-foreground transition-[background-color,border-color] duration-(--duration-fast) ease-out hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 truncate text-start text-sm">Buscar</span>
            <span className="hidden items-center gap-1 md:inline-flex">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>

          <div className="flex min-w-0 items-center justify-end gap-3">
            <div className="flex h-9 items-center gap-2 rounded-xl border border-border bg-card ps-3 pe-1">
              <span className="hidden text-sm font-semibold md:inline">Juan D.</span>
              <span className="flex size-7 items-center justify-center rounded-sm bg-primary text-2xs font-bold text-primary-foreground">
                JD
              </span>
            </div>
          </div>
        </AppShellHeader>

        <AppShellNav>
          <ul className="list-none p-0">
            {/* `activeIcon` es el mismo icono con más peso. Aquí es trazo más
                grueso y no relleno, porque estos iconos están dibujados para
                trazo: rellenarlos funde el tejado con la puerta. */}
            <AppShellNavItem
              href="/"
              icon={<Home />}
              activeIcon={<Home strokeWidth={2.5} />}
              active={ruta === "/"}
              onClick={ir("/")}
            >
              Inicio
            </AppShellNavItem>
            <AppShellNavItem
              href="/pedidos"
              icon={<ShoppingCart />}
              count={12}
              active={ruta === "/pedidos"}
              onClick={ir("/pedidos")}
            >
              Pedidos
            </AppShellNavItem>
            {/* Con acciones y contador a la vez, el contador se esconde
                mientras se apunta: los dos no caben sin empujar el texto. */}
            <AppShellNavItem
              href="/productos"
              icon={<Package />}
              count={148}
              actions={
                <AppShellNavAction
                  aria-label={fijado ? "Dejar de fijar Productos" : "Fijar Productos"}
                  aria-pressed={fijado}
                  onClick={() => setFijado((f) => !f)}
                  className={fijado ? "text-sidebar-foreground" : undefined}
                >
                  <Star aria-hidden="true" fill={fijado ? "currentColor" : "none"} />
                </AppShellNavAction>
              }
              active={ruta === "/productos"}
              onClick={ir("/productos")}
            >
              Productos
            </AppShellNavItem>

            {/* El grupo es dueño del `<li>`, así que la lista de hijas cuelga
                de él y no queda como un `<ul>` dentro de otro `<ul>`. */}
            <AppShellNavGroup defaultOpen>
              <AppShellNavItem
                href="/clientes"
                icon={<Users />}
                childActive={hijasDeClientes.includes(ruta)}
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
            </AppShellNavGroup>

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

            <AppShellNavSection title="Canales de venta" onAction={() => setRuta("/canales")}>
              <AppShellNavItem
                href="/tienda"
                icon={<Store />}
                active={ruta === "/tienda"}
                onClick={ir("/tienda")}
              >
                Tienda online
              </AppShellNavItem>
              <AppShellNavItem
                href="/pos"
                icon={<CreditCard />}
                active={ruta === "/pos"}
                onClick={ir("/pos")}
              >
                Punto de venta
              </AppShellNavItem>
            </AppShellNavSection>
          </ul>

          {/* Se queda abajo aunque la lista de arriba se desplace. */}
          <AppShellNavFooter>
            <AppShellNavItem
              href="/ajustes"
              icon={<Settings />}
              active={ruta === "/ajustes"}
              onClick={ir("/ajustes")}
            >
              Ajustes
            </AppShellNavItem>
          </AppShellNavFooter>
        </AppShellNav>

        <AppShellMain>
          <Text size="xl" weight="bold">
            {ruta}
          </Text>
          <Text size="sm" tone="muted" className="mt-1">
            La guía baja desde el icono del padre y termina en codo sobre la hija activa; por debajo
            de ella ya no sigue. Al apuntar otra hija se asoma el codo que tendría si la eligieras.
            El caret de la sección es una acción, no un desplegable, así que no gira.
          </Text>
          <div className="mt-4 flex items-center gap-2">
            <Button loading={guardando} onClick={guardar}>
              Guardar cambios
            </Button>
            <Button variant="outline">Descartar</Button>
            <Button variant="ghost" disabled>
              No disponible
            </Button>
          </div>
          <Text size="xs" tone="muted" className="mt-2">
            Pulsa «Guardar cambios»: el rótulo se apaga pero no se va, así que el botón conserva su
            ancho y no empuja a los de al lado.
          </Text>
        </AppShellMain>
      </AppShell>
    </div>
  );
};

export default AppShellDemo;
