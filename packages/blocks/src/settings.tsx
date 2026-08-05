import { Text } from "@calumet/elise-ui/text";
import * as React from "react";

import { cn } from "./cn";

export type SettingsSectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode;

  /** Para qué sirve el grupo. Va en la columna del rótulo, no dentro. */
  description?: React.ReactNode;
};

/**
 * Un grupo de ajustes: a la izquierda de qué va, a la derecha los controles.
 *
 * La explicación va fuera de la tarjeta a propósito. Metida dentro, compite con
 * los rótulos de los propios campos y se lee como uno más; fuera, es lo que
 * hace que se pueda recorrer una pantalla larga de ajustes leyendo solo la
 * columna de la izquierda.
 *
 * Por debajo de 1024px se apila, con el rótulo encima de los controles.
 */
function SettingsSection({
  className,
  title,
  description,
  children,
  ...props
}: SettingsSectionProps) {
  return (
    <section
      data-slot="settings-section"
      className={cn("grid gap-3 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8", className)}
      {...props}
    >
      <div data-slot="settings-annotation" className="flex min-w-0 flex-col gap-1">
        <Text as="h2" size="sm" weight="semibold">
          {title}
        </Text>
        {description ? (
          <Text as="p" size="sm" tone="muted">
            {description}
          </Text>
        ) : null}
      </div>
      <div data-slot="settings-content" className="flex min-w-0 flex-col gap-4">
        {children}
      </div>
    </section>
  );
}

export type SettingsGroupProps = React.ComponentProps<"div">;

/**
 * Los grupos de una pantalla de ajustes, con su filete entre uno y otro. El
 * filete separa dos grupos y por eso lo pone el contenedor: puesto por cada
 * grupo, el último deja una raya colgando debajo del final.
 */
function SettingsGroup({ className, ...props }: SettingsGroupProps) {
  return (
    <div
      data-slot="settings-group"
      className={cn(
        "flex flex-col gap-6",
        "[&>[data-slot=settings-section]:not(:first-child)]:border-t",
        "[&>[data-slot=settings-section]:not(:first-child)]:border-border",
        "[&>[data-slot=settings-section]:not(:first-child)]:pt-6",
        className,
      )}
      {...props}
    />
  );
}

export { SettingsSection, SettingsGroup };
