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

/* Una secuencia vertical no tiene sitio para un panel flotante: ahí cada sección
   cae en el flujo y se abre en alto. Son dos, y no se ven igual: el grupo es un
   panel de escritorio y el despliegue es la navegación entera en un teléfono. */
type Secuencia = "grupo" | "cajon";

const DentroDeUnaSecuencia: React.Context<Secuencia | null> = React.createContext<Secuencia | null>(
  null,
);

/** Raíz del menú de navegación, para la barra principal de un sitio. */
export const NavigationMenu: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.Root>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    data-slot="navigation-menu"
    ref={ref}
    className={cn("group/navigation-menu relative flex w-full items-center", className)}
    {...props}
  />
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

/** Props de {@link NavigationMenuList}. */
export type NavigationMenuListProps = React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.List
> & {
  /** Rótulo del grupo que recoge lo que no cabe. Por defecto, «Más». */
  overflowLabel?: string;
};

/**
 * La fila de secciones. Las que no caben se recogen en un grupo al final, y ese
 * grupo crece a medida que la ventana se angosta, hasta que por debajo de los
 * 768px la fila entera se cambia por el cajón de siempre.
 *
 * Los anchos se miden del layout ya pintado y no se estiman, porque el rótulo
 * de cada sección lo escribe quien la usa. La cuenta se hace dos veces: la
 * segunda descuenta el ancho del propio grupo, que si no provoca el
 * desbordamiento que venía a resolver.
 *
 * Lo que se desborda no se desmonta, se vuelve a montar dentro del grupo como
 * submenú vertical, así que cada sección conserva su panel tal como se escribió.
 * En el cajón pasa lo mismo con todas.
 */
export const NavigationMenuList: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuListProps> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.List>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.List>,
  NavigationMenuListProps
>(({ className, children, overflowLabel, ...props }, ref) => {
  const mas = useElLabel("ui", "more", "Más");
  const navegacion = useElLabel("ui", "navigation", "Navegación");
  const rotuloGrupo = overflowLabel ?? mas;
  const esMovil = useIsMobile();
  const [desplegado, setDesplegado] = React.useState(false);

  const secciones = React.useMemo(
    () => React.Children.toArray(children).filter(React.isValidElement),
    [children],
  );

  const fila = React.useRef<HTMLUListElement | null>(null);
  const anchos = React.useRef<number[]>([]);
  const anchoGrupo = React.useRef(96);
  const [visibles, setVisibles] = React.useState(secciones.length);

  React.useLayoutEffect(() => {
    const lista = fila.current;
    /* El ancho disponible es el de la raiz y no el del padre inmediato: Radix
       envuelve la lista en un div propio que crece con su contenido. */
    const caja = lista?.closest<HTMLElement>('[data-slot="navigation-menu"]');
    if (!lista || !caja) return;

    const repartir = () => {
      const hijos = [...lista.children] as HTMLElement[];
      const grupo = lista.querySelector<HTMLElement>('[data-slot="navigation-menu-overflow"]');
      if (grupo) anchoGrupo.current = grupo.getBoundingClientRect().width;
      /* Los anchos se toman solo con la fila entera a la vista, que es la unica
         vez que estan todos medidos; despues se reusan. */
      if (!grupo && hijos.length === secciones.length) {
        anchos.current = hijos.map((h) => h.getBoundingClientRect().width);
      }
      if (anchos.current.length !== secciones.length) return;

      const disponible = caja.clientWidth;
      let usado = 0;
      let caben = 0;
      for (const ancho of anchos.current) {
        if (usado + ancho > disponible) break;
        usado += ancho;
        caben += 1;
      }
      /* Segunda pasada: el propio grupo ocupa, y sin descontarlo provoca el
         desbordamiento que venia a resolver. */
      if (caben < secciones.length) {
        while (caben > 0 && usado + anchoGrupo.current > disponible) {
          caben -= 1;
          usado -= anchos.current[caben];
        }
      }
      setVisibles(caben);
    };

    const ro = new ResizeObserver(repartir);
    ro.observe(caja);
    repartir();
    return () => ro.disconnect();
  }, [secciones.length, esMovil]);

  const secuencia = (filas: React.ReactNode, variante: Secuencia) => (
    <DentroDeUnaSecuencia.Provider value={variante}>
      <NavigationMenuPrimitive.Sub data-slot="navigation-menu-sub" orientation="vertical">
        <NavigationMenuPrimitive.List
          className={cn(
            "flex list-none flex-col gap-0",
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
      <Collapsible open={desplegado} onOpenChange={setDesplegado} className="w-full">
        <div className={cn("flex items-center", className)}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              data-slot="navigation-menu-toggle"
              aria-label={navegacion}
              className="group relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
        </div>
        {/* Un clic en un enlace cierra el despliegue; abrir una sección, no. */}
        <CollapsibleContent
          data-slot="navigation-menu-drawer"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setDesplegado(false);
          }}
        >
          <div className="border-t border-border">{secuencia(secciones, "cajon")}</div>
        </CollapsibleContent>
      </Collapsible>
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
      className={cn("group flex flex-1 list-none items-center gap-0", className)}
      {...props}
    >
      {dentro}
      {visibles < secciones.length ? (
        <NavigationMenuPrimitive.Item data-slot="navigation-menu-overflow" className="relative">
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
    className={cn("relative", className)}
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
        "group inline-flex select-none items-center whitespace-nowrap rounded-md px-2.5 py-1.5 text-base font-medium text-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        /* Abierta, una sección de la fila se marca con el relleno. En una
           secuencia la marca es el galón girado y la sección que se abrió
           debajo, así que el relleno solo sobra. */
        secuencia
          ? "h-9 w-full justify-between"
          : "h-9 w-max justify-center data-[state=open]:bg-muted",
        secuencia === "cajon" && "h-11",
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
  /* El corrimiento no deja que el panel se pase del borde derecho de la barra,
     sin despegarlo del disparador mas de lo que se sale. `w-max` es lo que le
     permite ser mas ancho que su seccion: en shrink-to-fit el ancho disponible
     es el del item, que mide lo que su rotulo. */
  start:
    "sm:left-[calc(0px-var(--el-nav-ajuste,0px))] sm:w-max sm:max-w-[var(--el-nav-ancho,100%)]",
  end: "sm:left-auto sm:right-0 sm:w-max sm:max-w-[var(--el-nav-ancho,100%)]",
  full: "",
};

/* Un menú corriente es una columna de enlaces que ya traen su propio recuadro,
   así que el marco es fino. El megamenú ocupa la barra entera y ahí el mismo
   marco se ve apretado. */
const HOLGURA: Record<NonNullable<NavigationMenuContentProps["align"]>, string> = {
  start: "p-3",
  end: "p-3",
  full: "p-5",
};

const PANEL_FLOTANTE =
  "absolute top-full left-[var(--el-nav-corrimiento,0px)] z-popover mt-1.5 w-[var(--el-nav-ancho,100%)] rounded-xl border border-border bg-popover shadow-lg duration-(--duration-fast) ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-top-1 data-[state=closed]:slide-out-to-top-1 data-[motion=from-start]:slide-in-from-left-8 data-[motion=from-end]:slide-in-from-right-8 data-[motion=to-start]:slide-out-to-left-8 data-[motion=to-end]:slide-out-to-right-8 sm:min-w-64";

/* En una secuencia el panel se abre en alto, con la misma animación que el
   acordeón. El relleno vive en el div de adentro porque animar el alto de algo
   que además tiene relleno vertical aprieta el texto durante la transición. */
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
  /* En estado, no en una referencia: el panel se monta al abrirse, asi que la
     medida tiene que esperarlo. */
  const [panel, setPanel] = React.useState<HTMLDivElement | null>(null);
  const secuencia = React.useContext(DentroDeUnaSecuencia);

  /* El alto al que se abre sale del contenido, y se mide del hijo y no del
     panel: el panel esta animando el suyo, asi que medirlo es medir el propio
     movimiento. */
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

  /* La barra y el item son los dos marcos que necesita el panel flotante, y
     ninguno de los dos se puede escribir en CSS: `full` tiene que deshacer el
     corrimiento del item para volver al borde de la barra, y `start` tiene que
     saber cuanto se sale por la derecha. */
  React.useLayoutEffect(() => {
    const caja = panel;
    const barra = caja?.closest<HTMLElement>('[data-slot="navigation-menu"]');
    const item = caja?.closest<HTMLElement>(SELECTOR_ITEM);
    if (secuencia || !caja || !barra || !item) return;

    const colocar = () => {
      const b = barra.getBoundingClientRect();
      const i = item.getBoundingClientRect();
      caja.style.setProperty("--el-nav-corrimiento", `${b.left - i.left}px`);
      caja.style.setProperty("--el-nav-ancho", `${b.width}px`);
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
        /* En el grupo la sangría es lo que dice que esto cuelga de la sección de
           arriba. En el cajón lo dicen los filetes, y sangrar además desalinea
           la lista entera. */
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
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Link
    data-slot="navigation-menu-link"
    ref={ref}
    className={cn(
      "inline-flex h-9 w-max select-none items-center justify-center gap-2 whitespace-nowrap rounded-md px-2.5 py-1.5 text-base font-medium text-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background in-data-[slot=navigation-menu-content]:h-auto in-data-[slot=navigation-menu-content]:w-full in-data-[slot=navigation-menu-content]:justify-start",
      className,
    )}
    {...props}
  />
));
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
