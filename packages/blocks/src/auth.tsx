import { Card, CardContent } from "@calumet/elise-ui/card";
import { Text } from "@calumet/elise-ui/text";
import * as React from "react";

import { cn } from "./cn";

export type AuthPageProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** La marca, encima del título. Un logo, no un rótulo. */
  brand?: React.ReactNode;

  title: React.ReactNode;
  description?: React.ReactNode;

  /** Lo que va debajo de la tarjeta: «¿no tenés cuenta?», los términos. */
  footer?: React.ReactNode;

  /** Sin tarjeta, para empotrarla en una pantalla que ya la pone. */
  bare?: boolean;
};

/**
 * Entrar, registrarse, recuperar la contraseña: una columna estrecha centrada
 * en la pantalla, con el formulario dentro de una tarjeta.
 *
 * Se centra en el alto de la ventana y no del contenido, así que la caja queda
 * en el mismo sitio tanto si el formulario tiene dos campos como cinco. Con
 * `min-h-svh` y no `min-h-screen`, que en un móvil la barra del navegador se
 * come lo segundo y deja la caja partida por abajo.
 */
function AuthPage({
  className,
  brand,
  title,
  description,
  footer,
  bare = false,
  children,
  ...props
}: AuthPageProps) {
  const cabecera = (
    <div className="flex flex-col items-center gap-2 text-center">
      {brand ? <div data-slot="auth-brand">{brand}</div> : null}
      <Text as="h1" size="xl" weight="semibold">
        {title}
      </Text>
      {description ? (
        <Text as="p" size="sm" tone="muted">
          {description}
        </Text>
      ) : null}
    </div>
  );

  return (
    <div
      data-slot="auth-page"
      className={cn(
        "flex min-h-svh w-full flex-col items-center justify-center gap-6 px-4 py-10",
        className,
      )}
      {...props}
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        {cabecera}

        {bare ? (
          <div data-slot="auth-body" className="flex flex-col gap-4">
            {children}
          </div>
        ) : (
          <Card data-slot="auth-body">
            <CardContent className="flex flex-col gap-4">{children}</CardContent>
          </Card>
        )}

        {footer ? (
          <div data-slot="auth-footer" className="text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { AuthPage };
