import * as React from "react";

import { Avatar, AvatarFallback } from "./avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu";
import { Kbd } from "./kbd";

import { cn } from "@/lib/cn";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { useElLabel } from "@/lib/i18n";

/* Los iconos propios de la barra se dibujan aquí y no se toman del catálogo,
   igual que el de plegar y el caret de sección: son parte del chasis, no
   contenido que quien la use elija, y así el marco no arrastra una dependencia
   de iconos para tres trazos. */
const Lupa = () => (
  <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true" focusable="false">
    <circle cx="7" cy="7" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.2 10.2L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/* ------------------------------------------------------------------ *
 * Marco
 * ------------------------------------------------------------------ */

type AppShellContextValue = {
  cajonAbierto: boolean;
  setCajonAbierto: (abierto: boolean) => void;

  /** Por debajo del breakpoint, que es donde el cajón existe. */
  esMovil: boolean;
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
 * El cajón y su velo cuelgan de la fila de contenido y no de la ventana, de modo
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
  const esMovil = useIsMobile();

  const setCajonAbierto = React.useCallback(
    (siguiente: boolean) => {
      if (!controlado) setInterno(siguiente);
      onNavOpenChange?.(siguiente);
    },
    [controlado, onNavOpenChange],
  );

  /* El cajón solo existe por debajo del breakpoint. Al pasar de ahí desaparece,
     y si siguiera abierto dejaría el contenido inerte sin nada que lo tape.
     Se mira el ancho de verdad y no solo su cambio: antes se escuchaba el
     evento `change` de la media query, que no se dispara al montar, así que
     montar con el cajón abierto por encima de 768px dejaba el contenido inerte
     para siempre, inalcanzable y a la vista. */
  React.useEffect(() => {
    if (abierto && !esMovil) setCajonAbierto(false);
  }, [abierto, esMovil, setCajonAbierto]);

  React.useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCajonAbierto(false);
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [abierto, setCajonAbierto]);

  const ctx = React.useMemo(
    () => ({ cajonAbierto: abierto, setCajonAbierto, esMovil }),
    [abierto, setCajonAbierto, esMovil],
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

/**
 * Barra superior. Queda fuera del área que el cajón cubre, a propósito.
 *
 * Va en oscuro, y no pintada de negro: `data-theme="dark"` redefine los tokens
 * sobre el propio elemento, así que dentro de la cabecera `bg-background` es el
 * fondo oscuro, `text-foreground` el texto claro y `bg-card` las superficies que
 * se levantan de él. Es una isla con su tema, no un color suelto, y por eso
 * sigue funcionando cuando la aplicación entera se pone en oscuro: allí la
 * cabecera ya estaba en oscuro y no cambia nada.
 *
 * Sin filete inferior: con este contraste la línea sobra, y en oscuro sobre
 * oscuro solo ensucia el borde.
 *
 * Reparte sus tres bandas por sí misma, buscando `AppShellHeaderBrand`,
 * `AppShellHeaderSearch` y `AppShellHeaderActions` entre sus hijos, así que el
 * orden en que se escriban da igual. Antes era una fila vacía y cada pantalla
 * se inventaba la rejilla, el buscador y la ficha de usuario; a la segunda
 * pantalla ya no se parecían.
 *
 * Las dos bandas de los lados valen `1fr`, de modo que miden lo mismo y el
 * buscador queda centrado en la ventana aunque el nombre crezca. Con el
 * buscador simplemente estirado, su centro se movería con lo que haya a los
 * costados.
 *
 * ```tsx
 * <AppShellHeader>
 *   <AppShellHeaderBrand>
 *     <AppShellNavToggle />
 *     <Text size="lg" weight="bold">Calumet</Text>
 *   </AppShellHeaderBrand>
 *   <AppShellHeaderSearch shortcut={["Ctrl", "K"]} onClick={abrirBuscador}>
 *     Buscar
 *   </AppShellHeaderSearch>
 *   <AppShellHeaderActions>
 *     <AppShellHeaderAction label="Notificaciones" icon={<Campana />} onClick={…} />
 *     <AppShellUserMenu name="Juan D." initials="JD">…</AppShellUserMenu>
 *   </AppShellHeaderActions>
 * </AppShellHeader>
 * ```
 */
function AppShellHeader({ className, children, ...props }: AppShellHeaderProps) {
  const bandas: Record<string, React.ReactNode[]> = { marca: [], buscador: [], acciones: [] };
  const sueltos: React.ReactNode[] = [];

  React.Children.forEach(children, (hijo) => {
    const tipo = React.isValidElement(hijo) ? (hijo.type as { displayName?: string }) : null;
    if (tipo?.displayName === "AppShellHeaderBrand") bandas.marca.push(hijo);
    else if (tipo?.displayName === "AppShellHeaderSearch") bandas.buscador.push(hijo);
    else if (tipo?.displayName === "AppShellHeaderActions") bandas.acciones.push(hijo);
    else sueltos.push(hijo);
  });

  return (
    <header
      data-slot="app-shell-header"
      data-theme="dark"
      /* Los lados van en `1fr`, que es `minmax(auto,1fr)`, y no en
         `minmax(0,1fr)`. Con mínimo cero el centro gana: es una pista de tamaño
         fijo y se reparte antes que las `fr`, así que se llevaba el ancho entero
         y las dos bandas colapsaban a cero con su contenido desbordando fuera.
         Con `auto` ninguna baja de su contenido, el centro se queda con lo que
         sobra, y como los dos lados piden lo mismo el buscador cae en el medio
         de la ventana. */
      /* Por debajo del breakpoint no hay tres bandas sino una fila con un solo
         hueco. Centrar el buscador en la ventana solo tiene sentido cuando
         sobra ancho; en estrecho lo que se nota es el ritmo, y con la rejilla el
         hueco entre bandas y el de dentro del grupo de acciones no eran el
         mismo, así que la barra se leía a saltos. */
      className={cn(
        "flex h-14 shrink-0 items-center gap-2 bg-background px-4 text-foreground",
        "md:grid md:grid-cols-[1fr_minmax(0,420px)_1fr] md:gap-4",
        className,
      )}
      {...props}
    >
      {/* Las bandas se pintan siempre, aunque vayan vacías: son las que
          sostienen la rejilla. Sin la del medio, el buscador de otra pantalla
          caería en otra columna. */}
      {/* Las de los lados no llevan `min-w-0`, y es a propósito: ponerlo anula
          el mínimo automático de su pista, y entonces el centro, que es de
          tamaño fijo y se reparte antes que las `fr`, se lleva el ancho entero
          y las deja en cero con su contenido desbordando fuera de la barra.
          Quien encoge es el texto de dentro, no la banda. */}
      <div data-slot="app-shell-header-start" className="flex items-center gap-3">
        {bandas.marca}
        {sueltos}
      </div>
      {/* En la fila estrecha es la banda que crece y se queda con lo que sobra;
          dentro de la rejilla el `flex-1` no pinta nada y manda la pista. */}
      <div
        data-slot="app-shell-header-center"
        className="flex min-w-0 flex-1 items-center justify-center"
      >
        {bandas.buscador}
      </div>
      <div data-slot="app-shell-header-end" className="flex items-center justify-end gap-2">
        {bandas.acciones}
      </div>
    </header>
  );
}
AppShellHeader.displayName = "AppShellHeader";

export type AppShellHeaderBrandProps = React.ComponentProps<"div">;

/**
 * El logo y el nombre.
 *
 * Se va donde no cabe, y por eso el botón del cajón no vive aquí sino suelto en
 * la cabecera: ese se queda siempre. En una pantalla estrecha la marca es lo que
 * menos falta hace, quien abrió la aplicación ya sabe en cuál está, y ese sitio
 * es la diferencia entre un buscador que se usa y uno de sesenta píxeles.
 */
function AppShellHeaderBrand({ className, ...props }: AppShellHeaderBrandProps) {
  return (
    <div
      data-slot="app-shell-header-brand"
      className={cn("hidden min-w-0 items-center gap-3 md:flex", className)}
      {...props}
    />
  );
}
AppShellHeaderBrand.displayName = "AppShellHeaderBrand";

export type AppShellHeaderSearchProps = Omit<React.ComponentProps<"button">, "onClick"> & {
  /** El atajo que lo abre, tecla por tecla. Solo se dibuja donde hay sitio. */
  shortcut?: string[];

  /** Obligatorio: un buscador que no abre nada es un adorno con forma de campo. */
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

/**
 * El disparador de la búsqueda.
 *
 * Es un botón y no un campo, aunque lo parezca. Lo que abre es una paleta de
 * comandos con su propio campo dentro, así que escribir aquí no llevaría a
 * ninguna parte, y por eso lleva el atajo dibujado: dice que hay otra manera de
 * llegar. Para un campo de búsqueda de verdad está `SearchField`.
 *
 * Mide 32px, como el resto de los controles de la barra.
 *
 * Donde no cabe se queda en la lupa sola, del ancho de una acción. Estirado a lo
 * que sobre acababa en veintipocos píxeles, que no es un buscador estrecho sino
 * un icono recortado. El rótulo no se va del árbol de accesibilidad, solo deja
 * de verse.
 */
function AppShellHeaderSearch({
  className,
  children,
  shortcut,
  ...props
}: AppShellHeaderSearchProps) {
  return (
    <button
      type="button"
      data-slot="app-shell-header-search"
      /* Las piezas de la cabecera usan `bg-card`, la superficie que se levanta
         bajo su tema oscuro, más un borde: contra un fondo casi negro, 0.044 de
         diferencia de luminosidad no alcanzan a dibujar la caja, y lo que la
         define es el contorno. */
      className={cn(
        "flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border bg-card text-muted-foreground transition-[background-color,border-color] duration-(--duration-fast) ease-out hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "w-full px-3",
        className,
      )}
      {...props}
    >
      <Lupa />
      <span className="min-w-0 flex-1 truncate text-start text-sm">{children}</span>
      {shortcut?.length ? (
        <span className="hidden items-center gap-1 md:inline-flex">
          {shortcut.map((tecla) => (
            <Kbd key={tecla}>{tecla}</Kbd>
          ))}
        </span>
      ) : null}
    </button>
  );
}
AppShellHeaderSearch.displayName = "AppShellHeaderSearch";

export type AppShellHeaderActionsProps = React.ComponentProps<"div">;

/**
 * Banda del final: las acciones sueltas y, al final de todas, el menú de la
 * cuenta.
 *
 * Ese orden importa. El menú de la cuenta es el ancla de la esquina y no se
 * mueve de pantalla a pantalla; las acciones cambian según dónde estés, así que
 * si fueran las últimas, el menú bailaría de sitio cada vez.
 */
function AppShellHeaderActions({ className, ...props }: AppShellHeaderActionsProps) {
  return (
    <div
      data-slot="app-shell-header-actions"
      /* El mismo hueco que separa las bandas, para que la barra lleve un solo
         ritmo: con las acciones a 4px y todo lo demás a 16, el grupo del final
         se leía apretado contra el resto. Se encoge donde no hay sitio, que es
         donde esos píxeles se los quita al buscador. */
      className={cn("flex min-w-0 items-center gap-2 md:gap-4", className)}
      {...props}
    />
  );
}
AppShellHeaderActions.displayName = "AppShellHeaderActions";

export type AppShellHeaderActionProps = Omit<React.ComponentProps<"button">, "children"> & {
  /** Nombre del control. Obligatorio: solo se ve el icono. */
  label: string;

  icon: React.ReactNode;
};

/**
 * Una acción de la cabecera: notificaciones, ayuda, lo que acompañe.
 *
 * Solo icono, así que el nombre va en `label` y no es opcional: sin él un lector
 * de pantalla anuncia «botón» y nada más.
 *
 * La caja la pone el componente, de 32px con el icono en 20, para que varias
 * seguidas queden a la misma altura que el buscador y que el menú de la cuenta.
 */
function AppShellHeaderAction({ className, label, icon, ...props }: AppShellHeaderActionProps) {
  return (
    <button
      type="button"
      data-slot="app-shell-header-action"
      aria-label={label}
      className={cn(
        "inline-flex size-8 flex-none cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:size-5",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
AppShellHeaderAction.displayName = "AppShellHeaderAction";

export type AppShellUserMenuProps = {
  /** Nombre de quien entró. Se esconde donde no cabe, pero sigue anunciándose. */
  name: string;

  /** Debajo del nombre dentro del menú: la organización, el correo, el rol. */
  detail?: string;

  /** Dos letras, cuando no hay foto. */
  initials?: string;

  /** Una foto, que sustituye a las iniciales. */
  avatar?: React.ReactNode;

  className?: string;

  /** Lo que se despliega: `DropdownMenuItem` y compañía. */
  children: React.ReactNode;
};

/**
 * La cuenta, al final de la cabecera.
 *
 * Es un menú de verdad y no una ficha decorativa. Dibujada con borde y fondo
 * pide que la pulses, así que si no despliega nada el aspecto miente.
 *
 * El nombre desaparece donde no cabe pero no se quita del árbol de
 * accesibilidad: en una pantalla estrecha se ven dos iniciales, que no dicen de
 * quién es la sesión.
 */
function AppShellUserMenu({
  name,
  detail,
  initials,
  avatar,
  className,
  children,
}: AppShellUserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-slot="app-shell-user-menu"
          /* Donde el nombre no cabe se queda el avatar suelto: una caja con
             borde alrededor de dos letras no dibuja nada que el propio avatar
             no dibuje ya. */
          className={cn(
            "flex h-8 flex-none cursor-pointer items-center gap-2 rounded-md text-foreground transition-[background-color,border-color] duration-(--duration-fast) ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:border md:border-border md:bg-card md:ps-2.5 md:pe-1 md:hover:border-border-strong",
            className,
          )}
        >
          <span className="hidden max-w-32 truncate text-sm font-semibold md:inline">{name}</span>
          <span className="sr-only md:hidden">{name}</span>
          <Avatar size="xs" shape="square" className="border-0">
            {avatar ?? (
              <AvatarFallback className="bg-primary font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {/* La cabecera es una franja y no una entrada más: fondo tenue, de
            borde a borde y hasta las esquinas de arriba. Los márgenes negativos
            cancelan el relleno del menú, y el radio es el suyo menos el píxel
            del borde, que si no la esquina teñida asoma por fuera de la curva.
            Sin fondo, quién eres se leía como una opción del menú que resulta
            que no se puede pulsar. */}
        <div className="-mx-1 -mt-1 mb-1 flex items-center gap-2.5 rounded-t-[11px] border-b border-border bg-muted px-3 py-2.5">
          <Avatar size="sm" shape="square" className="border-0">
            {avatar ?? (
              <AvatarFallback className="bg-primary font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">{name}</span>
            {detail ? (
              <span className="truncate text-xs text-muted-foreground">{detail}</span>
            ) : null}
          </span>
        </div>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
AppShellUserMenu.displayName = "AppShellUserMenu";

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
      /* Sin fondo propio: es un icono en la barra, como los demás, y el fondo
         solo aparece al apuntarlo. Con `bg-card` fijo se dibujaba un cuadrado
         alrededor que no lleva ningún otro control de la cabecera.
         Vive dentro de la cabecera, que tiene su propio tema, así que usa los
         tokens generales y no los de la barra lateral: ahí `--sidebar` resolvería
         en oscuro y quedaría casi negro sobre casi negro. */
      className={cn(
        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden",
        className,
      )}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 16 16" className="size-5" aria-hidden="true" focusable="false">
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

export type AppShellNavProps = React.ComponentProps<"nav"> & {
  /**
   * Nombre del landmark. Una página puede tener varios `<nav>` (el lateral, uno
   * de migas, otro al pie) y sin nombre un lector de pantalla los lista todos
   * como «navegación» sin poder distinguirlos.
   */
  label?: string;
};

/**
 * Navegación lateral. Por encima del breakpoint vive en el flujo; por debajo se
 * convierte en un cajón que entra desde el borde.
 *
 * Es un solo `<nav>` y no uno por cada forma. Antes se montaba el mismo dos
 * veces, uno para escritorio y otro dentro del cajón, así que cualquier `id`
 * que se le pasara salía duplicado en el documento y había dos landmarks de
 * navegación donde solo hay una. Lo que cambia entre las dos formas es
 * posicionamiento, y para eso basta el breakpoint.
 *
 * Queda montado aunque esté cerrado, ya que desmontarlo se lleva por delante la
 * animación de salida. `inert` lo saca del tabulador mientras no se ve, y solo
 * donde el cajón existe: por encima del breakpoint está siempre a la vista.
 *
 * El pie, si lo hay, se queda fijo abajo y solo se desplaza lo de en medio.
 */
function AppShellNav({ className, children, label, ...props }: AppShellNavProps) {
  const { cajonAbierto, setCajonAbierto, esMovil } = useAppShell("AppShellNav");
  const cerrar = useElLabel("ui", "closeNavigation", "Cerrar navegación");
  const etiqueta = useElLabel("ui", "navigation", "Navegación");

  const pie: React.ReactNode[] = [];
  const resto: React.ReactNode[] = [];
  React.Children.forEach(children, (hijo) => {
    const tipo = React.isValidElement(hijo) ? (hijo.type as { displayName?: string }) : null;
    if (tipo?.displayName === "AppShellNavFooter") pie.push(hijo);
    else resto.push(hijo);
  });

  return (
    <>
      {/* El velo solo existe donde hay cajón. Va antes del `<nav>` en el
          documento para que quede por debajo sin tener que apilarlos. */}
      <button
        type="button"
        aria-label={cerrar}
        tabIndex={cajonAbierto ? undefined : -1}
        aria-hidden={cajonAbierto ? undefined : true}
        onClick={() => setCajonAbierto(false)}
        className={cn(
          "absolute inset-0 z-overlay cursor-default bg-black/50 transition-opacity duration-(--duration-base) ease-out md:hidden",
          cajonAbierto ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <nav
        data-slot="app-shell-nav"
        aria-label={label ?? etiqueta}
        inert={esMovil && !cajonAbierto}
        onClick={(e) => {
          /* Un clic en un enlace cierra el cajón; plegar un grupo, no. Solo
             donde hay cajón: en escritorio no hay nada que cerrar. */
          if (esMovil && (e.target as HTMLElement).closest("a")) setCajonAbierto(false);
        }}
        /* Lo del cajón va acotado a `max-md` y no compensado con `md:` encima.
           Escrito al revés, el `rtl:` de la posición cerrada le ganaba al
           `md:translate-x-0` que debía anularlo (los dos pesan igual y decide el
           orden del fichero), y en escritorio RTL la barra se iba entera fuera
           del marco. Por debajo del breakpoint no hay nada que anular. */
        className={cn(
          "flex w-60 shrink-0 flex-col overflow-hidden border-e border-sidebar-border bg-sidebar py-3 text-sidebar-foreground",
          "max-md:absolute max-md:inset-y-0 max-md:start-0 max-md:z-overlay max-md:transition-transform max-md:duration-(--duration-slow) max-md:ease-out",
          cajonAbierto
            ? "max-md:translate-x-0"
            : "max-md:-translate-x-full max-md:rtl:translate-x-full",
          className,
        )}
        {...props}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">{resto}</div>
        {pie}
      </nav>
    </>
  );
}

export type AppShellNavFooterProps = React.ComponentProps<"div">;

/**
 * Zona fija al pie de la navegación, donde va lo que no es una pantalla más:
 * ajustes, la cuenta, cambiar de organización.
 *
 * Se queda abajo aunque la lista de arriba se desplace, que es la razón de que
 * exista: metido en la lista, con veinte entradas por encima, habría que bajar
 * a buscarlo.
 */
function AppShellNavFooter({ className, children, ...props }: AppShellNavFooterProps) {
  return (
    <div
      data-slot="app-shell-nav-footer"
      className={cn("mt-2 shrink-0 border-t border-sidebar-border pt-2", className)}
      {...props}
    >
      <ul className="list-none">{children}</ul>
    </div>
  );
}
AppShellNavFooter.displayName = "AppShellNavFooter";

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
 * El rótulo no pliega el grupo: en un marco de aplicación las secciones se ven
 * enteras. El caret que puede llevar al lado es un acceso a otra pantalla y no
 * un disclosure, y por eso apunta siempre en la misma dirección.
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
 *
 * En RTL se refleja entera. La posición ya iba con propiedades lógicas, pero el
 * dibujo no: el codo salía del centro hacia la derecha y la punta apuntaba
 * hacia allá, de modo que en árabe o hebreo la rama nacía del lado equivocado y
 * señalaba fuera de la barra. Reflejar la caja sobre su propio eje deja la
 * vertical donde estaba, a 8px del inicio, porque está a la misma distancia de
 * los dos costados.
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
      className="pointer-events-none absolute top-0 start-2 rtl:-scale-x-100"
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

/* ------------------------------------------------------------------ *
 * Grupo: una entrada con hijas
 * ------------------------------------------------------------------ */

type GrupoContextValue = {
  idLista: string;
  abierto: boolean;
  alternar: () => void;
};

const GrupoContext = React.createContext<GrupoContextValue | null>(null);

export type AppShellNavGroupProps = Omit<React.ComponentProps<"li">, "onToggle"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Una entrada de navegación con sus hijas.
 *
 * Existe por el marcado: dentro de un `<ul>` solo pueden ir `<li>`, así que la
 * lista de hijas tiene que colgar del `<li>` del padre y no ser su hermana.
 * Escritas sueltas, la entrada emitía su `<li>` y la lista quedaba al lado,
 * dejando un `<ul>` colgando directamente de otro `<ul>`. El grupo es el dueño
 * del `<li>` y recibe las dos cosas.
 *
 * De paso es quien puede plegar: le pone `aria-expanded` y `aria-controls` a la
 * fila del padre, que es lo que dice que esa fila manda sobre esa lista.
 *
 * ```tsx
 * <AppShellNavGroup defaultOpen>
 *   <AppShellNavItem icon={<Caja />} href="/pedidos" childActive>Pedidos</AppShellNavItem>
 *   <AppShellNavSubList>
 *     <AppShellNavSubItem href="/pedidos/abiertos" active>Abiertos</AppShellNavSubItem>
 *   </AppShellNavSubList>
 * </AppShellNavGroup>
 * ```
 */
function AppShellNavGroup({
  className,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}: AppShellNavGroupProps) {
  const idLista = React.useId();
  const [interno, setInterno] = React.useState(defaultOpen);
  const controlado = open !== undefined;
  const abierto = controlado ? open : interno;

  const alternar = React.useCallback(() => {
    const siguiente = !abierto;
    if (!controlado) setInterno(siguiente);
    onOpenChange?.(siguiente);
  }, [abierto, controlado, onOpenChange]);

  const ctx = React.useMemo(() => ({ idLista, abierto, alternar }), [idLista, abierto, alternar]);

  return (
    <GrupoContext.Provider value={ctx}>
      <li data-slot="app-shell-nav-group" className={cn("list-none", className)} {...props}>
        {children}
      </li>
    </GrupoContext.Provider>
  );
}
AppShellNavGroup.displayName = "AppShellNavGroup";

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
 *
 * Dentro de un `AppShellNavGroup` se pliega, y ahí toma el `id` al que apunta
 * el `aria-controls` de la fila del padre. El plegado va con `grid-template-rows`
 * y no con una altura fija, que es lo único que anima sin tener que medir antes
 * cuántas hijas hay.
 */
function AppShellNavSubList({ className, children, ...props }: AppShellNavSubListProps) {
  const grupo = React.useContext(GrupoContext);
  const hijas = React.Children.toArray(children).filter(React.isValidElement);
  const activa = hijas.findIndex((h) => (h.props as AppShellNavSubItemProps).active === true);

  const lista = (
    <ul
      data-slot="app-shell-nav-sub-list"
      id={grupo?.idLista}
      className={cn(grupo ? "list-none" : "mb-2 list-none", className)}
      {...props}
    >
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

  if (!grupo) return lista;

  return (
    <div
      /* Recortar no basta: plegada, la lista seguía en el tabulador y en el
         árbol de accesibilidad, así que se llegaba a enlaces invisibles y
         `aria-expanded="false"` prometía algo que no era. `inert` la saca de
         los dos sin desmontarla, que es lo que deja que la salida se anime. */
      inert={!grupo.abierto}
      className={cn(
        "mb-2 grid transition-[grid-template-rows] duration-(--duration-fast) ease-out motion-reduce:transition-none",
        grupo.abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      {/* El `overflow-hidden` es lo que hace que la fila de 0fr recorte en vez
          de desbordar, y va aquí y no en la rejilla para que las hijas sigan
          pudiendo dibujar su guía fuera de su propia caja. */}
      <div className="overflow-hidden">{lista}</div>
    </div>
  );
}

export type AppShellNavItemProps = React.ComponentProps<"a"> & {
  active?: boolean;
  icon?: React.ReactNode;

  /**
   * El icono de cuando está elegida: el mismo, con más peso.
   *
   * La misma silueta más marcada dice «esta» sin agregar nada nuevo que leer.
   * Cómo se consigue ese peso depende del juego de iconos: con uno que traiga
   * pareja de trazo y relleno, la versión rellena; con uno de solo trazo, un
   * trazo más grueso. Rellenar un icono dibujado para trazo no sirve, porque
   * sus partes interiores se funden con el contorno en una mancha.
   *
   * Sin esto, `icon` sirve para los dos estados.
   */
  activeIcon?: React.ReactNode;

  /** Número al final de la fila: sin leer, pendientes, lo que haya. */
  count?: React.ReactNode;

  /**
   * Acciones que aparecen al apuntar la fila o al llegar a ellas con el
   * teclado. Van fuera del enlace, porque un control dentro de otro no es
   * marcado válido y el teclado no sabría cuál está activando.
   *
   * Se esperan `AppShellNavAction`. La caja la pone el componente y no quien lo
   * usa, porque el contador ocupa este mismo sitio y los dos tienen que acabar
   * en la misma vertical: con una caja libre, un botón de 20px con un icono de
   * 14 dejaba el icono 3px por dentro del número.
   *
   * Con acciones y contador a la vez, el contador se esconde mientras se
   * apunta: los dos a la vez no caben en 240px sin empujar el texto.
   */
  actions?: React.ReactNode;

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

/**
 * Entrada de navegacion. `active` la marca con `aria-current="page"`.
 *
 * Dentro de un `AppShellNavGroup` no emite su propio `<li>`, porque el dueño es
 * el grupo, y toma el `aria-expanded` y el `aria-controls` de la lista que
 * cuelga de ella. Pulsarla despliega además de llevar a su sitio: es lo mismo
 * que hace falta las dos veces, ver lo que hay dentro.
 */
function AppShellNavItem({
  className,
  active,
  icon,
  activeIcon,
  count,
  actions,
  childActive,
  children,
  onClick,
  ...props
}: AppShellNavItemProps) {
  const grupo = React.useContext(GrupoContext);
  const glifo = active ? (activeIcon ?? icon) : icon;

  const fila = (
    <div className="group/fila relative px-3">
      <a
        data-slot="app-shell-nav-item"
        aria-current={active ? "page" : undefined}
        aria-expanded={grupo ? grupo.abierto : undefined}
        aria-controls={grupo ? grupo.idLista : undefined}
        onClick={(e) => {
          grupo?.alternar();
          onClick?.(e);
        }}
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
        {glifo ? (
          <span
            aria-hidden="true"
            className="my-1 me-2 flex size-5 flex-none items-center justify-center [&_svg]:size-4"
          >
            {glifo}
          </span>
        ) : null}
        <span className="my-1 min-w-0 flex-1 truncate">{children}</span>
        {count !== undefined && count !== null ? (
          /* El `pe-0.5` son los 2px que la acción deja entre su caja de 20 y su
             icono de 16. Sin ellos las dos cajas acaban en la misma vertical
             pero lo que se ve, el número y el icono, no: el número sobresalía. */
          <span
            data-slot="app-shell-nav-item-count"
            className={cn(
              "my-1 ms-2 flex h-5 flex-none items-center pe-0.5 text-xs tabular-nums text-muted-foreground",
              actions &&
                "group-hover/fila:invisible group-focus-within/fila:invisible group-has-[[aria-pressed=true]]/fila:invisible",
            )}
          >
            {count}
          </span>
        ) : null}
      </a>

      {actions ? (
        /* Va en `opacity` y no en `display`, porque lo que no se pinta tampoco
           se tabula: escondidas con `hidden` no habría forma de llegar a ellas
           sin ratón. Así siguen en el orden del teclado y se muestran solas al
           recibir el foco.
           Una acción que quedó activada se queda a la vista aunque se retire el
           ratón. Si no, fijar algo lo escondería justo al soltarlo y no habría
           manera de ver qué está fijado sin ir fila por fila. */
        <span
          data-slot="app-shell-nav-item-actions"
          className="pointer-events-none absolute inset-y-0 end-4 flex items-center gap-0.5 opacity-0 transition-opacity duration-(--duration-fast) ease-out group-hover/fila:pointer-events-auto group-hover/fila:opacity-100 group-focus-within/fila:pointer-events-auto group-focus-within/fila:opacity-100 has-[[aria-pressed=true]]:pointer-events-auto has-[[aria-pressed=true]]:opacity-100"
        >
          {actions}
        </span>
      ) : null}
    </div>
  );

  /* Dentro de un grupo el `<li>` ya lo puso el grupo. Fuera, lo pone aquí: una
     entrada suelta sigue siendo un elemento de la lista. */
  return grupo ? fila : <li className="list-none">{fila}</li>;
}

export type AppShellNavActionProps = React.ComponentProps<"button">;

/**
 * Una acción de las que aparecen al apuntar una fila: fijar, archivar, un menú.
 *
 * La caja es fija, de 20px con el icono en 16, y no la elige quien la usa. Es lo
 * que hace que el icono acabe en la misma vertical que el contador, que ocupa
 * este mismo sitio cuando la fila no está apuntada. Con la caja libre, cada
 * pantalla ponía la suya y el icono quedaba unos píxeles por dentro del número.
 */
function AppShellNavAction({ className, ...props }: AppShellNavActionProps) {
  return (
    <button
      type="button"
      data-slot="app-shell-nav-action"
      className={cn(
        "inline-flex size-5 flex-none cursor-pointer items-center justify-center rounded-xs text-muted-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-sidebar-hover hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}
AppShellNavAction.displayName = "AppShellNavAction";

export type AppShellMainProps = React.ComponentProps<"main">;

/**
 * Área de contenido.
 *
 * Con el cajón abierto queda detrás del velo, así que sale del tabulador y del
 * árbol de accesibilidad. La cabecera se queda alcanzable a propósito, que ahí
 * vive el botón que cierra.
 *
 * Solo se vuelve inerte donde el cajón existe. Por encima del breakpoint no hay
 * velo que lo tape, así que dejarlo inerte lo haría inalcanzable a plena vista.
 */
function AppShellMain({ className, children, ...props }: AppShellMainProps) {
  const { cajonAbierto, esMovil } = useAppShell("AppShellMain");

  return (
    <main
      data-slot="app-shell-main"
      inert={cajonAbierto && esMovil}
      /* El lienzo, no el fondo de la página: va un punto por encima de la barra
         de navegación y por debajo de las tarjetas que se apoyan en él. Con el
         fondo general las tres superficies quedaban a menos de un 2% entre sí y
         el marco se leía como una sola plancha. */
      className={cn("flex min-w-0 flex-1 flex-col overflow-y-auto bg-secondary p-5", className)}
      {...props}
    >
      {children}
    </main>
  );
}

export {
  AppShell,
  AppShellHeader,
  AppShellHeaderBrand,
  AppShellHeaderSearch,
  AppShellHeaderActions,
  AppShellHeaderAction,
  AppShellUserMenu,
  AppShellNav,
  AppShellNavFooter,
  AppShellNavToggle,
  AppShellNavSection,
  AppShellNavGroup,
  AppShellNavAction,
  AppShellNavItem,
  AppShellNavSubList,
  AppShellNavSubItem,
  AppShellMain,
};
