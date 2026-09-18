import * as React from "react";

const MOBILE_BREAKPOINT = 768;

const consulta = () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

const suscribir = (avisar: () => void) => {
  const mql = consulta();
  mql.addEventListener("change", avisar);
  return () => mql.removeEventListener("change", avisar);
};

export function useIsMobile(): boolean {
  // El tercer argumento es lo que vale en el servidor, donde no hay `matchMedia`.
  return React.useSyncExternalStore(
    suscribir,
    () => consulta().matches,
    () => false,
  );
}
