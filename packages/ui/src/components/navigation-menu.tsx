/**
 * Raíz del menú de navegación, para la barra principal de un sitio.
 *
 * @module
 */

import { ChevronDown } from "@calumet/elise-icons";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/* El grupo de desbordamiento es un item aunque no lleve el mismo `data-slot`. */
const SELECTOR_ITEM = '[data-slot="navigation-menu-item"],[data-slot="navigation-menu-overflow"]';

/* Dentro del grupo no hay sitio para un panel flotante: cada seccion abre en
   flujo, como una lista que se despliega, y el grupo crece hacia abajo. */
const PANEL_EN_GRUPO =
  "[&_[data-slot=navigation-menu-content]]:static [&_[data-slot=navigation-menu-content]]:mt-0 [&_[data-slot=navigation-menu-content]]:w-full [&_[data-slot=navigation-menu-content]]:min-w-0 [&_[data-slot=navigation-menu-content]]:border-0 [&_[data-slot=navigation-menu-content]]:bg-transparent [&_[data-slot=navigation-menu-content]]:p-0 [&_[data-slot=navigation-menu-content]]:ps-3 [&_[data-slot=navigation-menu-content]]:shadow-none";

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
 * grupo crece a medida que la ventana se angosta.
 *
 * Los anchos se miden del layout ya pintado y no se estiman, porque el rótulo
 * de cada sección lo escribe quien la usa. La cuenta se hace dos veces: la
 * segunda descuenta el ancho del propio grupo, que si no provoca el
 * desbordamiento que venía a resolver.
 *
 * Lo que se desborda no se desmonta, se vuelve a montar dentro del grupo como
 * submenú vertical, así que cada sección conserva su panel tal como se escribió.
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
  }, [secciones.length]);

  const dentro = secciones.slice(0, visibles);
  const fuera = secciones.slice(visibles);

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
      {fuera.length > 0 ? (
        <NavigationMenuPrimitive.Item data-slot="navigation-menu-overflow" className="relative">
          <NavigationMenuTrigger>{rotuloGrupo}</NavigationMenuTrigger>
          <NavigationMenuContent align="end" className="max-h-[min(70vh,30rem)] overflow-y-auto">
            <NavigationMenuPrimitive.Sub
              data-slot="navigation-menu-sub"
              orientation="vertical"
              className={PANEL_EN_GRUPO}
            >
              <NavigationMenuPrimitive.List className="flex list-none flex-col gap-0">
                {fuera}
              </NavigationMenuPrimitive.List>
            </NavigationMenuPrimitive.Sub>
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
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    data-slot="navigation-menu-trigger"
    ref={ref}
    className={cn(
      "group inline-flex h-9 w-max select-none items-center justify-center whitespace-nowrap rounded-md px-2.5 py-1.5 text-base font-medium text-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=open]:bg-muted in-data-[slot=navigation-menu-content]:w-full in-data-[slot=navigation-menu-content]:justify-between",
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
));
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

/** El panel de una sección. */
export const NavigationMenuContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuContentProps> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.Content>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Content>,
  NavigationMenuContentProps
>(({ className, align = "start", ...props }, ref) => {
  /* En estado, no en una referencia: el panel se monta al abrirse, asi que la
     medida tiene que esperarlo. */
  const [panel, setPanel] = React.useState<HTMLDivElement | null>(null);

  /* La barra y el item son los dos marcos que necesita el panel, y ninguno de
     los dos se puede escribir en CSS: `full` tiene que deshacer el corrimiento
     del item para volver al borde de la barra, y `start` tiene que saber cuanto
     se sale por la derecha. */
  React.useLayoutEffect(() => {
    const caja = panel;
    const barra = caja?.closest<HTMLElement>('[data-slot="navigation-menu"]');
    const item = caja?.closest<HTMLElement>(SELECTOR_ITEM);
    if (!caja || !barra || !item) return;

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
  }, [panel]);

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
        "absolute top-full z-popover mt-1.5 left-[var(--el-nav-corrimiento,0px)] w-[var(--el-nav-ancho,100%)] rounded-xl border border-border bg-popover p-3 shadow-lg data-[motion=from-start]:animate-in data-[motion=from-end]:animate-in data-[motion=to-start]:animate-out data-[motion=to-end]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out sm:min-w-64",
        ALINEACION[align],
        className,
      )}
      {...props}
    />
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
