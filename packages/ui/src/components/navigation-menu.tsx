/**
 * Raíz del menú de navegación, para la barra principal de un sitio.
 *
 * @module
 */

import { ChevronDown, Menu, X } from "@calumet/elise-icons";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import * as React from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

import { cn } from "@/lib/cn";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { useElLabel } from "@/lib/i18n";

/* El grupo de desbordamiento es un item aunque no lleve el mismo `data-slot`. */
const SELECTOR_ITEM = '[data-slot="navigation-menu-item"],[data-slot="navigation-menu-overflow"]';

/* En una secuencia el panel no flota: cae en el flujo y se abre en alto. */
type Secuencia = "grupo" | "cajon";

const DentroDeUnaSecuencia: React.Context<Secuencia | null> = React.createContext<Secuencia | null>(
  null,
);

type ContextoNavegacion = {
  desplegado: boolean;
  setDesplegado: (v: boolean) => void;
  hayDisparador: boolean;
  registrarDisparador: () => () => void;
};

const Navegacion = React.createContext<ContextoNavegacion | null>(null);

const BOTON_DESPLIEGUE =
  "group relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Raíz del menú de navegación, para la barra principal de un sitio. Envolvé con
 * ella toda la cabecera si querés poner el botón arriba, junto a la marca.
 *
 * El relleno horizontal va aquí y no en la fila: el despliegue de móvil lo
 * hereda, y así sus rótulos caen a plomo con los de la fila.
 */
export const NavigationMenu: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.Root>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const [desplegado, setDesplegado] = React.useState(false);
  const [disparadores, setDisparadores] = React.useState(0);

  const registrarDisparador = React.useCallback(() => {
    setDisparadores((n) => n + 1);
    return () => setDisparadores((n) => n - 1);
  }, []);

  const ctx = React.useMemo(
    () => ({
      desplegado,
      setDesplegado,
      hayDisparador: disparadores > 0,
      registrarDisparador,
    }),
    [desplegado, disparadores, registrarDisparador],
  );

  return (
    <Navegacion.Provider value={ctx}>
      <Collapsible open={desplegado} onOpenChange={setDesplegado} asChild>
        <NavigationMenuPrimitive.Root
          data-slot="navigation-menu"
          ref={ref}
          className={cn("group/navigation-menu relative flex w-full flex-col", className)}
          {...props}
        >
          {children}
        </NavigationMenuPrimitive.Root>
      </Collapsible>
    </Navegacion.Provider>
  );
});
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const useNavegacion = (quien: string): ContextoNavegacion => {
  const ctx = React.useContext(Navegacion);
  if (!ctx) throw new Error(`${quien} tiene que ir dentro de un NavigationMenu.`);
  return ctx;
};

/**
 * Abre y cierra el despliegue de móvil. Ponelo donde vaya el resto de acciones
 * de la cabecera; si no hay ninguno, la fila dibuja el suyo en su sitio.
 */
export const NavigationMenuToggle: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentProps<"button">> & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const { registrarDisparador } = useNavegacion("NavigationMenuToggle");

    /* Antes de pintar: si no, aparecen los dos botones por un cuadro. */
    React.useLayoutEffect(() => registrarDisparador(), [registrarDisparador]);

    return <BotonDespliegue ref={ref} className={cn("md:hidden", className)} {...props} />;
  },
);
NavigationMenuToggle.displayName = "NavigationMenuToggle";

const BotonDespliegue = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const etiqueta = useElLabel("ui", "navigation", "Navegación");

    return (
      <CollapsibleTrigger asChild>
        <button
          type="button"
          data-slot="navigation-menu-toggle"
          aria-label={etiqueta}
          ref={ref}
          className={cn(BOTON_DESPLIEGUE, className)}
          {...props}
        >
          <Menu
            className="size-5 transition-[opacity,rotate] duration-(--duration-fast) ease-out group-data-[state=open]:rotate-90 group-data-[state=open]:opacity-0"
            aria-hidden
          />
          <X
            className="absolute size-5 -rotate-90 opacity-0 transition-[opacity,rotate] duration-(--duration-fast) ease-out group-data-[state=open]:rotate-0 group-data-[state=open]:opacity-100"
            aria-hidden
          />
        </button>
      </CollapsibleTrigger>
    );
  },
);
BotonDespliegue.displayName = "BotonDespliegue";

/** Props de {@link NavigationMenuList}. */
export type NavigationMenuListProps = React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.List
> & {
  /** Rótulo del grupo que recoge lo que no cabe. Por defecto, «Más». */
  overflowLabel?: string;
};

/**
 * La fila de secciones. Las que no caben se recogen en un grupo al final, y por
 * debajo de 768px la fila entera se cambia por el botón de siempre.
 *
 * Lo que se agrupa no se desmonta: se vuelve a montar como submenú vertical, así
 * que cada sección conserva su panel tal como se escribió.
 */
export const NavigationMenuList: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuListProps> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.List>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.List>,
  NavigationMenuListProps
>(({ className, children, overflowLabel, ...props }, ref) => {
  const mas = useElLabel("ui", "more", "Más");
  const rotuloGrupo = overflowLabel ?? mas;
  const esMovil = useIsMobile();
  const { hayDisparador, setDesplegado } = useNavegacion("NavigationMenuList");

  const secciones = React.useMemo(
    () => React.Children.toArray(children).filter(React.isValidElement),
    [children],
  );

  const fila = React.useRef<HTMLUListElement | null>(null);
  const anchos = React.useRef<number[]>([]);
  const anchoGrupo = React.useRef(96);
  const repartir = React.useRef<() => void>(undefined);
  const [visibles, setVisibles] = React.useState(secciones.length);

  React.useLayoutEffect(() => {
    const lista = fila.current;
    /* La raiz y no el padre: Radix envuelve la lista en un div que crece. */
    const caja = lista?.closest<HTMLElement>('[data-slot="navigation-menu"]');
    if (!lista || !caja) return;

    repartir.current = () => {
      const hijos = [...lista.children] as HTMLElement[];
      const grupo = lista.querySelector<HTMLElement>('[data-slot="navigation-menu-overflow"]');
      if (grupo) anchoGrupo.current = grupo.getBoundingClientRect().width;
      /* Solo con la fila entera a la vista estan todos medidos. */
      if (!grupo && hijos.length === secciones.length) {
        anchos.current = hijos.map((h) => h.getBoundingClientRect().width);
      }
      if (anchos.current.length !== secciones.length) return;

      /* El sitio es la caja de contenido de la fila, que con el margen negativo
         es mas ancha que la barra. */
      const e = getComputedStyle(lista);
      const disponible = lista.clientWidth - parseFloat(e.paddingLeft) - parseFloat(e.paddingRight);

      /* Lo que ocupan las primeras `n`, contando el grupo solo si queda alguna
         fuera. Se baja desde todas: la ultima que entra hace desaparecer el
         grupo, asi que no crece de forma pareja y no vale buscar de abajo. */
      const ocupado = (n: number) =>
        anchos.current.slice(0, n).reduce((a, b) => a + b, 0) +
        (n < secciones.length ? anchoGrupo.current : 0);

      let caben = secciones.length;
      while (caben > 0 && ocupado(caben) > disponible) caben -= 1;
      setVisibles(caben);
    };

    const ro = new ResizeObserver(() => repartir.current?.());
    ro.observe(caja);
    repartir.current();
    return () => {
      ro.disconnect();
      repartir.current = undefined;
    };
  }, [secciones.length, esMovil]);

  /* El ancho del grupo solo se sabe con el grupo puesto, asi que la primera
     cuenta va con una estimacion y esta la corrige antes de pintar. */
  React.useLayoutEffect(() => repartir.current?.(), [visibles]);

  const secuencia = (filas: React.ReactNode, variante: Secuencia) => (
    <DentroDeUnaSecuencia.Provider value={variante}>
      <NavigationMenuPrimitive.Sub
        data-slot="navigation-menu-sub"
        orientation="vertical"
        className="w-full"
      >
        <NavigationMenuPrimitive.List
          className={cn(
            "flex w-full list-none flex-col gap-0",
            variante === "cajon" && "divide-y divide-border",
          )}
        >
          {filas}
        </NavigationMenuPrimitive.List>
      </NavigationMenuPrimitive.Sub>
    </DentroDeUnaSecuencia.Provider>
  );

  if (esMovil) {
    return (
      <>
        {hayDisparador ? null : (
          <div className={cn("flex items-center", className)}>
            <BotonDespliegue />
          </div>
        )}
        {/* Un clic en un enlace cierra el despliegue; abrir una sección, no. */}
        <CollapsibleContent
          data-slot="navigation-menu-drawer"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setDesplegado(false);
          }}
        >
          {/* Sin el `className` de la fila: describe una fila, y con un `flex`
              dentro el submenu se encoge a su contenido. */}
          <div className={cn("w-full", !hayDisparador && "border-t border-border")}>
            {secuencia(secciones, "cajon")}
          </div>
        </CollapsibleContent>
      </>
    );
  }

  const dentro = secciones.slice(0, visibles);

  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      ref={(nodo) => {
        fila.current = nodo;
        if (typeof ref === "function") ref(nodo);
        else if (ref) ref.current = nodo;
      }}
      /* El `-mx` descuenta la pastilla: lo que alinea es el rótulo. */
      className={cn("group -mx-2.5 flex flex-1 list-none items-center gap-0", className)}
      {...props}
    >
      {dentro}
      {visibles < secciones.length ? (
        <NavigationMenuPrimitive.Item
          data-slot="navigation-menu-overflow"
          className="relative shrink-0"
        >
          <NavigationMenuTrigger>{rotuloGrupo}</NavigationMenuTrigger>
          <NavigationMenuContent align="end" className="max-h-[min(70vh,30rem)] overflow-y-auto">
            {secuencia(secciones.slice(visibles), "grupo")}
          </NavigationMenuContent>
        </NavigationMenuPrimitive.Item>
      ) : null}
    </NavigationMenuPrimitive.List>
  );
});
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

/** Una sección del menú. Es el marco contra el que se coloca su panel. */
export const NavigationMenuItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item>> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.Item>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Item
    data-slot="navigation-menu-item"
    ref={ref}
    className={cn("relative shrink-0", className)}
    {...props}
  />
));
NavigationMenuItem.displayName = NavigationMenuPrimitive.Item.displayName;

/** El control que despliega el panel de una sección. */
export const NavigationMenuTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.Trigger>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const secuencia = React.useContext(DentroDeUnaSecuencia);

  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      ref={ref}
      className={cn(
        "group inline-flex select-none items-center whitespace-nowrap rounded-md px-2.5 py-1.5 text-base font-medium text-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        secuencia
          ? "h-9 w-full justify-between"
          : "h-9 w-max justify-center data-[state=open]:bg-state-hover",
        secuencia === "cajon" && "h-11 px-0",
        className,
      )}
      {...props}
    >
      {props.children}
      <ChevronDown
        className="relative top-px ml-1 size-3 shrink-0 transition-transform duration-(--duration-base) ease-out group-data-[state=open]:rotate-180"
        aria-hidden
      />
    </NavigationMenuPrimitive.Trigger>
  );
});
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

/** Props de {@link NavigationMenuContent}. */
export type NavigationMenuContentProps = React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Content
> & {
  /**
   * Dónde abre el panel. `start` y `end` lo pegan a un borde de su disparador;
   * `full` lo estira al ancho de la barra, que es lo que pide un megamenú de
   * varias columnas. Por debajo de `sm` los tres se estiran igual.
   */
  align?: "start" | "end" | "full";
};

const ALINEACION: Record<NonNullable<NavigationMenuContentProps["align"]>, string> = {
  /* El ajuste lo mete hacia adentro si se pasa del borde. `w-max` es lo que le
     deja ser mas ancho que su seccion. */
  start:
    "sm:left-[calc(0px-var(--el-nav-ajuste,0px))] sm:w-max sm:max-w-[var(--el-nav-ancho,100%)]",
  end: "sm:left-auto sm:right-0 sm:w-max sm:max-w-[var(--el-nav-ancho,100%)]",
  full: "",
};

/* El megamenú ocupa la barra entera y con el marco de un menú se ve apretado. */
const HOLGURA: Record<NonNullable<NavigationMenuContentProps["align"]>, string> = {
  start: "p-3",
  end: "p-3",
  full: "px-[var(--el-nav-sangria,0.875rem)] py-5",
};

const PANEL_FLOTANTE =
  "absolute top-full left-[var(--el-nav-corrimiento,0px)] z-popover mt-1.5 w-[var(--el-nav-ancho,100%)] rounded-xl border border-border bg-popover shadow-lg duration-(--duration-fast) ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-top-1 data-[state=closed]:slide-out-to-top-1 data-[motion=from-start]:slide-in-from-left-8 data-[motion=from-end]:slide-in-from-right-8 data-[motion=to-start]:slide-out-to-left-8 data-[motion=to-end]:slide-out-to-right-8 sm:min-w-64";

/* El relleno va en el div de adentro: animar un alto con relleno vertical
   aprieta el texto durante la transición. */
const PANEL_EN_SECUENCIA =
  "static w-full overflow-hidden data-[state=open]:animate-nav-down data-[state=closed]:animate-nav-up";

/** El panel de una sección. */
export const NavigationMenuContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuContentProps> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.Content>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Content>,
  NavigationMenuContentProps
>(({ className, align = "start", children, ...props }, ref) => {
  /* En estado y no en una referencia: el panel se monta al abrirse. */
  const [panel, setPanel] = React.useState<HTMLDivElement | null>(null);
  const secuencia = React.useContext(DentroDeUnaSecuencia);

  /* Se mide el hijo: el panel esta animando su alto. */
  React.useLayoutEffect(() => {
    const caja = panel;
    const dentro = caja?.firstElementChild;
    if (!secuencia || !caja || !dentro) return;

    const medir = () => caja.style.setProperty("--el-nav-alto", `${caja.scrollHeight}px`);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(dentro);
    return () => ro.disconnect();
  }, [panel, secuencia]);

  /* Nada de esto se escribe en CSS: hay que medir la barra y el item. */
  React.useLayoutEffect(() => {
    const caja = panel;
    const barra = caja?.closest<HTMLElement>('[data-slot="navigation-menu"]');
    const item = caja?.closest<HTMLElement>(SELECTOR_ITEM);
    const fila = barra?.querySelector<HTMLElement>('[data-slot="navigation-menu-list"]');
    if (secuencia || !caja || !barra || !item) return;

    const colocar = () => {
      const b = barra.getBoundingClientRect();
      const i = item.getBoundingClientRect();
      caja.style.setProperty("--el-nav-corrimiento", `${b.left - i.left}px`);
      caja.style.setProperty("--el-nav-ancho", `${b.width}px`);
      /* Al ancho de la barra se sangra como la fila, para caer a plomo. */
      if (fila) {
        const f = fila.getBoundingClientRect();
        const sangria = f.left + parseFloat(getComputedStyle(fila).paddingLeft) - b.left;
        caja.style.setProperty("--el-nav-sangria", `${sangria}px`);
      }
      caja.style.setProperty(
        "--el-nav-ajuste",
        `${Math.max(0, i.left + caja.offsetWidth - b.right)}px`,
      );
    };

    colocar();
    const ro = new ResizeObserver(colocar);
    ro.observe(barra);
    ro.observe(caja);
    return () => ro.disconnect();
  }, [panel, secuencia]);

  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      data-align={align}
      ref={(nodo) => {
        setPanel(nodo);
        if (typeof ref === "function") ref(nodo);
        else if (ref) ref.current = nodo;
      }}
      className={cn(
        secuencia ? PANEL_EN_SECUENCIA : cn(PANEL_FLOTANTE, HOLGURA[align], ALINEACION[align]),
        className,
      )}
      {...props}
    >
      {secuencia ? (
        /* En el grupo la sangría dice de qué cuelga; en el cajón, los filetes. */
        <div className={cn("pb-2", secuencia === "grupo" && "ps-3")}>{children}</div>
      ) : (
        children
      )}
    </NavigationMenuPrimitive.Content>
  );
});
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

/** Un enlace del menú. Marcá el actual con `active`. */
export const NavigationMenuLink: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.Link>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Link>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>
>(({ className, ...props }, ref) => {
  const secuencia = React.useContext(DentroDeUnaSecuencia);

  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      ref={ref}
      className={cn(
        "inline-flex h-9 w-max select-none items-center justify-center gap-2 whitespace-nowrap rounded-md px-2.5 py-1.5 text-base font-medium text-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background in-data-[slot=navigation-menu-content]:h-auto in-data-[slot=navigation-menu-content]:w-full in-data-[slot=navigation-menu-content]:justify-start",
        secuencia === "cajon" && "h-11 px-0",
        className,
      )}
      {...props}
    />
  );
});
NavigationMenuLink.displayName = NavigationMenuPrimitive.Link.displayName;

/** El contenedor donde se dibujan los paneles, y que se anima al cambiar de sección. */
export const NavigationMenuViewport: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.Viewport>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Viewport
    data-slot="navigation-menu-viewport"
    ref={ref}
    className={cn(
      "relative mt-2 h-(--radix-navigation-menu-viewport-height) w-full origin-top-left overflow-hidden rounded-xl border border-border bg-popover shadow-lg transition-all duration-200 sm:w-(--radix-navigation-menu-viewport-width)",
      className,
    )}
    {...props}
  />
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

/** La flecha que apunta a la sección abierta. */
export const NavigationMenuIndicator: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.Indicator>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    data-slot="navigation-menu-indicator"
    ref={ref}
    className={cn(
      "top-full flex h-2 items-end justify-center overflow-hidden transition-[width,transform] duration-200 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className,
    )}
    {...props}
  >
    <div className="relative top-px h-2 w-2 rotate-45 rounded-sm bg-popover border-l border-t border-border" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;
