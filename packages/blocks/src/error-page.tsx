import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@calumet/elise-ui/empty-state";
import { Text } from "@calumet/elise-ui/text";
import * as React from "react";

import { cn } from "./cn";

export type ErrorPageProps = Omit<React.ComponentProps<"div">, "title"> & {
  /**
   * El código, del tipo `404`. Va arriba y pequeño, no como número gigante: lo
   * que necesita quien llegó acá es saber qué hacer, y el código es dato para
   * el que después abra un ticket.
   */
  code?: React.ReactNode;

  title: React.ReactNode;
  description?: React.ReactNode;

  /** Un icono o una ilustración, encima del código. */
  media?: React.ReactNode;

  /** La salida. Siempre tiene que haber una, aunque sea volver al inicio. */
  actions?: React.ReactNode;

  /**
   * Ocupa el alto de la ventana. Ponelo en `false` cuando el error es de una
   * zona de la pantalla y no de la pantalla entera, como una tarjeta que no
   * pudo cargar.
   */
  full?: boolean;
};

/**
 * Lo que se ve cuando algo no está o falló: 404, 403, 500, o una zona que no
 * cargó.
 *
 * Es un `role="alert"` porque el usuario no pidió esto: llegó a otra cosa y se
 * encontró con un error, así que un lector de pantalla tiene que anunciarlo sin
 * esperar a que alguien lo recorra.
 */
function ErrorPage({
  className,
  code,
  title,
  description,
  media,
  actions,
  full = true,
  children,
  ...props
}: ErrorPageProps) {
  return (
    <div
      data-slot="error-page"
      role="alert"
      className={cn(
        "flex w-full flex-col items-center justify-center px-4",
        full && "min-h-svh",
        className,
      )}
      {...props}
    >
      <EmptyState className="max-w-md">
        {media ? <EmptyStateMedia>{media}</EmptyStateMedia> : null}
        {code ? (
          <Text
            as="p"
            size="xs"
            weight="semibold"
            tone="muted"
            data-slot="error-page-code"
            className="tracking-widest uppercase"
          >
            {code}
          </Text>
        ) : null}
        <EmptyStateTitle>{title}</EmptyStateTitle>
        {description ? <EmptyStateDescription>{description}</EmptyStateDescription> : null}
        {children}
        {actions ? <EmptyStateActions>{actions}</EmptyStateActions> : null}
      </EmptyState>
    </div>
  );
}

export { ErrorPage };
