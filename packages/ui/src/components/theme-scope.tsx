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

const Tema = React.createContext("");

/** Props de {@link ThemeScope}. */
export type ThemeScopeProps = React.ComponentProps<"div">;

/**
 * Una sección con su propio tema, que alcanza también a sus overlays.
 *
 * Las clases que le pases definen los tokens, igual que en cualquier otra caja;
 * lo que añade es que los paneles que salgan de dentro las lleven puestas.
 *
 * ```tsx
 * <ThemeScope className="seccion-marketing">
 *   <Popover>…</Popover>
 * </ThemeScope>
 * ```
 */
export const ThemeScope: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ThemeScopeProps> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, ThemeScopeProps>(({ className, ...props }, ref) => {
  /* Anidados se suman, que un tema dentro de otro solo redefine lo suyo. */
  const heredado = React.useContext(Tema);
  const propio = cn(heredado, className);

  return (
    <Tema.Provider value={propio}>
      <div data-slot="theme-scope" ref={ref} className={className} {...props} />
    </Tema.Provider>
  );
});
ThemeScope.displayName = "ThemeScope";

/** El tema de la sección en la que estás, para llevarlo a lo que salga por portal. */
export const useThemeScope = (): string => React.useContext(Tema);
