import * as React from "react";

const MOBILE_BREAKPOINT = 768;

const consulta = () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

const suscribir = (avisar: () => void) => {
  const mql = consulta();
  mql.addEventListener("change", avisar);
  return () => mql.removeEventListener("change", avisar);
};

export function useIsMobile(): boolean {
  /* `useSyncExternalStore` en vez de estado más efecto: el efecto no corre en el
     servidor, así que el primer render daba `false` y saltaba al valor real ya
     hidratado. El tercer argumento es lo que se pinta en el servidor. */
  return React.useSyncExternalStore(
    suscribir,
    () => consulta().matches,
    () => false,
  );
}
