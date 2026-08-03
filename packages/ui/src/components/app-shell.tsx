import { ChevronRight } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/* ------------------------------------------------------------------ *
 * Marco
 * ------------------------------------------------------------------ */

type AppShellContextValue = {
  cajonAbierto: boolean;
  setCajonAbierto: (abierto: boolean) => void;
};

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

const useAppShell = (parte: string) => {
  const ctx = React.useContext(AppShellContext);
  if (!ctx) throw new Error(`<${parte}> debe usarse dentro de <AppShell>`);
  return ctx;
};

export type AppShellProps = React.ComponentProps<"div"> & {
  /** Cajón de navegación abierto, en el ancho donde la barra se oculta. */
  navOpen?: boolean;
  defaultNavOpen?: boolean;
  onNavOpenChange?: (open: boolean) => void;
};

/**
 * Marco de aplicación: cabecera fija arriba, navegación a un lado y el área
 * donde entra cada pantalla.
 *
 * Sigue la estructura del `Frame` de Polaris, con una diferencia deliberada: el
 * cajón y su velo cuelgan de la fila de contenido y no de la ventana, de modo
 * que la cabecera sigue a la vista y alcanzable mientras la navegación está
 * abierta. Por eso el cajón no es un `Sheet`, que es de posición fija.
 *
 * ```tsx
 * <AppShell>
 *   <AppShellHeader>…</AppShellHeader>
 *   <AppShellNav>
 *     <AppShellNavSection title="Gestión">
 *       <AppShellNavItem href="/alumnos" active>Alumnos</AppShellNavItem>
 *     </AppShellNavSection>
 *   </AppShellNav>
 *   <AppShellMain>{children}</AppShellMain>
 * </AppShell>
 * ```
 */
function AppShell({
  className,
  navOpen,
  defaultNavOpen = false,
  onNavOpenChange,
  children,
  ...props
}: AppShellProps) {
  const [interno, setInterno] = React.useState(defaultNavOpen);
  const controlado = navOpen !== undefined;
  const abierto = controlado ? navOpen : interno;

  const setCajonAbierto = React.useCallback(
    (siguiente: boolean) => {
      if (!controlado) setInterno(siguiente);
      onNavOpenChange?.(siguiente);
    },
    [controlado, onNavOpenChange],
  );

  /* El cajón solo existe por debajo del breakpoint. Al pasar de ahí desaparece,
     y si siguiera abierto dejaría el contenido inerte sin nada que lo tape. */
  React.useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCajonAbierto(false);
    };
    const ancho = window.matchMedia("(min-width: 48rem)");
    const alEnsanchar = () => {
      if (ancho.matches) setCajonAbierto(false);
    };
    document.addEventListener("keydown", alTeclear);
    ancho.addEventListener("change", alEnsanchar);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      ancho.removeEventListener("change", alEnsanchar);
    };
  }, [abierto, setCajonAbierto]);

  const ctx = React.useMemo(
    () => ({ cajonAbierto: abierto, setCajonAbierto }),
    [abierto, setCajonAbierto],
  );

  const cabecera: React.ReactNode[] = [];
  const resto: React.ReactNode[] = [];
  React.Children.forEach(children, (hijo) => {
    const tipo = React.isValidElement(hijo) ? (hijo.type as { displayName?: string }) : null;
    if (tipo?.displayName === "AppShellHeader") cabecera.push(hijo);
    else resto.push(hijo);
  });

  return (
    <AppShellContext.Provider value={ctx}>
      <div
        data-slot="app-shell"
        className={cn(
          "flex h-svh flex-col overflow-hidden bg-background text-foreground",
          className,
        )}
        {...props}
      >
        {cabecera}
        <div data-slot="app-shell-body" className="relative flex min-h-0 flex-1 items-stretch">
          {resto}
        </div>
      </div>
    </AppShellContext.Provider>
  );
}

export type AppShellHeaderProps = React.ComponentProps<"header">;

/** Barra superior. Queda fuera del área que el cajón cubre, a propósito. */
function AppShellHeader({ className, ...props }: AppShellHeaderProps) {
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground",
        className,
      )}
      {...props}
    />
  );
}
AppShellHeader.displayName = "AppShellHeader";

export type AppShellNavToggleProps = React.ComponentProps<"button">;

/** Abre y cierra el cajón. Solo se ve donde la navegación está plegada. */
function AppShellNavToggle({ className, children, ...props }: AppShellNavToggleProps) {
  const { cajonAbierto, setCajonAbierto } = useAppShell("AppShellNavToggle");
  const etiqueta = useElLabel("ui", "toggleNavigation", "Alternar navegación");

  return (
    <button
      type="button"
      data-slot="app-shell-nav-toggle"
      aria-label={etiqueta}
      aria-expanded={cajonAbierto}
      onClick={() => setCajonAbierto(!cajonAbierto)}
      className={cn(
        "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar md:hidden",
        className,
      )}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" focusable="false">
          <path
            d="M2 4h12M2 8h12M2 12h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}

export type AppShellNavProps = React.ComponentProps<"nav">;

/**
 * Navegación lateral. Por encima del breakpoint vive en el flujo; por debajo se
 * convierte en un cajón que entra desde el borde.
 *
 * Queda montado aunque esté cerrado, ya que desmontarlo se lleva por delante la
 * animación de salida. `inert` lo saca del tabulador mientras no se ve.
 */
function AppShellNav({ className, children, ...props }: AppShellNavProps) {
  const { cajonAbierto, setCajonAbierto } = useAppShell("AppShellNav");
  const cerrar = useElLabel("ui", "closeNavigation", "Cerrar navegación");

  const contenido = (
    <nav
      data-slot="app-shell-nav"
      className={cn(
        "flex w-60 shrink-0 flex-col gap-1 overflow-y-auto border-e border-sidebar-border bg-sidebar p-3 text-sidebar-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  );

  return (
    <>
      <div className="hidden md:flex">{contenido}</div>

      <div
        inert={!cajonAbierto}
        data-slot="app-shell-nav-drawer"
        className={cn("absolute inset-0 z-40 md:hidden", !cajonAbierto && "pointer-events-none")}
      >
        <button
          type="button"
          aria-label={cerrar}
          onClick={() => setCajonAbierto(false)}
          className={cn(
            "absolute inset-0 cursor-default bg-black/50 transition-opacity duration-(--duration-base) ease-out",
            cajonAbierto ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          onClick={(e) => {
            /* Un clic en un enlace cierra; plegar una sección, no. */
            if ((e.target as HTMLElement).closest("a")) setCajonAbierto(false);
          }}
          className={cn(
            "absolute inset-y-0 start-0 flex transition-transform duration-(--duration-slow) ease-out",
            cajonAbierto ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {contenido}
        </div>
      </div>
    </>
  );
}

export type AppShellNavSectionProps = React.ComponentProps<"li"> & {
  title: React.ReactNode;
  defaultOpen?: boolean;
};

/**
 * Grupo plegable de entradas.
 *
 * El plegado va con `grid-template-rows`, que sí interpola de 0 a auto, en vez
 * de `Collapsible`: aquel desmonta el contenido al cerrar y con eso pierde el
 * fotograma de salida.
 */
function AppShellNavSection({
  className,
  title,
  defaultOpen = true,
  children,
  ...props
}: AppShellNavSectionProps) {
  const [abierta, setAbierta] = React.useState(defaultOpen);
  const idPanel = React.useId();

  return (
    <li data-slot="app-shell-nav-section" className={cn("list-none pb-2", className)} {...props}>
      <button
        type="button"
        data-slot="app-shell-nav-section-trigger"
        aria-expanded={abierta}
        aria-controls={idPanel}
        onClick={() => setAbierta((v) => !v)}
        className="group flex w-full cursor-pointer items-center rounded-md px-2 py-1 text-sm font-semibold text-sidebar-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
      >
        <span>{title}</span>
        {/* El caret gira al abrir y se corre un pixel al pasar por encima. Es un
            trazo de 5x8, más fino que un icono del catálogo, porque acompaña a
            un rótulo y no es un objetivo por su cuenta. */}
        <ChevronRight
          aria-hidden="true"
          className="mx-1.5 size-3 shrink-0 transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-px group-aria-expanded:rotate-90"
        />
      </button>
      <div
        id={idPanel}
        data-abierta={abierta ? "" : undefined}
        className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-(--duration-base) ease-out data-abierta:grid-rows-[1fr]"
      >
        <ul className="overflow-hidden">{children}</ul>
      </div>
    </li>
  );
}

type Guia = "linea" | "puntero" | "linea-puntero" | "union";

/**
 * Guía de continuidad entre una entrada y sus hijas.
 *
 * Baja desde el icono del padre y, en la hija activa, dobla en codo y remata en
 * punta de flecha. Un borde izquierdo plano diría "estas van juntas"; el codo
 * además dice cuál de ellas es la que se está viendo.
 *
 * Va en SVG y no como imagen de fondo para que el trazo tome `currentColor` y
 * siga al tema.
 */
function GuiaNav({ variante }: { variante: Guia }) {
  const conLinea = variante === "linea" || variante === "linea-puntero";
  const conPuntero = variante === "puntero" || variante === "linea-puntero";

  return (
    <svg
      width="21"
      height="28"
      viewBox="0 0 21 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute top-0 start-2 text-sidebar-border"
    >
      {conLinea ? <path d="M9 0H10.5V28H9V0Z" fill="currentColor" /> : null}
      {variante === "puntero" ? (
        <path
          d="M9 0H10.5V10.2A4.05 4.05 0 0 0 14.55 14.25H19V15.75H14.55A5.55 5.55 0 0 1 9 10.2Z"
          fill="currentColor"
        />
      ) : null}
      {variante === "linea-puntero" ? (
        <path
          d="M10.5 10.2A4.05 4.05 0 0 0 14.55 14.25H19V15.75H14.55A5.55 5.55 0 0 1 9 10.2Z"
          fill="currentColor"
        />
      ) : null}
      {conPuntero ? (
        <path
          d="M17 12L20 15L17 18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      {variante === "union" ? (
        <path
          d="M9 24.75C9 24.3358 9.33579 24 9.75 24C10.1642 24 10.5 24.3358 10.5 24.75V28H9V24.75Z"
          fill="currentColor"
        />
      ) : null}
    </svg>
  );
}

export type AppShellNavSubItemProps = React.ComponentProps<"a"> & {
  active?: boolean;
};

/**
 * Hija de una entrada. La guía la decide `AppShellNavSubList`, que es quien sabe
 * la posición de cada una y cuál está activa.
 */
function AppShellNavSubItem({
  className,
  active,
  children,
  ...props
}: AppShellNavSubItemProps & { "data-guia"?: Guia }) {
  const { "data-guia": guia, ...resto } = props as AppShellNavSubItemProps & { "data-guia"?: Guia };

  return (
    <li className="relative list-none">
      {guia ? <GuiaNav variante={guia} /> : null}
      <a
        data-slot="app-shell-nav-sub-item"
        aria-current={active ? "page" : undefined}
        className={cn(
          "ms-7 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
          "aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-semibold aria-[current=page]:text-sidebar-accent-foreground",
          className,
        )}
        {...resto}
      >
        <span className="min-w-0 truncate">{children}</span>
      </a>
    </li>
  );
}

export type AppShellNavSubListProps = React.ComponentProps<"ul">;

/**
 * Lista de hijas. Reparte la guía según la posición: las anteriores a la activa
 * llevan línea, y la activa dobla en codo. Si es la última, el codo sustituye a
 * la línea en vez de sumarse, para que la vertical no siga hacia la nada.
 */
function AppShellNavSubList({ className, children, ...props }: AppShellNavSubListProps) {
  const hijas = React.Children.toArray(children).filter(React.isValidElement);
  const activa = hijas.findIndex((h) => (h.props as AppShellNavSubItemProps).active === true);

  return (
    <ul data-slot="app-shell-nav-sub-list" className={cn("relative", className)} {...props}>
      {hijas.map((h, i) => {
        let guia: Guia = "linea";
        if (i === activa) guia = i === hijas.length - 1 ? "puntero" : "linea-puntero";
        else if (activa === -1 && i === hijas.length - 1) guia = "union";
        return React.cloneElement(h as React.ReactElement<{ "data-guia": Guia }>, {
          key: h.key ?? i,
          "data-guia": guia,
        });
      })}
    </ul>
  );
}

export type AppShellNavItemProps = React.ComponentProps<"a"> & {
  active?: boolean;
  icon?: React.ReactNode;
};

/** Entrada de navegación. `active` la marca con `aria-current="page"`. */
function AppShellNavItem({ className, active, icon, children, ...props }: AppShellNavItemProps) {
  return (
    <li className="list-none">
      <a
        data-slot="app-shell-nav-item"
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
          "aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-semibold aria-[current=page]:text-sidebar-accent-foreground",
          className,
        )}
        {...props}
      >
        {icon ? (
          <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>
        ) : null}
        <span className="min-w-0 truncate">{children}</span>
      </a>
    </li>
  );
}

export type AppShellMainProps = React.ComponentProps<"main">;

/**
 * Área de contenido.
 *
 * Con el cajón abierto queda detrás del velo, así que sale del tabulador y del
 * árbol de accesibilidad. La cabecera se queda alcanzable a propósito, que ahí
 * vive el botón que cierra.
 */
function AppShellMain({ className, children, ...props }: AppShellMainProps) {
  const { cajonAbierto } = useAppShell("AppShellMain");

  return (
    <main
      data-slot="app-shell-main"
      inert={cajonAbierto}
      className={cn("flex min-w-0 flex-1 flex-col overflow-y-auto bg-background", className)}
      {...props}
    >
      {children}
    </main>
  );
}

export {
  AppShell,
  AppShellHeader,
  AppShellNav,
  AppShellNavToggle,
  AppShellNavSection,
  AppShellNavItem,
  AppShellNavSubList,
  AppShellNavSubItem,
  AppShellMain,
};
