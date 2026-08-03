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
        "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-sidebar-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar md:hidden",
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
        "flex w-60 shrink-0 flex-col overflow-y-auto border-e border-sidebar-border bg-sidebar py-3 text-sidebar-foreground",
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

export type AppShellNavSectionProps = Omit<React.ComponentProps<"li">, "title"> & {
  title: React.ReactNode;

  /**
   * Convierte el rótulo en acción y le pone un caret al final. El caret no gira:
   * no despliega nada, lleva a otro sitio. Sin esto el rótulo es solo un
   * encabezado.
   */
  onAction?: () => void;
};

/**
 * Grupo de entradas con su rótulo.
 *
 * El rótulo no pliega el grupo. En un marco de aplicación las secciones se ven
 * enteras, y el caret que Shopify pone al lado es un acceso a otra pantalla, no
 * un disclosure: por eso apunta siempre en la misma dirección.
 */
function AppShellNavSection({
  className,
  title,
  onAction,
  children,
  ...props
}: AppShellNavSectionProps) {
  /* Un punto por debajo del resto de la barra y en tono tenue: el rótulo
     ordena, no compite con las entradas que agrupa. El margen sube a 6px para
     que la fila siga midiendo 28px con un interlineado de 16. */
  const rotulo = (claseExtra?: string) => (
    <span className={cn("my-1.5 min-w-0 truncate text-start", claseExtra)}>{title}</span>
  );

  const ROTULO = "ps-2 text-xs font-medium text-muted-foreground";

  return (
    <li data-slot="app-shell-nav-section" className={cn("list-none pt-3", className)} {...props}>
      <div className="px-3">
        {onAction ? (
          <button
            type="button"
            data-slot="app-shell-nav-section-action"
            onClick={onAction}
            className={cn(
              FILA,
              ROTULO,
              "cursor-pointer hover:bg-sidebar-hover hover:text-sidebar-foreground",
            )}
          >
            {rotulo()}
            {/* El caret va pegado al rótulo, no al borde: es parte de la
                etiqueta, no un control alineado a la derecha. Se dibuja aquí en
                vez de tomar un icono del catálogo porque los del catálogo son
                cuadrados y este mide 5x8: encogerlo a 8 de alto lo deja en 8 de
                ancho y el trazo se vuelve un ángulo achatado. */}
            <span className="mx-1.5 flex h-7 flex-none items-center justify-center">
              <svg width="5" height="8" viewBox="0 0 5 8" fill="none" aria-hidden="true">
                <path
                  d="M1 1L4 4L1 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        ) : (
          <p data-slot="app-shell-nav-section-title" className={cn(FILA, ROTULO)}>
            {rotulo("flex-1")}
          </p>
        )}
      </div>
      <ul className="list-none">{children}</ul>
    </li>
  );
}

/**
 * Tramo de guía que le toca a una hija según dónde cae respecto de la activa.
 *
 * - `linea`: queda por encima de la activa, así que la vertical la atraviesa.
 * - `puntero`: es la activa. La vertical llega hasta el codo y ahí termina.
 * - `ninguna`: queda por debajo de la activa. La rama ya acabó.
 */
type Guia = "linea" | "puntero" | "ninguna";

/* La fila mide 28px exactos y la guía también, así que una encaja sobre la otra
   sin cuadrar nada a mano. La altura sale del margen del texto, no de un padding
   en la fila: con padding, el fondo del estado activo crecería con ella. */
const FILA =
  "relative flex w-full items-start rounded-md pe-1 text-sm transition-[background-color,color] duration-(--duration-fast) ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar";

const VERTICAL = "M9 0H10.5V28H9V0Z";
const CODO = "M10.5 10.2A4.05 4.05 0 0 0 14.55 14.25H19V15.75H14.55A5.55 5.55 0 0 1 9 10.2Z";
const BAJADA_Y_CODO =
  "M9 0H10.5V10.2A4.05 4.05 0 0 0 14.55 14.25H19V15.75H14.55A5.55 5.55 0 0 1 9 10.2Z";
const ASOMO_Y_CODO =
  "M9 7H10.5V10.2A4.05 4.05 0 0 0 14.55 14.25H19V15.75H14.55A5.55 5.55 0 0 1 9 10.2Z";
const PUNTA = "M17 12L20 15L17 18";
const MUNON =
  "M9 24.75C9 24.3358 9.33579 24 9.75 24C10.1642 24 10.5 24.3358 10.5 24.75V28H9V24.75Z";

/**
 * Guía de continuidad entre una entrada y sus hijas.
 *
 * Baja desde el icono del padre y dobla en codo sobre la hija activa. Un borde
 * izquierdo plano diría "estas van juntas"; el codo además dice cuál se está
 * viendo, y por eso la vertical no lo pasa de largo: donde dobla, se acaba.
 *
 * Al apuntar una hija que no es la activa se dibuja el codo que tendría si lo
 * fuera, en un tono más claro. Sobre las que sostienen la vertical el codo se
 * suma, porque quitarla cortaría la rama que sigue hacia abajo; sobre las de más
 * abajo, que no tienen ninguna, sale un asomo corto en su lugar.
 *
 * La caja mide 21x28, la misma altura que una fila, y se ancla a 8px del borde
 * para que su vertical caiga sobre el centro del icono del padre.
 */
function GuiaNav({ variante }: { variante: Guia | "munion" }) {
  const alApuntar = "opacity-0 transition-opacity duration-(--duration-fast) ease-out";

  return (
    <svg
      width="21"
      height="28"
      viewBox="0 0 21 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute top-0 start-2"
    >
      {variante === "linea" ? <path d={VERTICAL} className="fill-sidebar-guide" /> : null}
      {variante === "puntero" ? (
        <>
          <path d={BAJADA_Y_CODO} className="fill-sidebar-guide" />
          <path
            d={PUNTA}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-sidebar-guide"
          />
        </>
      ) : null}

      {variante === "linea" || variante === "ninguna" ? (
        <g className={cn(alApuntar, "group-hover:opacity-100 group-focus-visible:opacity-100")}>
          <path
            d={variante === "linea" ? CODO : ASOMO_Y_CODO}
            className="fill-sidebar-guide-hover"
          />
          <path
            d={PUNTA}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-sidebar-guide-hover"
          />
        </g>
      ) : null}

      {/* Muñón: el arranque de la vertical, en la fila del padre. Sin él, la
          línea de las hijas nace despegada del icono del que cuelga. */}
      {variante === "munion" ? <path d={MUNON} className="fill-sidebar-guide" /> : null}
    </svg>
  );
}

export type AppShellNavSubItemProps = React.ComponentProps<"a"> & {
  active?: boolean;
};

/**
 * Hija de una entrada. La sangria de 36px alinea su texto con el del padre, que
 * arranca despues del icono. La guia la reparte `AppShellNavSubList`.
 */
function AppShellNavSubItem({ className, active, children, ...props }: AppShellNavSubItemProps) {
  const { "data-guia": guia = "ninguna", ...resto } = props as AppShellNavSubItemProps & {
    "data-guia"?: Guia;
  };

  return (
    <li className="list-none px-3">
      <a
        data-slot="app-shell-nav-sub-item"
        aria-current={active ? "page" : undefined}
        className={cn(
          FILA,
          "group ps-9",
          active
            ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
            : "font-normal text-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground active:bg-sidebar-accent",
          className,
        )}
        {...resto}
      >
        <GuiaNav variante={guia} />
        <span className="my-1 min-w-0 flex-1 truncate">{children}</span>
      </a>
    </li>
  );
}

export type AppShellNavSubListProps = React.ComponentProps<"ul">;

/**
 * Lista de hijas. Reparte la guía según dónde cae cada una respecto de la
 * activa: la vertical baja del padre, atraviesa las de encima y dobla en codo
 * sobre la activa. Las de debajo no llevan nada, porque la rama ya terminó.
 *
 * Sin hija activa no hay a dónde llegar, así que no se dibuja ninguna vertical.
 */
function AppShellNavSubList({ className, children, ...props }: AppShellNavSubListProps) {
  const hijas = React.Children.toArray(children).filter(React.isValidElement);
  const activa = hijas.findIndex((h) => (h.props as AppShellNavSubItemProps).active === true);

  return (
    <ul data-slot="app-shell-nav-sub-list" className={cn("mb-2 list-none", className)} {...props}>
      {hijas.map((h, i) => {
        const guia: Guia =
          activa === -1 || i > activa ? "ninguna" : i === activa ? "puntero" : "linea";
        return React.cloneElement(h as React.ReactElement<{ "data-guia"?: Guia }>, {
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

  /**
   * De esta entrada cuelga una lista con una hija activa.
   *
   * Dibuja el arranque de la guía, y nada más: lo elegido es la hija, y marcar
   * también al padre pone dos filas con el mismo aspecto de seleccionado. Quien
   * dice de dónde cuelga es la guía. Se pide que la hija esté activa, y no solo
   * que haya lista, porque sin hija activa no hay guía debajo y el arranque
   * quedaría colgando de nada.
   */
  childActive?: boolean;
};

/** Entrada de navegacion. `active` la marca con `aria-current="page"`. */
function AppShellNavItem({
  className,
  active,
  icon,
  childActive,
  children,
  ...props
}: AppShellNavItemProps) {
  return (
    <li className="list-none px-3">
      <a
        data-slot="app-shell-nav-item"
        aria-current={active ? "page" : undefined}
        className={cn(
          FILA,
          /* El peso no cambia al elegirla: la de primer nivel se marca solo con
             el fondo. Solo las hijas suben de peso, porque ahí el fondo tiene
             que competir con la guía y no basta por sí solo. */
          "ps-2 font-medium",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-hover active:bg-sidebar-accent",
          className,
        )}
        {...props}
      >
        {childActive ? <GuiaNav variante="munion" /> : null}
        {icon ? (
          <span
            aria-hidden="true"
            className="my-1 me-2 flex size-5 flex-none items-center justify-center [&_svg]:size-4"
          >
            {icon}
          </span>
        ) : null}
        <span className="my-1 min-w-0 flex-1 truncate">{children}</span>
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
