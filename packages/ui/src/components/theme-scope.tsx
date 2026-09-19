/**
 * Una sección con su propio tema.
 *
 * Los overlays salen por un portal que los monta en `body`, así que dejan atrás
 * los tokens de la sección de la que salieron. Lo que hay dentro de un
 * `ThemeScope` se lleva su tema al panel, esté donde esté montado, sin mover el
 * portal: moverlo dejaría al panel a merced del `overflow` y del `transform` de
 * la sección, que es por lo que Radix monta en `body`.
 *
 * El tema va en `theme` y la caja en `className`: al panel solo se lleva el
 * primero.
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";

/** El tema de la sección: sus clases y las variables que lleve escritas. */
export type SectionTheme = {
  classes: string;
  variables: React.CSSProperties;
};

const NO_THEME: SectionTheme = { classes: "", variables: {} };
const Tema = React.createContext<SectionTheme>(NO_THEME);

/* Solo las custom properties: el resto del `style` es de la caja, no del tema. */
const variablesDe = (el: HTMLElement): React.CSSProperties => {
  const output: Record<string, string> = {};
  for (let i = 0; i < el.style.length; i += 1) {
    const name = el.style.item(i);
    if (name.startsWith("--")) output[name] = el.style.getPropertyValue(name);
  }
  return output as React.CSSProperties;
};

const same = (a: React.CSSProperties, b: React.CSSProperties) => {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return (
    ka.length === kb.length &&
    ka.every((k) => (a as Record<string, string>)[k] === (b as Record<string, string>)[k])
  );
};

/** Props de {@link ThemeScope}. */
export type ThemeScopeProps = React.ComponentProps<"div"> & {
  /**
   * Las clases del tema, y las únicas que se repintan en el panel. Van aparte
   * de `className` porque una caja con `p-5` repintada ahí le corre las bandas
   * al panel.
   */
  theme?: string;
};

/**
 * Una sección con su propio tema, que alcanza también a sus overlays.
 *
 * El tema puede venir en clases o en variables escritas en el elemento, que es
 * lo que deja `applyTheme` o un color que sale de la base de datos. Las dos
 * viajan al panel. `className` se queda en la caja.
 *
 * ```tsx
 * <ThemeScope theme="seccion-marketing" className="rounded-xl border p-5">…</ThemeScope>
 * <ThemeScope style={{ "--primary": colorDeLaEscuela }}>…</ThemeScope>
 * ```
 */
export const ThemeScope: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ThemeScopeProps> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, ThemeScopeProps>(({ className, theme, ...props }, ref) => {
  const inherited = React.useContext(Tema);
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  const [inlineVars, setInlineVars] = React.useState<React.CSSProperties>(NO_THEME.variables);

  /* Se leen del elemento y no del `style` que llega por props, porque
     `applyTheme` las escribe por su cuenta y después. */
  React.useLayoutEffect(() => {
    if (!node) return;
    const leer = () =>
      setInlineVars((previous) => {
        const now = variablesDe(node);
        return same(previous, now) ? previous : now;
      });
    leer();
    const mo = new MutationObserver(leer);
    mo.observe(node, { attributes: true, attributeFilter: ["style"] });
    return () => mo.disconnect();
  }, [node]);

  /* Estable, que un callback nuevo por render suelta y vuelve a tomar el nodo. */
  const take = React.useCallback(
    (n: HTMLDivElement | null) => {
      setNode(n);
      if (typeof ref === "function") ref(n);
      else if (ref) ref.current = n;
    },
    [ref],
  );

  /* Anidados se suman, que un tema dentro de otro solo redefine lo suyo. */
  const tema = React.useMemo(
    () => ({
      classes: cn(inherited.classes, theme),
      variables: { ...inherited.variables, ...inlineVars },
    }),
    [inherited, theme, inlineVars],
  );

  return (
    <Tema.Provider value={tema}>
      <div data-slot="theme-scope" ref={take} className={cn(theme, className)} {...props} />
    </Tema.Provider>
  );
});
ThemeScope.displayName = "ThemeScope";

/** El tema de la sección en la que estás, para llevarlo a lo que salga por portal. */
export const useThemeScope = (): SectionTheme => React.useContext(Tema);
