import {
  BarChart3,
  Bell,
  CircleHelp,
  CreditCard,
  Home,
  Package,
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
  AppShellHeaderAction,
  AppShellHeaderActions,
  AppShellHeaderBrand,
  AppShellHeaderSearch,
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
  AppShellUserMenu,
} from "@calumet/elise-ui/app-shell";
import { Button } from "@calumet/elise-ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@calumet/elise-ui/command";
import { DropdownMenuItem, DropdownMenuSeparator } from "@calumet/elise-ui/dropdown-menu";
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

  /* Lo de la cabecera también hace algo: sin esto serían controles con forma
     de control y sin comportamiento, que es peor que no ponerlos. */
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const [guardando, setGuardando] = useState(false);
  const guardar = () => {
    setGuardando(true);
    setTimeout(() => setGuardando(false), 1600);
  };

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-xl border border-border">
      <AppShell className="h-full">
        <AppShellHeader>
          <AppShellHeaderBrand>
            <AppShellNavToggle />
            <Text size="lg" weight="bold" className="truncate">
              Calumet
            </Text>
          </AppShellHeaderBrand>

          <AppShellHeaderSearch shortcut={["Ctrl", "K"]} onClick={() => setBuscando(true)}>
            Buscar
          </AppShellHeaderSearch>

          {/* Las acciones van antes del menú de la cuenta, que es el ancla de
              la esquina: al revés bailaría de sitio en cada pantalla. */}
          <AppShellHeaderActions>
            <AppShellHeaderAction
              label="Notificaciones"
              icon={<Bell />}
              onClick={() => setAviso("Notificaciones")}
            />
            <AppShellHeaderAction
              label="Ayuda"
              icon={<CircleHelp />}
              onClick={() => setAviso("Ayuda")}
            />
            <AppShellUserMenu name="Juan D." detail="Calumet S.A.S." initials="JD">
              <DropdownMenuItem onSelect={() => setAviso("Perfil")}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRuta("/ajustes")}>Ajustes</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setAviso("Cerrar sesión")}>
                Cerrar sesión
              </DropdownMenuItem>
            </AppShellUserMenu>
          </AppShellHeaderActions>
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
          {aviso ? (
            <Text size="sm" className="mt-4" data-testid="aviso-cabecera">
              Última acción de la cabecera: <strong>{aviso}</strong>
            </Text>
          ) : null}
        </AppShellMain>

        {/* Lo que abre el buscador de la cabecera: una paleta con su propio
            campo dentro, que es la razón de que allá arriba sea un botón y no
            un campo. */}
        <CommandDialog open={buscando} onOpenChange={setBuscando}>
          <CommandInput placeholder="Buscar pedidos, productos, clientes…" />
          <CommandList>
            <CommandEmpty>Sin resultados</CommandEmpty>
            <CommandGroup heading="Ir a">
              {[
                ["Pedidos", "/pedidos"],
                ["Productos", "/productos"],
                ["Clientes", "/clientes"],
              ].map(([texto, destino]) => (
                <CommandItem
                  key={destino}
                  onSelect={() => {
                    setRuta(destino);
                    setBuscando(false);
                  }}
                >
                  {texto}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </AppShell>
    </div>
  );
};

export default AppShellDemo;
