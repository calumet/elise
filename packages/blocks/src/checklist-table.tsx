/**
 * Lo elegido con {@link ChecklistPicker} como tabla, para cuando no cabe en
 * fichas: una fila por opción con su grupo y su quitar, paginada.
 *
 * @module
 */

import { Button } from "@calumet/elise-ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@calumet/elise-ui/card";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@calumet/elise-ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@calumet/elise-ui/table";
import { Text } from "@calumet/elise-ui/text";
import * as React from "react";

import type { ChecklistPickerFilter, ChecklistPickerOption } from "./checklist-picker";
import { useElLabel } from "./lib/i18n";

/** Props de {@link ChecklistTable}. */
export type ChecklistTableProps = {
  /** Las mismas que recibe el `ChecklistPicker`; las `locked` salen siempre, sin quitar. */
  options: ChecklistPickerOption[];

  /** Las mismas que recibe el `ChecklistPicker`; dan el nombre del grupo de cada fila. */
  filters: ChecklistPickerFilter[];

  /** Lo aplicado. */
  selected: ReadonlySet<string>;

  onRemove: (id: string) => void;

  /** Abre el diálogo, normalmente un `ChecklistDialog`. */
  onEdit: () => void;

  title: string;
  description?: string;
  editLabel: string;

  /** Los rótulos de las columnas de la opción y del grupo. */
  columns: { option: string; filter: string };

  /** Lo que se dice cuando no hay nada aplicado. El botón es el de editar. */
  empty: { title: string; description?: string };

  removeLabel?: string;

  /** Filas por página. Por defecto, 10. */
  pageSize?: number;

  /** El locale con el que se ordena. Por defecto, el del navegador. */
  locale?: string;
};

/**
 * Lo elegido con {@link ChecklistPicker} como tabla, dentro de su tarjeta.
 *
 * Las filas salen ordenadas por grupo, en el orden de `filters`, y dentro de
 * cada uno por nombre. Sin nada aplicado, la tabla deja sitio a un vacío con
 * el botón de editar. Los textos por defecto salen del namespace `ui` de
 * `elise-i18n`.
 */
export function ChecklistTable({
  options,
  filters,
  selected,
  onRemove,
  onEdit,
  title,
  description,
  editLabel,
  columns,
  empty,
  removeLabel,
  pageSize = 10,
  locale,
}: ChecklistTableProps): React.JSX.Element {
  const defaultRemove = useElLabel("ui", "checklistTableRemove", "Retirar");
  const rangeTemplate = useElLabel("ui", "checklistTableRange", "{from}-{to} de {total}");
  const titleId = `${React.useId()}-title`;
  const [page, setPage] = React.useState(0);

  const rows = React.useMemo(() => {
    const collator = new Intl.Collator(locale);
    const order = new Map(filters.map((f, index) => [f.value, index]));
    return options
      .filter((option) => option.locked || selected.has(option.id))
      .sort(
        (a, b) =>
          (order.get(a.filter) ?? filters.length) - (order.get(b.filter) ?? filters.length) ||
          collator.compare(a.label, b.label),
      );
  }, [options, filters, selected, locale]);

  const groupLabels = new Map(filters.map((f) => [f.value, f.label]));
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const from = current * pageSize;
  const visible = rows.slice(from, from + pageSize);
  const isEmpty = rows.length === 0;
  const remove = removeLabel ?? defaultRemove;

  return (
    <Card as="section" data-slot="checklist-table" aria-labelledby={titleId} className="py-0">
      <CardHeader className="pt-6">
        <CardTitle as="h2" id={titleId}>
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {!isEmpty && (
          <CardAction className="row-span-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              {editLabel}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <Table
        bare
        empty={isEmpty}
        paginate={rows.length > pageSize}
        hasPreviousPage={current > 0}
        hasNextPage={current < pageCount - 1}
        onPreviousPage={() => setPage(current - 1)}
        onNextPage={() => setPage(current + 1)}
        paginationLabel={rangeTemplate
          .replace("{from}", String(from + 1))
          .replace("{to}", String(from + visible.length))
          .replace("{total}", String(rows.length))}
      >
        <TableHeader>
          <TableRow>
            <TableHead listSlot="primary">{columns.option}</TableHead>
            <TableHead listSlot="secondary">{columns.filter}</TableHead>
            <TableHead listSlot="action">
              <span className="sr-only">{remove}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((option) => (
            <TableRow key={option.id}>
              <TableCell>
                {option.label}
                {option.locked && option.lockedHint && (
                  <Text size="sm" tone="muted">
                    {option.lockedHint}
                  </Text>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {groupLabels.get(option.filter)}
              </TableCell>
              <TableCell className="text-end">
                {!option.locked && (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`${remove}: ${option.label}`}
                    onClick={() => onRemove(option.id)}
                  >
                    {remove}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableEmpty>
          <EmptyState size="sm">
            <EmptyStateTitle>{empty.title}</EmptyStateTitle>
            {empty.description && (
              <EmptyStateDescription>{empty.description}</EmptyStateDescription>
            )}
            <EmptyStateActions>
              <Button variant="outline" size="sm" onClick={onEdit}>
                {editLabel}
              </Button>
            </EmptyStateActions>
          </EmptyState>
        </TableEmpty>
      </Table>
    </Card>
  );
}
