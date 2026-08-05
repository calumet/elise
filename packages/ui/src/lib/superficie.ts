/**
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
