/**
 * Mostrar y editar lo elegido con `ChecklistPicker`, fuera del diálogo:
 * los elegidos como fichas que se quitan y un botón que abre el diálogo.
 *
 * @module
 */

import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import { Chip } from "@calumet/elise-ui/chip";
import { InlineStack } from "@calumet/elise-ui/stack";
import type * as React from "react";

/** Un elegido de {@link ChecklistField}. */
export type ChecklistFieldItem = {
  id: string;
  label: string;

  /** Lo afirma el sistema y no se quita: va como `Badge`, sin botón de quitar. */
  locked?: boolean;
};

/** Props de {@link ChecklistField}. */
export type ChecklistFieldProps = {
  items: ChecklistFieldItem[];

  /** Quita uno. No se llama para los `locked`. */
  onRemove: (id: string) => void;

  /** Lo que se muestra cuando `items` está vacío. */
  empty: React.ReactNode;

  /** Abre el diálogo de quien lo usa, con el `ChecklistPicker` dentro. */
  onEdit: () => void;

  editLabel: string;
};

/**
 * Mostrar y editar lo elegido con `ChecklistPicker`.
 *
 * Los elegidos van como `Chip` con su quitar y los `locked` como `Badge`. El
 * diálogo es de quien lo usa, igual que en `ChecklistPicker`.
 */
export function ChecklistField({
  items,
  onRemove,
  empty,
  onEdit,
  editLabel,
}: ChecklistFieldProps): React.JSX.Element {
  return (
    <InlineStack data-slot="checklist-field" gap={2}>
      {items.length === 0
        ? empty
        : items.map((item) =>
            item.locked ? (
              <Badge key={item.id}>{item.label}</Badge>
            ) : (
              <Chip key={item.id} onRemove={() => onRemove(item.id)}>
                {item.label}
              </Chip>
            ),
          )}
      <Button variant="outline" size="sm" className="flex-none whitespace-nowrap" onClick={onEdit}>
        {editLabel}
      </Button>
    </InlineStack>
  );
}
