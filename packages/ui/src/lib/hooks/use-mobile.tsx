import * as React from "react";

const MOBILE_BREAKPOINT = 768;

const mediaQuery = () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

const subscribe = (notify: () => void) => {
  const mql = mediaQuery();
  mql.addEventListener("change", notify);
  return () => mql.removeEventListener("change", notify);
};

export function useIsMobile(): boolean {
  // El tercer argumento es lo que vale en el servidor, donde no hay `matchMedia`.
  return React.useSyncExternalStore(
    subscribe,
    () => mediaQuery().matches,
    () => false,
  );
}
