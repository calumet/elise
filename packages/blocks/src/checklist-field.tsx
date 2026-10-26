/**
 * Mostrar y editar lo elegido con `ChecklistPicker`, fuera del diálogo: la
 * sección entera, con el botón de editar en la cabecera y los elegidos como
 * fichas que se quitan.
 *
 * @module
 */

import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import { Chip } from "@calumet/elise-ui/chip";
import { Section } from "@calumet/elise-ui/section";
import { BlockStack, InlineStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";
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

  /** El rótulo de la sección. */
  title: string;

  editLabel: string;

  /** Una nota en gris bajo las fichas, por ejemplo por qué las `locked` no se quitan. */
  note?: string;
};

/**
 * Mostrar y editar lo elegido con `ChecklistPicker`, dentro de su `Section`.
 *
 * El botón de editar va en la cabecera. Los elegidos van como `Chip` con su
 * quitar y los `locked` como `Badge`; `note` sale debajo. El diálogo es de
 * quien lo usa, igual que en `ChecklistPicker`.
 */
export function ChecklistField({
  items,
  onRemove,
  empty,
  onEdit,
  title,
  editLabel,
  note,
}: ChecklistFieldProps): React.JSX.Element {
  return (
    <Section
      data-slot="checklist-field"
      heading={title}
      actions={
        <Button variant="outline" size="sm" onClick={onEdit}>
          {editLabel}
        </Button>
      }
    >
      <BlockStack gap={3}>
        <InlineStack gap={2}>
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
        </InlineStack>
        {note && (
          <Text tone="muted" size="sm">
            {note}
          </Text>
        )}
      </BlockStack>
    </Section>
  );
}
