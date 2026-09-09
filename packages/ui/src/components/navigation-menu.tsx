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
import { useElLabel } from "@/lib/i18n";

/* El grupo de desbordamiento es un item aunque no lleve el mismo `data-slot`. */
const SELECTOR_ITEM = '[data-slot="navigation-menu-item"],[data-slot="navigation-menu-overflow"]';

/* Lo que separa el panel del canto de la barra, igual que del borde de abajo. */
const RESPIRO = 6;

/* En una secuencia el panel no flota: cae en el flujo y se abre en alto. */
type Secuencia = "grupo" | "cajon";

const DentroDeUnaSecuencia: React.Context<Secuencia | null> = React.createContext<Secuencia | null>(
  null,
);

/* Radix solo alterna en la raíz: el `onItemSelect` de un `Sub` asigna sin
   comparar, y la sección no se cierra sola. */
const CerrarLaSeccion = React.createContext<(() => void) | null>(null);

type ContextoNavegacion = {
  desplegado: boolean;
  setDesplegado: (v: boolean) => void;
};

const Navegacion = React.createContext<ContextoNavegacion | null>(null);

const BOTON_DESPLIEGUE =
  "group relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* La caja de Radix alrededor de la fila, que quien usa el componente no alcanza. */
const CAJA_DE_LA_FILA =
  "[&_div:has(>[data-slot=navigation-menu-list])]:min-w-0 [&_div:has(>[data-slot=navigation-menu-list])]:flex-1";

/* El reparto en JS plano, para correr al parsear el HTML del servidor, antes de pintar. */
const REPARTO_AL_PARSEAR = `(function(){var s=document.currentScript,r=s&&s.parentElement;if(!r)return;var filas=r.querySelectorAll('[data-slot="navigation-menu-list"]');for(var k=0;k<filas.length;k++){var u=filas[k];if(!u.getClientRects().length)continue;var c=u.parentElement,g=null,li=[];for(var i=0;i<u.children.length;i++){var e=u.children[i];if(e.tagName!=="LI")continue;if(e.getAttribute("data-slot")==="navigation-menu-overflow")g=e;else li.push(e)}if(!g||!c)continue;var w=function(e){return e.getBoundingClientRect().width},p=function(e,q){var t=getComputedStyle(e);return parseFloat(t[q+"Left"])+parseFloat(t[q+"Right"])};g.hidden=false;var ag=w(g);g.hidden=true;var a=li.map(w),d=w(c)-p(c,"padding")-p(u,"padding")-p(u,"margin"),n=li.length,o=function(m){var t=0;for(var j=0;j<m;j++)t+=a[j];return t+(m<li.length?ag:0)};while(n>0&&o(n)>d)n--;for(i=0;i<li.length;i++)li[i].hidden=i>=n;g.hidden=n===li.length;u.removeAttribute("data-sin-medir");u.setAttribute("data-visibles",String(n))}})();`;

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
  const [desplegado, setDesplegado] = React.useState(false);

  const ctx = React.useMemo(() => ({ desplegado, setDesplegado }), [desplegado]);

  return (
    <Navegacion.Provider value={ctx}>
      <Collapsible open={desplegado} onOpenChange={setDesplegado} asChild>
        <NavigationMenuPrimitive.Root
          data-slot="navigation-menu"
          ref={ref}
          className={cn(
            "group/navigation-menu relative flex w-full min-w-0 flex-col",
            CAJA_DE_LA_FILA,
            className,
          )}
          {...props}
        >
          {children}
          {/* Lo que crea React no se ejecuta. */}
          <script nonce={nonce} dangerouslySetInnerHTML={{ __html: REPARTO_AL_PARSEAR }} />
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
 *
 * La caja lleva holgura alrededor del glifo. Contra el borde de un contenedor
 * con relleno, el relleno de ese lado es el que se la baja; está en las reglas
 * de interfaz.
 */
export const NavigationMenuToggle: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentProps<"button">> & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    useNavegacion("NavigationMenuToggle");
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

/* La cuenta que dejo el script del servidor, si corrio. */
const cuentaAlParsear = (id: string, total: number): number | undefined => {
  if (typeof document === "undefined") return undefined;
  for (const el of document.querySelectorAll('[data-slot="navigation-menu-list"][data-visibles]')) {
    if (el.getAttribute("data-fila") !== id) continue;
    const n = Number(el.getAttribute("data-visibles"));
    return Number.isInteger(n) && n >= 0 && n <= total ? n : undefined;
  }
  return undefined;
};

/* El `Sub` va controlado: es de donde el disparador vacía la sección. */
const Secuencia = ({
  variante,
  children,
}: {
  variante: Secuencia;
  children: React.ReactNode;
}): React.JSX.Element => {
  const [abierta, setAbierta] = React.useState("");
  const cerrar = React.useCallback(() => setAbierta(""), []);

  return (
    <DentroDeUnaSecuencia.Provider value={variante}>
      <CerrarLaSeccion.Provider value={cerrar}>
        <NavigationMenuPrimitive.Sub
          data-slot="navigation-menu-sub"
          orientation="vertical"
          value={abierta}
          onValueChange={setAbierta}
          className="w-full"
        >
          <NavigationMenuPrimitive.List
            className={cn(
              "flex w-full list-none flex-col gap-0",
              variante === "cajon" && "divide-y divide-border",
            )}
          >
            {children}
          </NavigationMenuPrimitive.List>
        </NavigationMenuPrimitive.Sub>
      </CerrarLaSeccion.Provider>
    </DentroDeUnaSecuencia.Provider>
  );
};
Secuencia.displayName = "Secuencia";

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
  const mas = useElLabel("ui", "more", "Más");
  const rotuloGrupo = overflowLabel ?? mas;
  const { setDesplegado } = useNavegacion("NavigationMenuList");

  const secciones = React.useMemo(
    () => React.Children.toArray(children).filter(React.isValidElement),
    [children],
  );

  const id = React.useId();
  const fila = React.useRef<HTMLUListElement | null>(null);
  const repartir = React.useRef<() => void>(undefined);
  /* Si el script del servidor ya repartio, se arranca de su cuenta. */
  const [alParsear] = React.useState(() => cuentaAlParsear(id, secciones.length));
  const [visibles, setVisibles] = React.useState(alParsear ?? secciones.length);
  /* Sin medir aun, la fila recorta: el servidor la pinta entera. */
  const [medido, setMedido] = React.useState(alParsear !== undefined);

  React.useLayoutEffect(() => {
    const lista = fila.current;
    /* La caja de la fila, que es contra la que se resuelve su ancho: entre ella y
       la raiz puede haber relleno, y ese relleno tambien le quita sitio. */
    const caja = lista?.parentElement;
    if (!lista || !caja) return;

    const ancho = (el: Element) => el.getBoundingClientRect().width;
    const aLosLados = (el: HTMLElement, cual: "padding" | "margin") => {
      const e = getComputedStyle(el) as unknown as Record<string, string>;
      return parseFloat(e[`${cual}Left`]) + parseFloat(e[`${cual}Right`]);
    };

    repartir.current = () => {
      /* En movil no se pinta, y sin pintar mide ceros. */
      if (!lista.getClientRects().length) return;
      const grupo = lista.querySelector<HTMLElement>(
        ':scope > [data-slot="navigation-menu-overflow"]',
      );
      const items = [...lista.children].filter(
        (el): el is HTMLElement => el.tagName === "LI" && el !== grupo,
      );
      if (!grupo || items.length !== secciones.length) return;

      /* Lo escondido mide cero: se destapa lo justo para medirlo. */
      const tapados = [...items, grupo].filter((el) => el.hidden);
      for (const el of tapados) el.hidden = false;
      const anchos = items.map(ancho);
      const anchoGrupo = ancho(grupo);
      for (const el of tapados) el.hidden = true;

      /* La caja y no la fila, que a la fila la encoge su contenido. */
      const disponible =
        ancho(caja) -
        aLosLados(caja, "padding") -
        aLosLados(lista, "padding") -
        aLosLados(lista, "margin");

      /* Lo que ocupan las primeras `n`, contando el grupo solo si queda alguna
         fuera. Se baja desde todas: la ultima que entra hace desaparecer el
         grupo, asi que no crece de forma pareja y no vale buscar de abajo. */
      const ocupado = (n: number) =>
        anchos.slice(0, n).reduce((a, b) => a + b, 0) + (n < secciones.length ? anchoGrupo : 0);

      let caben = secciones.length;
      while (caben > 0 && ocupado(caben) > disponible) caben -= 1;
      setMedido(true);
      setVisibles(caben);
    };

    const ro = new ResizeObserver(() => repartir.current?.());
    ro.observe(caja);
    /* Cruzar el breakpoint enciende la fila sin que la barra cambie. */
    ro.observe(lista);
    repartir.current();
    /* El ancho del rotulo cambia con la tipografia, y eso no lo ve el observer. */
    void document.fonts?.ready.then(() => repartir.current?.());
    return () => {
      ro.disconnect();
      repartir.current = undefined;
    };
  }, [secciones.length]);

  /* Un cambio de rotulo no lo ve el observer. */
  React.useLayoutEffect(() => repartir.current?.(), [secciones]);

  const dentro = secciones.map((seccion, i) =>
    React.cloneElement(seccion as React.ReactElement<{ hidden?: boolean }>, {
      hidden: i >= visibles,
    }),
  );

  return (
    <>
      {/* El de respaldo. Lo esconde el CSS: en servidor no se sabe si hay otro. */}
      <div
        className={cn(
          "flex items-center md:hidden group-has-[[data-slot=navigation-menu-toggle]:not([data-respaldo])]/navigation-menu:hidden",
          className,
        )}
      >
        <BotonDespliegue data-respaldo="" />
      </div>

      {/* Un clic en un enlace cierra el despliegue; abrir una sección, no. */}
      <CollapsibleContent
        data-slot="navigation-menu-drawer"
        className="order-last basis-full md:hidden"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setDesplegado(false);
        }}
      >
        {/* Sin el `className` de la fila: describe una fila, y con un `flex`
            dentro el submenu se encoge a su contenido. */}
        <div className="w-full border-t border-border group-has-[[data-slot=navigation-menu-toggle]:not([data-respaldo])]/navigation-menu:border-t-0">
          <Secuencia variante="cajon">{secciones}</Secuencia>
        </div>
      </CollapsibleContent>

      <NavigationMenuPrimitive.List
        data-slot="navigation-menu-list"
        data-fila={id}
        data-sin-medir={medido ? undefined : ""}
        data-visibles={medido ? visibles : undefined}
        ref={(nodo) => {
          fila.current = nodo;
          if (typeof ref === "function") ref(nodo);
          else if (ref) ref.current = nodo;
        }}
        /* El `-mx` descuenta la pastilla: lo que alinea es el rótulo. */
        /* Sin medir, lo que no cabe pasa a una segunda linea recortada. */
        className={cn(
          "group -mx-2.5 flex flex-1 list-none items-center gap-0 max-md:hidden data-[sin-medir]:max-h-9 data-[sin-medir]:flex-wrap data-[sin-medir]:overflow-hidden",
          className,
        )}
        {...props}
      >
        {dentro}
        <NavigationMenuPrimitive.Item
          data-slot="navigation-menu-overflow"
          hidden={visibles >= secciones.length}
          className="relative shrink-0"
        >
          <NavigationMenuTrigger>{rotuloGrupo}</NavigationMenuTrigger>
          <NavigationMenuContent className="max-h-[min(70vh,30rem)] overflow-y-auto">
            <Secuencia variante="grupo">{secciones.slice(visibles)}</Secuencia>
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
  const secuencia = React.useContext(DentroDeUnaSecuencia);
  const cerrar = React.useContext(CerrarLaSeccion);
  /* El mismo pestillo que Radix lleva en la raíz, que acá no llega a ponerse. */
  const cerradoPorClic = React.useRef(false);

  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      ref={ref}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || !cerrar) return;
        if (e.currentTarget.dataset.state !== "open") return;
        /* Corta el `onItemSelect` de Radix, que volvería a seleccionarla. */
        e.preventDefault();
        cerradoPorClic.current = true;
        cerrar();
      }}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        cerradoPorClic.current = false;
      }}
      onPointerMove={(e) => {
        onPointerMove?.(e);
        /* El puntero encima la reabriría al primer temblor. */
        if (cerradoPorClic.current && e.pointerType === "mouse") e.preventDefault();
      }}
      className={cn(
        "group inline-flex select-none items-center whitespace-nowrap rounded-md px-2.5 py-1.5 text-base font-medium text-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        secuencia
          ? "min-h-9 w-full justify-between whitespace-normal text-start"
          : "h-9 w-max justify-center data-[state=open]:bg-state-hover",
        secuencia === "cajon" && "min-h-11 px-0",
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

/* `transition-none` porque el sitio del panel se pone desde JS: sin el, la
   duracion de la animacion se la queda tambien `left`, que arranca en 0, y el
   panel entra desde fuera de la pantalla. La duracion sigue siendo la del
   fotograma, que sale de la misma variable. */
const PANEL_FLOTANTE =
  "absolute top-full left-[var(--el-nav-corrimiento,0px)] z-popover mt-1.5 transition-none w-[var(--el-nav-ancho,100%)] rounded-xl border border-border bg-popover shadow-lg duration-(--duration-fast) ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-top-1 data-[state=closed]:slide-out-to-top-1 sm:min-w-64";

/* El relleno va en el div de adentro: animar un alto con relleno vertical
   aprieta el texto durante la transición. */
/* La contencion lo mide por su contenedor: el grupo no cambia de ancho. */
const PANEL_EN_SECUENCIA =
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
      /* Se arrima hasta el respiro, y nunca mas alla del otro canto. */
      const fuera = i.left + caja.offsetWidth - (b.right - RESPIRO);
      const arrimo = Math.min(Math.max(0, fuera), Math.max(0, i.left - b.left));
      caja.style.setProperty("--el-nav-ajuste", `${arrimo}px`);
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
        secuencia && "whitespace-normal",
        secuencia === "cajon" && "min-h-11 px-0",
        className,
      )}
      {...props}
    />
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
  ({ className, ...props }, ref) => {
    const secuencia = React.useContext(DentroDeUnaSecuencia);

    return (
      <div
        data-slot="navigation-menu-label"
        ref={ref}
        className={cn(
          "px-2.5 pt-5 text-sm font-semibold text-muted-foreground",
          secuencia === "cajon" && "px-0",
          className,
        )}
        {...props}
      />
    );
  },
);
NavigationMenuLabel.displayName = "NavigationMenuLabel";

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
