/**
 * Las superficies del sistema: el contorno de la tarjeta y las dos que llevan su
 * propia escala de texto.
 *
 * Contorno de superficie: la sombra de 1px por fuera y el bisel por dentro, con
 * el bisel en una capa aparte, un `::after`, en vez de como sombra interior del
 * propio marco.
 *
 * Una sombra interior se pinta por debajo del fondo de los descendientes, así
 * que un encabezado con fondo opaco se comía su tramo de bisel: el contorno
 * salía marcado a los lados del cuerpo y liso a los del encabezado. La capa va
 * por encima del contenido y el contorno queda igual en todo el perímetro.
 *
 * Vive suelto y no dentro de un componente porque lo comparten los tres marcos
 * del sistema: la tarjeta, la tabla y la tabla de datos. Repartido, uno se
 * queda atrás y acaban conviviendo dos contornos en la misma pantalla.
 */
export const SURFACE =
  "relative rounded-xl bg-card shadow-surface after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-surface-bevel";

/**
 * El panel de los menús: `DropdownMenu`, `ContextMenu` y `Menubar`. Cada uno le
 * suma su ancho mínimo y su animación.
 */
export const MENU_PANEL = "z-popover rounded-xl border border-border bg-popover p-1 shadow-lg";

/**
 * Una opción de menú. La comparten los tres menús y `Select`; la paleta de
 * comandos usa el mismo alto y el mismo resaltado con los atributos de `cmdk`.
 * 32px, el `sm` de la escala: antes eran 36 aquí, 32 en el combobox y 44 en la
 * paleta.
 */
export const MENU_ITEM =
  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-3 py-1.5 text-base text-foreground outline-none transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out data-highlighted:bg-state-hover data-highlighted:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon-md";

/* Caen fuera de la escala de la raíz, así que declaran la suya en el propio
   elemento y lo de adentro resuelve contra la superficie sin saber dónde está. */

const INVERSE_TOKENS: string = [
  "text-foreground",
  "[--foreground:var(--inverse-foreground)]",
  "[--info-subtle-foreground:var(--inverse-info)] [--success-subtle-foreground:var(--inverse-success)]",
  "[--warning-subtle-foreground:var(--inverse-warning)] [--destructive-subtle-foreground:var(--inverse-danger)]",
  "[--border-subtle:var(--inverse-border-subtle)] [--border:var(--inverse-border)]",
  "[--input:var(--inverse-input)] [--border-strong:var(--inverse-border-strong)]",
  "[--state-hover:rgb(255_255_255/5%)] [--state-active:rgb(255_255_255/9%)]",
].join(" ");

/** La franja invertida: la capa que va encima de todo, como un toast. */
export const INVERSE_SURFACE: string = `bg-inverse [--muted-foreground:var(--inverse-muted-foreground)] ${INVERSE_TOKENS}`;

export const SCRIM_SURFACE: string = `bg-linear-to-t from-[oklch(0_0_0/0.8)] via-[oklch(0_0_0/0.5)] via-40% to-transparent to-75% [--muted-foreground:oklch(0.9_0.01_265)] ${INVERSE_TOKENS}`;

/** El riel de la navegación. */
export const SIDEBAR_SURFACE: string = [
  "bg-sidebar text-foreground",
  "[--foreground:var(--sidebar-foreground)] [--muted-foreground:var(--sidebar-muted-foreground)]",
  "[--border:var(--sidebar-border)]",
].join(" ");
