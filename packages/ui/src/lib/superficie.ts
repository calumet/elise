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
export const SUPERFICIE =
  "relative rounded-xl bg-card shadow-surface after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-surface-bevel";

/* Caen fuera de la escala de la raíz, así que declaran la suya en el propio
   elemento y lo de adentro resuelve contra la superficie sin saber dónde está. */

/** La franja invertida: la capa que va encima de todo, como un toast. */
export const SUPERFICIE_INVERSA = [
  "bg-inverse text-foreground",
  "[--foreground:var(--inverse-foreground)] [--muted-foreground:var(--inverse-muted-foreground)]",
  "[--info-subtle-foreground:var(--inverse-info)] [--success-subtle-foreground:var(--inverse-success)]",
  "[--warning-subtle-foreground:var(--inverse-warning)] [--destructive-subtle-foreground:var(--inverse-danger)]",
  "[--border-subtle:var(--inverse-border-subtle)] [--border:var(--inverse-border)]",
  "[--input:var(--inverse-input)] [--border-strong:var(--inverse-border-strong)]",
].join(" ");

/** El riel de la navegación. */
export const SUPERFICIE_SIDEBAR = [
  "bg-sidebar text-foreground",
  "[--foreground:var(--sidebar-foreground)] [--muted-foreground:var(--sidebar-muted-foreground)]",
  "[--border:var(--sidebar-border)]",
].join(" ");
