import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import * as React from "react";

import { cn } from "@/lib/cn";

/* Un Toggle suelto y una opción de ToggleGroup son el mismo control, así que
   comparten las clases. Antes divergían: el suelto llevaba border-border-strong
   y bisel al encenderse, y el del grupo un borde más claro y ningún bisel. */
export const clasesToggle =
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-md border border-border-strong bg-background px-3 py-2 text-base font-semibold text-foreground transition-[background-color,border-color,box-shadow] duration-(--duration-fast) ease-out hover:bg-muted data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-bevel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

/* Le dice a un `Toggle` que está dentro de un grupo. Sin esto tendría que
   adivinarlo, y un Toggle suelto dentro de un ToggleGroup no participaría ni
   del valor del grupo ni de su foco. */
export const DentroDeToggleGroup = React.createContext(false);

export type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root>;
export type ToggleGroupItemProps = React.ComponentProps<typeof ToggleGroupPrimitive.Item>;

/**
 * Grupo de botones de dos estados.
 *
 * `type="single"` deja una sola opción encendida y `type="multiple"` admite
 * varias. El grupo es dueño del valor, con `value` y `onValueChange` o con
 * `defaultValue`.
 *
 * El foco entra una vez al grupo y las flechas recorren las opciones, igual que
 * en `RadioGroup`.
 */
function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return (
    <DentroDeToggleGroup.Provider value={true}>
      <ToggleGroupPrimitive.Root
        data-slot="toggle-group"
        className={cn("flex gap-1", className)}
        {...props}
      />
    </DentroDeToggleGroup.Provider>
  );
}

function ToggleGroupItem({ className, ...props }: ToggleGroupItemProps) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(clasesToggle, className)}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
