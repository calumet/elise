import { Container, type ContainerProps } from "@calumet/elise-ui/container";
import { Text } from "@calumet/elise-ui/text";
import * as React from "react";

import { cn } from "./cn";

export type PageHeaderProps = Omit<React.ComponentProps<"header">, "title"> & {
  /** El título de la pantalla. Se renderiza como el `<h1>` de la página. */
  heading: React.ReactNode;

  /** Una línea que explica de qué va la pantalla, debajo del título. */
  subtitle?: React.ReactNode;

  /** Estado que acompaña al título, en la misma línea. Normalmente un `Badge`. */
  headingMetadata?: React.ReactNode;

  /**
   * La etiqueta del título. Por defecto `h1`, que es lo que corresponde a una
   * pantalla.
   *
   * Se baja a `h2` cuando la pantalla va empotrada dentro de otra cosa (un
   * panel, un paso de un asistente, una vitrina), donde el `h1` del documento
   * ya está puesto y meter un segundo deja el esquema de encabezados roto.
   */
  headingAs?: "h1" | "h2" | "h3";

  /**
   * Oculta el título a la vista sin quitarlo del árbol de accesibilidad.
   *
   * Para la pantalla cuyo título ya está dicho en otro sitio, como una ficha
   * que se abre desde una fila y repite el nombre que se acaba de pulsar.
   */
  headingHidden?: boolean;

  /** La vuelta al listado del que se llegó. Un enlace, no un botón. */
  backAction?: React.ReactNode;

  /** La acción de la pantalla. Una sola, y sólida. */
  primaryAction?: React.ReactNode;

  /** Lo que acompaña a la principal: exportar, duplicar, un menú de más. */
  secondaryActions?: React.ReactNode;
};

/**
 * La cabecera de una pantalla: de dónde vengo, cómo se llama esto y qué puedo
 * hacer acá.
 *
 * Está aparte de `Page` porque hay pantallas que ya traen su propio marco (un
 * panel, un paso de un asistente) y solo quieren la cabecera.
 *
 * El título es el `<h1>`. Una pantalla tiene uno y este es el suyo, así que
 * ponerlo dentro deja de ser decisión de quien la escribe.
 */
function PageHeader({
  className,
  heading,
  subtitle,
  headingMetadata,
  headingAs = "h1",
  headingHidden,
  backAction,
  primaryAction,
  secondaryActions,
  children,
  ...props
}: PageHeaderProps) {
  const acciones = primaryAction || secondaryActions;

  return (
    <header data-slot="page-header" className={cn("flex flex-col gap-1", className)} {...props}>
      {backAction ? <div data-slot="page-header-back">{backAction}</div> : null}

      {/* Se envuelve, y el título encoge mientras las acciones no. Sin eso, en
          una pantalla estrecha las acciones se montan sobre el título en vez
          de bajar a su propio renglón. */}
      <div
        data-slot="page-header-row"
        className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2"
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <Text
              as={headingAs}
              size="xl"
              weight="semibold"
              data-slot="page-header-heading"
              className={cn(headingHidden && "sr-only")}
            >
              {heading}
            </Text>
            {headingMetadata}
          </div>
          {subtitle ? (
            <Text as="p" size="sm" tone="muted" data-slot="page-header-subtitle">
              {subtitle}
            </Text>
          ) : null}
        </div>

        {acciones ? (
          <div data-slot="page-header-actions" className="flex flex-wrap items-center gap-2">
            {secondaryActions}
            {primaryAction}
          </div>
        ) : null}
      </div>

      {children}
    </header>
  );
}

export type PageProps = Omit<React.ComponentProps<"div">, "title"> &
  Omit<PageHeaderProps, keyof React.ComponentProps<"header">> & {
    /**
     * El ancho de la pantalla. Sale de `Container`, que es el dueño de los
     * anchos del sistema; una pantalla no inventa el suyo.
     */
    size?: ContainerProps["size"];

    /** Contenido de apoyo, en una columna al lado. Vacío, no ocupa nada. */
    aside?: React.ReactNode;

    /** Nombre accesible de esa columna, si la pantalla tiene más de una. */
    asideLabel?: string;
  };

/**
 * Una pantalla: la cabecera, el contenido y, si hace falta, una columna de
 * apoyo al lado.
 *
 * No es el `<main>`, que ese lo pone el marco de la aplicación. Es lo que va
 * dentro, y por eso se puede montar sola en una pantalla sin marco.
 */
function Page({
  className,
  size = "lg",
  aside,
  asideLabel,
  heading,
  subtitle,
  headingMetadata,
  headingAs,
  headingHidden,
  backAction,
  primaryAction,
  secondaryActions,
  children,
  ...props
}: PageProps) {
  return (
    <Container data-slot="page" size={size} className={cn("flex flex-col gap-5", className)}>
      <PageHeader
        heading={heading}
        subtitle={subtitle}
        headingMetadata={headingMetadata}
        headingAs={headingAs}
        headingHidden={headingHidden}
        backAction={backAction}
        primaryAction={primaryAction}
        secondaryActions={secondaryActions}
      />

      {aside ? (
        /* `minmax(0,1fr)` y no `1fr`: una pista `1fr` no baja de su contenido,
           así que una tabla ancha empujaba la columna de apoyo fuera de la
           pantalla en vez de desplazarse dentro de la suya. */
        <div
          data-slot="page-body"
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
          {...props}
        >
          <div className="flex min-w-0 flex-col gap-5">{children}</div>
          <aside
            data-slot="page-aside"
            aria-label={asideLabel}
            className="flex min-w-0 flex-col gap-5"
          >
            {aside}
          </aside>
        </div>
      ) : (
        <div data-slot="page-body" className="flex min-w-0 flex-col gap-5" {...props}>
          {children}
        </div>
      )}
    </Container>
  );
}

export { Page, PageHeader };
