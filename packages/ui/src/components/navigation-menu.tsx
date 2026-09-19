/**
 * Raíz del menú de navegación, para la barra principal de un sitio.
 *
 * @module
 */

import { ChevronDown, Menu, X } from "@calumet/elise-icons";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

/* El grupo de desbordamiento es un item aunque no lleve el mismo `data-slot`. */
const SELECTOR_ITEM = '[data-slot="navigation-menu-item"],[data-slot="navigation-menu-overflow"]';

/* Lo que separa el panel del canto de la barra, igual que del borde de abajo. */
const ROOM = 6;

/* En una secuencia el panel no flota: cae en el flujo y se abre en alto. */
type Sequence = "group" | "drawer";

const InsideASequence: React.Context<Sequence | null> = React.createContext<Sequence | null>(null);

/* Radix solo alterna en la raíz: el `onItemSelect` de un `Sub` asigna sin
   comparar, y la sección no se cierra sola. */
const CloseTheSection = React.createContext<(() => void) | null>(null);

type NavigationContext = {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
};

const Navigation = React.createContext<NavigationContext | null>(null);

const EXPAND_BUTTON =
  "group relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* La caja de Radix alrededor de la fila, que quien usa el componente no alcanza. */
const ROW_BOX =
  "[&_div:has(>[data-slot=navigation-menu-list])]:min-w-0 [&_div:has(>[data-slot=navigation-menu-list])]:flex-1";

/* El reparto en JS plano, para correr al parsear el HTML del servidor, antes de pintar. */
const LAYOUT_ON_PARSE = `(function(){var s=document.currentScript,r=s&&s.parentElement;if(!r)return;var rows=r.querySelectorAll('[data-slot="navigation-menu-list"]');for(var k=0;k<rows.length;k++){var u=rows[k];if(!u.getClientRects().length)continue;var c=u.parentElement,g=null,li=[];for(var i=0;i<u.children.length;i++){var e=u.children[i];if(e.tagName!=="LI")continue;if(e.getAttribute("data-slot")==="navigation-menu-overflow")g=e;else li.push(e)}if(!g||!c)continue;var w=function(e){return e.getBoundingClientRect().width},p=function(e,q){var t=getComputedStyle(e);return parseFloat(t[q+"Left"])+parseFloat(t[q+"Right"])};g.hidden=false;var ag=w(g);g.hidden=true;var a=li.map(w),d=w(c)-p(c,"padding")-p(u,"padding")-p(u,"margin"),n=li.length,o=function(m){var t=0;for(var j=0;j<m;j++)t+=a[j];return t+(m<li.length?ag:0)};while(n>0&&o(n)>d)n--;for(i=0;i<li.length;i++)li[i].hidden=i>=n;g.hidden=n===li.length;u.removeAttribute("data-unmeasured");u.setAttribute("data-visible",String(n))}})();`;

/**
 * Raíz del menú de navegación, para la barra principal de un sitio. Envolvé con
 * ella toda la cabecera si querés poner el botón arriba, junto a la marca.
 *
 * El relleno horizontal va en la raíz o en cualquier contenedor de en medio: el
 * despliegue de móvil lo hereda, y así sus rótulos caen a plomo con los de la
 * fila.
 *
 * Con HTML del servidor, un `<script>` inline al final de la raíz reparte la fila
 * antes de pintar: lo que comparta línea con la fila va dentro. `nonce` es para CSP.
 */
export const NavigationMenu: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.Root>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, nonce, ...props }, ref) => {
  const [expanded, setExpanded] = React.useState(false);

  const ctx = React.useMemo(() => ({ expanded, setExpanded }), [expanded]);

  return (
    <Navigation.Provider value={ctx}>
      <Collapsible open={expanded} onOpenChange={setExpanded} asChild>
        <NavigationMenuPrimitive.Root
          data-slot="navigation-menu"
          ref={ref}
          className={cn(
            "group/navigation-menu relative flex w-full min-w-0 flex-col",
            ROW_BOX,
            className,
          )}
          {...props}
        >
          {children}
          {/* Lo que crea React no se ejecuta. */}
          <script nonce={nonce} dangerouslySetInnerHTML={{ __html: LAYOUT_ON_PARSE }} />
        </NavigationMenuPrimitive.Root>
      </Collapsible>
    </Navigation.Provider>
  );
});
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const useNavigation = (who: string): NavigationContext => {
  const ctx = React.useContext(Navigation);
  if (!ctx) throw new Error(`${who} tiene que ir dentro de un NavigationMenu.`);
  return ctx;
};

/**
 * Abre y cierra el despliegue de móvil. Ponelo donde vaya el resto de acciones
 * de la cabecera; si no hay ninguno, la fila dibuja el suyo en su sitio.
 *
 * Trae puesto el descuento de la holgura de su caja, para que el glifo cierre
 * donde abre la marca. Si no queda contra el borde, `className="me-0"`.
 */
export const NavigationMenuToggle: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentProps<"button">> & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    useNavigation("NavigationMenuToggle");
    /* El `-me` descuenta la holgura de la caja. El botón cierra una cabecera, y
       ahí el glifo tiene que caer donde abre la marca; `me-0` lo anula. */
    return <ExpandButton ref={ref} className={cn("-me-2 md:hidden", className)} {...props} />;
  },
);
NavigationMenuToggle.displayName = "NavigationMenuToggle";

const ExpandButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const label = useElLabel("ui", "navigation", "Navegación");

    return (
      <CollapsibleTrigger asChild>
        <button
          type="button"
          data-slot="navigation-menu-toggle"
          aria-label={label}
          ref={ref}
          className={cn(EXPAND_BUTTON, className)}
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
ExpandButton.displayName = "ExpandButton";

/* La cuenta que dejo el script del servidor, si corrio. */
const countOnParse = (id: string, total: number): number | undefined => {
  if (typeof document === "undefined") return undefined;
  for (const el of document.querySelectorAll('[data-slot="navigation-menu-list"][data-visible]')) {
    if (el.getAttribute("data-row") !== id) continue;
    const n = Number(el.getAttribute("data-visible"));
    return Number.isInteger(n) && n >= 0 && n <= total ? n : undefined;
  }
  return undefined;
};

/* El `Sub` va controlado: es de donde el disparador vacía la sección. */
const Sequence = ({
  variant,
  children,
}: {
  variant: Sequence;
  children: React.ReactNode;
}): React.JSX.Element => {
  const [open, setOpen] = React.useState("");
  const close = React.useCallback(() => setOpen(""), []);

  return (
    <InsideASequence.Provider value={variant}>
      <CloseTheSection.Provider value={close}>
        <NavigationMenuPrimitive.Sub
          data-slot="navigation-menu-sub"
          orientation="vertical"
          value={open}
          onValueChange={setOpen}
          className="w-full"
        >
          <NavigationMenuPrimitive.List
            className={cn(
              "flex w-full list-none flex-col gap-0",
              /* La sangría deja sitio a la pastilla sin mover el rótulo, y el
                 ancho automático la ensancha en vez de correrla. */
              variant === "drawer" && "gap-0.5",
            )}
          >
            {children}
          </NavigationMenuPrimitive.List>
        </NavigationMenuPrimitive.Sub>
      </CloseTheSection.Provider>
    </InsideASequence.Provider>
  );
};
Sequence.displayName = "Sequence";

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
 * La fila ocupa el sitio que le deja su contenedor: el ancho de un bloque, o lo
 * que queda entre sus hermanos en una fila flex. Si la fila flex lleva
 * `flex-wrap`, el despliegue de móvil cae debajo en una línea propia. Para darle
 * un ancho fijo, envolvela en un `div` con ese ancho.
 *
 * Lo que se agrupa queda en la fila con `hidden` y se vuelve a montar como
 * submenú vertical, así que cada sección conserva su panel tal como se escribió.
 * El grupo es siempre el último `li`, esté o no a la vista.
 */
export const NavigationMenuList: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuListProps> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.List>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.List>,
  NavigationMenuListProps
>(({ className, children, overflowLabel, ...props }, ref) => {
  const more = useElLabel("ui", "more", "Más");
  const groupLabel = overflowLabel ?? more;
  const { setExpanded } = useNavigation("NavigationMenuList");

  const sections = React.useMemo(
    () => React.Children.toArray(children).filter(React.isValidElement),
    [children],
  );

  const id = React.useId();
  const row = React.useRef<HTMLUListElement | null>(null);
  const assign = React.useRef<() => void>(undefined);
  /* Si el script del servidor ya repartio, se arranca de su cuenta. */
  const [onParse] = React.useState(() => countOnParse(id, sections.length));
  const [visible, setVisible] = React.useState(onParse ?? sections.length);
  /* Sin medir aun, la fila recorta: el servidor la pinta entera. */
  const [measured, setMeasured] = React.useState(onParse !== undefined);

  React.useLayoutEffect(() => {
    const list = row.current;
    /* La caja de la fila, que es contra la que se resuelve su ancho: entre ella y
       la raiz puede haber relleno, y ese relleno tambien le quita sitio. */
    const box = list?.parentElement;
    if (!list || !box) return;

    const width = (el: Element) => el.getBoundingClientRect().width;
    const toTheSides = (el: HTMLElement, which: "padding" | "margin") => {
      const e = getComputedStyle(el) as unknown as Record<string, string>;
      return parseFloat(e[`${which}Left`]) + parseFloat(e[`${which}Right`]);
    };

    assign.current = () => {
      /* En movil no se pinta, y sin pintar mide ceros. */
      if (!list.getClientRects().length) return;
      const group = list.querySelector<HTMLElement>(
        ':scope > [data-slot="navigation-menu-overflow"]',
      );
      const items = [...list.children].filter(
        (el): el is HTMLElement => el.tagName === "LI" && el !== group,
      );
      if (!group || items.length !== sections.length) return;

      /* Lo escondido mide cero: se destapa lo justo para medirlo. */
      const covered = [...items, group].filter((el) => el.hidden);
      for (const el of covered) el.hidden = false;
      const widths = items.map(width);
      const groupWidth = width(group);
      for (const el of covered) el.hidden = true;

      /* La caja y no la fila, que a la fila la encoge su contenido. */
      const available =
        width(box) -
        toTheSides(box, "padding") -
        toTheSides(list, "padding") -
        toTheSides(list, "margin");

      /* Lo que ocupan las primeras `n`, contando el grupo solo si queda alguna
         fuera. Se baja desde todas: la ultima que entra hace desaparecer el
         grupo, asi que no crece de forma pareja y no vale buscar de abajo. */
      const taken = (n: number) =>
        widths.slice(0, n).reduce((a, b) => a + b, 0) + (n < sections.length ? groupWidth : 0);

      let fit = sections.length;
      while (fit > 0 && taken(fit) > available) fit -= 1;
      setMeasured(true);
      setVisible(fit);
    };

    const ro = new ResizeObserver(() => assign.current?.());
    ro.observe(box);
    /* Cruzar el breakpoint enciende la fila sin que la barra cambie. */
    ro.observe(list);
    assign.current();
    /* El ancho del rotulo cambia con la tipografia, y eso no lo ve el observer. */
    void document.fonts?.ready.then(() => assign.current?.());
    return () => {
      ro.disconnect();
      assign.current = undefined;
    };
  }, [sections.length]);

  /* Un cambio de rotulo no lo ve el observer. */
  React.useLayoutEffect(() => assign.current?.(), [sections]);

  const inside = sections.map((section, i) =>
    React.cloneElement(section as React.ReactElement<{ hidden?: boolean }>, {
      hidden: i >= visible,
    }),
  );

  return (
    <>
      {/* El de respaldo. Lo esconde el CSS: en servidor no se sabe si hay otro. */}
      <div
        className={cn(
          "flex items-center group-has-[[data-slot=navigation-menu-toggle]:not([data-fallback])]/navigation-menu:hidden md:hidden",
          className,
        )}
      >
        <ExpandButton data-fallback="" />
      </div>

      {/* Un clic en un enlace cierra el despliegue; abrir una sección, no. */}
      <CollapsibleContent
        data-slot="navigation-menu-drawer"
        /* La sangría va acá y no en la lista: el cajón recorta para animarse,
           y desde dentro le cortaría las esquinas a la pastilla. */
        className="order-last -mx-2.5 basis-[calc(100%+1.25rem)] md:hidden"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setExpanded(false);
        }}
      >
        {/* Sin el `className` de la fila: describe una fila, y con un `flex`
            dentro el submenu se encoge a su contenido. */}
        <div className="w-full border-t border-border group-has-[[data-slot=navigation-menu-toggle]:not([data-fallback])]/navigation-menu:border-t-0">
          <Sequence variant="drawer">{sections}</Sequence>
        </div>
      </CollapsibleContent>

      <NavigationMenuPrimitive.List
        data-slot="navigation-menu-list"
        data-row={id}
        data-unmeasured={measured ? undefined : ""}
        data-visible={measured ? visible : undefined}
        ref={(node) => {
          row.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        /* El `-mx` descuenta la pastilla: lo que alinea es el rótulo. */
        /* Sin medir, lo que no cabe pasa a una segunda linea recortada. */
        className={cn(
          "group -mx-2.5 flex flex-1 list-none items-center gap-0 data-[unmeasured]:max-h-9 data-[unmeasured]:flex-wrap data-[unmeasured]:overflow-hidden max-md:hidden",
          className,
        )}
        {...props}
      >
        {inside}
        <NavigationMenuPrimitive.Item
          data-slot="navigation-menu-overflow"
          hidden={visible >= sections.length}
          className="relative shrink-0"
        >
          <NavigationMenuTrigger>{groupLabel}</NavigationMenuTrigger>
          <NavigationMenuContent className="max-h-[min(70vh,30rem)] overflow-y-auto">
            <Sequence variant="group">{sections.slice(visible)}</Sequence>
          </NavigationMenuContent>
        </NavigationMenuPrimitive.Item>
      </NavigationMenuPrimitive.List>
    </>
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
>(({ className, onClick, onPointerEnter, onPointerMove, ...props }, ref) => {
  const sequence = React.useContext(InsideASequence);
  const close = React.useContext(CloseTheSection);
  /* El mismo pestillo que Radix lleva en la raíz, que acá no llega a ponerse. */
  const closedByClick = React.useRef(false);

  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      ref={ref}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || !close) return;
        if (e.currentTarget.dataset.state !== "open") return;
        /* Corta el `onItemSelect` de Radix, que volvería a seleccionarla. */
        e.preventDefault();
        closedByClick.current = true;
        close();
      }}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        closedByClick.current = false;
      }}
      onPointerMove={(e) => {
        onPointerMove?.(e);
        /* El puntero encima la reabriría al primer temblor. */
        if (closedByClick.current && e.pointerType === "mouse") e.preventDefault();
      }}
      className={cn(
        "group inline-flex items-center rounded-md px-2.5 py-1.5 text-base font-medium whitespace-nowrap text-foreground transition-[background-color,color] duration-(--duration-fast) ease-out select-none hover:bg-state-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        sequence
          ? "min-h-9 w-full justify-between text-start font-semibold whitespace-normal"
          : "h-9 w-max justify-center data-[state=open]:bg-state-hover",
        sequence === "drawer" && "min-h-11 px-2.5",
        className,
      )}
      {...props}
    >
      {props.children}
      <ChevronDown
        className={cn(
          "relative top-px ml-1 shrink-0 transition-transform duration-(--duration-base) ease-out group-data-[state=open]:rotate-180",
          /* En una secuencia encabeza una fila alta, y a 12px se pierde. */
          sequence ? "size-4" : "size-3",
        )}
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

const ALIGNMENT: Record<NonNullable<NavigationMenuContentProps["align"]>, string> = {
  /* El ajuste lo mete hacia adentro si se pasa del borde. `w-max` es lo que le
     deja ser mas ancho que su seccion. */
  start:
    "sm:left-[calc(0px-var(--el-nav-ajuste,0px))] sm:w-max sm:max-w-[var(--el-nav-ancho,100%)]",
  end: "sm:left-auto sm:right-0 sm:w-max sm:max-w-[var(--el-nav-ancho,100%)]",
  full: "",
};

/* El megamenú ocupa la barra entera y con el marco de un menú se ve apretado. */
const SLACK: Record<NonNullable<NavigationMenuContentProps["align"]>, string> = {
  start: "p-3",
  end: "p-3",
  full: "px-[var(--el-nav-sangria,0.875rem)] py-5",
};

/* `transition-none` porque el sitio del panel se pone desde JS: sin el, la
   duracion de la animacion se la queda tambien `left`, que arranca en 0, y el
   panel entra desde fuera de la pantalla. La duracion sigue siendo la del
   fotograma, que sale de la misma variable. */
/* El reparto de los grupos lo pone el panel. Va con `:has` para no tocar a
   quien monta su propia caja dentro del panel, y literal porque Tailwind no ve
   una clase interpolada. */
const STACKED =
  "has-[>[data-slot=navigation-menu-group]]:flex has-[>[data-slot=navigation-menu-group]]:flex-col has-[>[data-slot=navigation-menu-group]]:gap-4";
const IN_COLUMNS =
  "has-[>[data-slot=navigation-menu-group]]:grid has-[>[data-slot=navigation-menu-group]]:gap-6 sm:has-[>[data-slot=navigation-menu-group]]:grid-cols-2 lg:has-[>[data-slot=navigation-menu-group]]:grid-cols-3";

const PANEL_FLOATING =
  "absolute top-full left-[var(--el-nav-corrimiento,0px)] z-popover mt-1.5 transition-none w-[var(--el-nav-ancho,100%)] rounded-xl border border-border bg-popover shadow-lg duration-(--duration-fast) ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-top-1 data-[state=closed]:slide-out-to-top-1 sm:min-w-64";

/* El relleno va en el div de adentro: animar un alto con relleno vertical
   aprieta el texto durante la transición. */
/* La contencion lo mide por su contenedor: el grupo no cambia de ancho. */
const PANEL_IN_SEQUENCE =
  "static w-full overflow-hidden [contain:inline-size] data-[state=open]:animate-nav-down data-[state=closed]:animate-nav-up";

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
  const sequence = React.useContext(InsideASequence);

  /* Se mide el hijo: el panel esta animando su alto. */
  React.useLayoutEffect(() => {
    const box = panel;
    const inside = box?.firstElementChild;
    if (!sequence || !box || !inside) return;

    const measure = () => box.style.setProperty("--el-nav-alto", `${box.scrollHeight}px`);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inside);
    return () => ro.disconnect();
  }, [panel, sequence]);

  /* Nada de esto se escribe en CSS: hay que medir la barra y el item. */
  React.useLayoutEffect(() => {
    const box = panel;
    const bar = box?.closest<HTMLElement>('[data-slot="navigation-menu"]');
    const item = box?.closest<HTMLElement>(SELECTOR_ITEM);
    const row = bar?.querySelector<HTMLElement>('[data-slot="navigation-menu-list"]');
    if (sequence || !box || !bar || !item) return;

    const place = () => {
      const b = bar.getBoundingClientRect();
      const i = item.getBoundingClientRect();
      box.style.setProperty("--el-nav-corrimiento", `${b.left - i.left}px`);
      box.style.setProperty("--el-nav-ancho", `${b.width}px`);
      /* Al ancho de la barra se sangra como la fila, para caer a plomo. */
      if (row) {
        const f = row.getBoundingClientRect();
        const indent = f.left + parseFloat(getComputedStyle(row).paddingLeft) - b.left;
        box.style.setProperty("--el-nav-sangria", `${indent}px`);
      }
      /* Se arrima hasta el respiro, y nunca mas alla del otro canto. */
      const outside = i.left + box.offsetWidth - (b.right - ROOM);
      const snap = Math.min(Math.max(0, outside), Math.max(0, i.left - b.left));
      box.style.setProperty("--el-nav-ajuste", `${snap}px`);
    };

    place();
    const ro = new ResizeObserver(place);
    ro.observe(bar);
    ro.observe(box);
    return () => ro.disconnect();
  }, [panel, sequence]);

  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      data-align={align}
      ref={(node) => {
        setPanel(node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        sequence
          ? PANEL_IN_SEQUENCE
          : cn(
              PANEL_FLOATING,
              SLACK[align],
              ALIGNMENT[align],
              align === "full" ? IN_COLUMNS : STACKED,
            ),
        className,
      )}
      {...props}
    >
      {sequence ? (
        /* En el grupo la sangría dice de qué cuelga. Apilado y no en columnas:
           acá el panel es tan ancho como la fila que lo abre. */
        <div className={cn("pb-2", STACKED, sequence === "group" && "ps-3")}>{children}</div>
      ) : (
        children
      )}
    </NavigationMenuPrimitive.Content>
  );
});
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

/** Props de {@link NavigationMenuLink}. */
export type NavigationMenuLinkProps = React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Link
> & {
  /** Segunda línea, para decir a dónde lleva el enlace. */
  description?: React.ReactNode;
};

/** Un enlace del menú. Marcá el actual con `active`. */
export const NavigationMenuLink: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuLinkProps> &
    React.RefAttributes<React.ComponentRef<typeof NavigationMenuPrimitive.Link>>
> = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Link>,
  NavigationMenuLinkProps
>(({ className, description, children, ...props }, ref) => {
  const sequence = React.useContext(InsideASequence);

  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      ref={ref}
      className={cn(
        "inline-flex h-9 w-max items-center justify-center gap-2 rounded-md px-2.5 py-1.5 text-base font-medium whitespace-nowrap text-foreground transition-[background-color,color] duration-(--duration-fast) ease-out select-none hover:bg-state-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none in-data-[slot=navigation-menu-content]:h-auto in-data-[slot=navigation-menu-content]:w-full in-data-[slot=navigation-menu-content]:justify-start",
        sequence && "whitespace-normal",
        sequence === "drawer" && "min-h-11 px-2.5 in-data-[slot=navigation-menu-content]:min-h-9",
        description && "flex-col items-start justify-center gap-0.5",
        className,
      )}
      {...props}
    >
      {/* Sin descripción pasa el hijo tal cual: con `asChild`, el `Slot` de
          Radix exige uno solo y dos lo rompen. */}
      {description ? (
        <>
          {children}
          <span
            data-slot="navigation-menu-link-description"
            className="text-xs font-normal text-muted-foreground"
          >
            {description}
          </span>
        </>
      ) : (
        children
      )}
    </NavigationMenuPrimitive.Link>
  );
});
NavigationMenuLink.displayName = NavigationMenuPrimitive.Link.displayName;

/**
 * Rótulo de un grupo de enlaces dentro de un panel. Separa de lo que viene
 * encima, que es lo que lo distingue de un enlace apagado.
 */
export const NavigationMenuLabel: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentProps<"div">> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      data-slot="navigation-menu-label"
      ref={ref}
      className={cn(
        "px-2.5 pt-3 text-sm font-semibold text-muted-foreground first:pt-0",
        className,
      )}
      {...props}
    />
  ),
);
NavigationMenuLabel.displayName = "NavigationMenuLabel";

/** Props de {@link NavigationMenuGroup}. */
export type NavigationMenuGroupProps = React.ComponentProps<"div"> & {
  /** Rótulo del grupo. Sin él, el grupo solo agrupa. */
  label?: React.ReactNode;
};

/**
 * Un grupo de enlaces dentro de un panel, con su rótulo. El panel los reparte:
 * en columnas donde es ancho, apilados donde no.
 */
export const NavigationMenuGroup: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuGroupProps> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, NavigationMenuGroupProps>(
  ({ className, label, children, ...props }, ref) => (
    <div
      data-slot="navigation-menu-group"
      ref={ref}
      className={cn("flex min-w-0 flex-col gap-1", className)}
      {...props}
    >
      {label ? <NavigationMenuLabel>{label}</NavigationMenuLabel> : null}
      {children}
    </div>
  ),
);
NavigationMenuGroup.displayName = "NavigationMenuGroup";

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
      "top-full flex h-2 items-end justify-center overflow-hidden transition-[width,transform] duration-200 data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in",
      className,
    )}
    {...props}
  >
    <div className="relative top-px h-2 w-2 rotate-45 rounded-sm border-t border-l border-border bg-popover" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;
