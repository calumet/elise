/**
 * Una sección con su propio tema.
 *
 * Los overlays salen por un portal que los monta en `body`, así que dejan atrás
 * los tokens de la sección de la que salieron. Lo que hay dentro de un
 * `ThemeScope` se lleva su tema al panel, esté donde esté montado, sin mover el
 * portal: moverlo dejaría al panel a merced del `overflow` y del `transform` de
 * la sección, que es por lo que Radix monta en `body`.
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";

/** El tema de la sección: sus clases y las variables que lleve escritas. */
export type TemaDeSeccion = {
  clases: string;
  variables: React.CSSProperties;
};

const SIN_TEMA: TemaDeSeccion = { clases: "", variables: {} };
const Tema = React.createContext<TemaDeSeccion>(SIN_TEMA);

/* Solo las custom properties: el resto del `style` es de la caja, no del tema. */
const variablesDe = (el: HTMLElement): React.CSSProperties => {
  const salida: Record<string, string> = {};
  for (let i = 0; i < el.style.length; i += 1) {
    const nombre = el.style.item(i);
    if (nombre.startsWith("--")) salida[nombre] = el.style.getPropertyValue(nombre);
  }
  return salida as React.CSSProperties;
};

const mismas = (a: React.CSSProperties, b: React.CSSProperties) => {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return (
    ka.length === kb.length &&
    ka.every((k) => (a as Record<string, string>)[k] === (b as Record<string, string>)[k])
  );
};

/** Props de {@link ThemeScope}. */
export type ThemeScopeProps = React.ComponentProps<"div">;

/**
 * Una sección con su propio tema, que alcanza también a sus overlays.
 *
 * El tema puede venir en clases o en variables escritas en el elemento, que es
 * lo que deja `applyTheme` o un color que sale de la base de datos. Las dos
 * viajan al panel.
 *
 * ```tsx
 * <ThemeScope className="seccion-marketing">…</ThemeScope>
 * <ThemeScope style={{ "--primary": colorDeLaEscuela }}>…</ThemeScope>
 * ```
 */
export const ThemeScope: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ThemeScopeProps> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, ThemeScopeProps>(({ className, ...props }, ref) => {
  const heredado = React.useContext(Tema);
  const [nodo, setNodo] = React.useState<HTMLDivElement | null>(null);
  const [enLinea, setEnLinea] = React.useState<React.CSSProperties>(SIN_TEMA.variables);

  /* Se leen del elemento y no del `style` que llega por props, porque
     `applyTheme` las escribe por su cuenta y después. */
  React.useLayoutEffect(() => {
    if (!nodo) return;
    const leer = () =>
      setEnLinea((previo) => {
        const ahora = variablesDe(nodo);
        return mismas(previo, ahora) ? previo : ahora;
      });
    leer();
    const mo = new MutationObserver(leer);
    mo.observe(nodo, { attributes: true, attributeFilter: ["style"] });
    return () => mo.disconnect();
  }, [nodo]);

  /* Estable, que un callback nuevo por render suelta y vuelve a tomar el nodo. */
  const tomar = React.useCallback(
    (n: HTMLDivElement | null) => {
      setNodo(n);
      if (typeof ref === "function") ref(n);
      else if (ref) ref.current = n;
    },
    [ref],
  );

  /* Anidados se suman, que un tema dentro de otro solo redefine lo suyo. */
  const tema = React.useMemo(
    () => ({
      clases: cn(heredado.clases, className),
      variables: { ...heredado.variables, ...enLinea },
    }),
    [heredado, className, enLinea],
  );

  return (
    <Tema.Provider value={tema}>
      <div data-slot="theme-scope" ref={tomar} className={className} {...props} />
    </Tema.Provider>
  );
});
ThemeScope.displayName = "ThemeScope";

/** El tema de la sección en la que estás, para llevarlo a lo que salga por portal. */
export const useThemeScope = (): TemaDeSeccion => React.useContext(Tema);
