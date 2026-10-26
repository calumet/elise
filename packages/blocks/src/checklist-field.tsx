/**
 * Mostrar y editar lo elegido con `ChecklistPicker`, fuera del diálogo: los
 * elegidos como fichas que se quitan y el botón de editar, en línea o en la
 * cabecera de su sección.
 *
 * @module
 */

import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@calumet/elise-ui/card";
import { Chip } from "@calumet/elise-ui/chip";
import { BlockStack, InlineStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";
import * as React from "react";

/** Un elegido de {@link ChecklistField}. */
export type ChecklistFieldItem = {
  id: string;
  label: string;

  /** Lo afirma el sistema y no se quita: va como `Badge` informativo, sin botón de quitar. */
  locked?: boolean;

  /** El título emergente de un `locked`: por qué no se quita. */
  lockedHint?: string;
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

  /**
   * El rótulo de la sección. Con él, el bloque es la sección entera y el botón
   * de editar va en su cabecera; sin él, es el campo en línea, con el botón al
   * final de la fila de fichas, para usarlo dentro de otra sección o formulario.
   */
  title?: string;

  /** Bajo el título, en la cabecera. Solo con `title`. */
  description?: string;

  /** Una nota en gris bajo las fichas, por ejemplo por qué las `locked` no se quitan. */
  note?: string;
};

/**
 * Mostrar y editar lo elegido con `ChecklistPicker`.
 *
 * Los elegidos van como `Chip` con su quitar y los `locked` como `Badge` informativo, con `lockedHint` de título emergente;
 * `note` sale debajo. Con `title` es una tarjeta con el botón de editar en la
 * cabecera; sin él, un campo en línea. El diálogo es de quien lo usa, igual que
 * en `ChecklistPicker`.
 */
export function ChecklistField({
  items,
  onRemove,
  empty,
  onEdit,
  title,
  description,
  editLabel,
  note,
}: ChecklistFieldProps): React.JSX.Element {
  const titleId = `${React.useId()}-title`;
  const button = (
    <Button variant="outline" size="sm" className="flex-none whitespace-nowrap" onClick={onEdit}>
      {editLabel}
    </Button>
  );
  const chips = items.map((item) =>
    item.locked ? (
      <Badge key={item.id} tone="info" title={item.lockedHint}>
        {item.label}
      </Badge>
    ) : (
      <Chip key={item.id} onRemove={() => onRemove(item.id)}>
        {item.label}
      </Chip>
    ),
  );
  const noteText = note && (
    <Text tone="muted" size="sm">
      {note}
    </Text>
  );

  if (!title) {
    return (
      <BlockStack data-slot="checklist-field" gap={3}>
        <InlineStack gap={2}>
          {items.length === 0 ? empty : chips}
          {button}
        </InlineStack>
        {noteText}
      </BlockStack>
    );
  }

  return (
    <Card as="section" data-slot="checklist-field" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle as="h2" id={titleId}>
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <CardAction className={description ? "row-span-2" : undefined}>{button}</CardAction>
      </CardHeader>
      <CardContent>
        <BlockStack gap={3}>
          <InlineStack gap={2}>{items.length === 0 ? empty : chips}</InlineStack>
          {noteText}
        </BlockStack>
      </CardContent>
    </Card>
  );
}
