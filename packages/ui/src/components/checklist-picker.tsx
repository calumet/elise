/**
 * Elegir con casillas entre muchas opciones, filtradas por pestañas y por nombre.
 * Va dentro de un `Dialog` o un `Sheet`, entre la cabecera y el pie: el buscador
 * y las pestañas quedan fijos y solo el cuerpo desplaza.
 *
 * @module
 */

import * as React from "react";

import { useElLabel } from "@/lib/i18n";

import { Checkbox } from "./checkbox";
import { DIALOG_BODY } from "./dialog";
import { SearchField } from "./search-field";
import { Tabs, TabsList, TabsTrigger } from "./tabs";
import { Text } from "./text";

const ALL = "__all";

/** Una opción de {@link ChecklistPicker}. */
export type ChecklistPickerOption = {
  id: string;
  label: string;

  /** Va bajo el nombre y también se busca. */
  description?: string;

  /** El `value` del {@link ChecklistPickerFilter} bajo el que aparece. */
  filter: string;
};

/** Una pestaña de {@link ChecklistPicker}. */
export type ChecklistPickerFilter = {
  value: string;
  label: string;
};

/** Props de {@link ChecklistPicker}. */
export type ChecklistPickerProps = {
  options: ChecklistPickerOption[];

  /** Las pestañas, en orden, después de la que lo muestra todo. */
  filters: ChecklistPickerFilter[];

  /** Los `id` de las opciones marcadas. */
  selected: ReadonlySet<string>;

  /** Se llama al marcar o desmarcar una casilla. Aplicar o cancelar es cosa del diálogo. */
  onToggle: (id: string, checked: boolean) => void;

  /** El locale con el que se ordena y se busca. Por defecto, el del navegador. */
  locale?: string;
};

const fold = (text: string, locale?: string): string =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase(locale);

const matches = (text: string, term: string, locale?: string): boolean =>
  fold(text, locale).includes(term);

/**
 * Elegir con casillas entre muchas opciones, filtradas por pestañas y por nombre.
 *
 * La búsqueda ignora mayúsculas y tildes y mira el nombre y la descripción; las
 * opciones salen ordenadas por nombre según el `locale`. La selección es de quien
 * lo usa. Los textos salen del namespace `ui` de `elise-i18n`.
 */
function ChecklistPicker({
  options,
  filters,
  selected,
  onToggle,
  locale,
}: ChecklistPickerProps): React.JSX.Element {
  const searchLabel = useElLabel("ui", "checklistPickerSearch", "Buscar");
  const allLabel = useElLabel("ui", "checklistPickerAll", "Todas");
  const filtersLabel = useElLabel("ui", "checklistPickerFilters", "Filtrar");
  const emptyLabel = useElLabel("ui", "checklistPickerEmpty", "No hay opciones para elegir.");
  const noResultsTemplate = useElLabel(
    "ui",
    "checklistPickerNoResults",
    "Nada coincide con «{query}».",
  );

  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState(ALL);

  const term = fold(query.trim(), locale);
  const visible = React.useMemo(() => {
    const collator = new Intl.Collator(locale);
    return options
      .filter((option) => filter === ALL || option.filter === filter)
      .filter(
        ({ label, description }) =>
          !term || matches(`${label}\n${description ?? ""}`, term, locale),
      )
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [options, filter, term, locale]);

  return (
    <>
      <div
        data-slot="checklist-picker-header"
        className="flex shrink-0 flex-col gap-3 border-b border-border p-4"
      >
        <SearchField
          label={searchLabel}
          labelHidden
          placeholder={searchLabel}
          value={query}
          onValueChange={setQuery}
        />
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList variant="capsule" aria-label={filtersLabel}>
            <TabsTrigger value={ALL}>{allLabel}</TabsTrigger>
            {filters.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div data-slot="checklist-picker-body" className={DIALOG_BODY}>
        {visible.length === 0 ? (
          <Text tone="muted">
            {term ? noResultsTemplate.replace("{query}", query.trim()) : emptyLabel}
          </Text>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((option) => (
              <Checkbox
                key={option.id}
                label={option.label}
                description={option.description}
                checked={selected.has(option.id)}
                onCheckedChange={(checked) => onToggle(option.id, checked === true)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export { ChecklistPicker };
