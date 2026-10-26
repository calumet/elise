/**
 * Elegir con casillas entre muchas opciones, filtradas por pestañas o agrupadas,
 * y por nombre. Va dentro de un `Dialog` o un `Sheet`, entre la cabecera y el pie: el buscador
 * y las pestañas quedan fijos y solo el cuerpo desplaza.
 *
 * @module
 */

import { Box } from "@calumet/elise-ui/box";
import { Checkbox } from "@calumet/elise-ui/checkbox";
import { DIALOG_BODY } from "@calumet/elise-ui/dialog";
import { SearchField } from "@calumet/elise-ui/search-field";
import { BlockStack } from "@calumet/elise-ui/stack";
import { Tabs, TabsList, TabsTrigger } from "@calumet/elise-ui/tabs";
import { Text } from "@calumet/elise-ui/text";
import * as React from "react";

import { cn } from "./lib/cn";
import { useElLabel } from "./lib/i18n";

const ALL = "__all";

/** Una opción de {@link ChecklistPicker}. */
export type ChecklistPickerOption = {
  id: string;
  label: string;

  /** Va bajo el nombre y también se busca. */
  description?: string;

  /** El `value` del {@link ChecklistPickerFilter} bajo el que aparece. */
  filter: string;

  /** Los `id` de las opciones que la incluyen: marcada alguna, esta sale marcada y sin editar. */
  includedBy?: string[];
};

/** Una pestaña de {@link ChecklistPicker}, o un grupo con `layout="groups"`. */
export type ChecklistPickerFilter = {
  value: string;
  label: string;
};

/** Props de {@link ChecklistPicker}. */
export type ChecklistPickerProps = {
  options: ChecklistPickerOption[];

  /** Las pestañas, en orden, después de la que lo muestra todo. Sin filtros no hay pestañas. */
  filters: ChecklistPickerFilter[];

  /**
   * `tabs`, por defecto, filtra con pestañas. `groups` muestra todas las opciones
   * bajo un encabezado fijo por filtro, en el orden de `filters`, y la búsqueda
   * mira también el nombre del grupo. Para cuando los filtros no caben en una fila.
   */
  layout?: "tabs" | "groups";

  /** Los `id` de las opciones marcadas. */
  selected: ReadonlySet<string>;

  /** Se llama al marcar o desmarcar una casilla. Aplicar o cancelar es cosa del diálogo. */
  onToggle: (id: string, checked: boolean) => void;

  /** El locale con el que se ordena y se busca. Por defecto, el del navegador. */
  locale?: string;
};

/** De cada opción incluida por alguna marcada, el nombre de la primera marcada que la incluye. */
export const includedLabels = (
  options: ChecklistPickerOption[],
  marked: ReadonlySet<string>,
): Map<string, string> => {
  const result = new Map<string, string>();
  for (const holder of options) {
    if (!marked.has(holder.id)) continue;
    for (const target of options) {
      if (target.includedBy?.includes(holder.id) && !result.has(target.id)) {
        result.set(target.id, holder.label);
      }
    }
  }
  return result;
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
export function ChecklistPicker({
  options,
  filters,
  layout = "tabs",
  selected,
  onToggle,
  locale,
}: ChecklistPickerProps): React.JSX.Element {
  const groupId = React.useId();
  const searchLabel = useElLabel("ui", "checklistPickerSearch", "Buscar");
  const allLabel = useElLabel("ui", "checklistPickerAll", "Todas");
  const filtersLabel = useElLabel("ui", "checklistPickerFilters", "Filtrar");
  const emptyLabel = useElLabel("ui", "checklistPickerEmpty", "No hay opciones para elegir.");
  const noResultsTemplate = useElLabel(
    "ui",
    "checklistPickerNoResults",
    "Nada coincide con «{query}».",
  );

  const includedTemplate = useElLabel("ui", "checklistIncludedIn", "Incluido en «{label}»");
  const included = React.useMemo(() => includedLabels(options, selected), [options, selected]);

  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState(ALL);

  const grouped = layout === "groups";
  const term = fold(query.trim(), locale);
  const visible = React.useMemo(() => {
    const collator = new Intl.Collator(locale);
    const groupLabels = new Map(grouped ? filters.map((f) => [f.value, f.label]) : []);
    return options
      .filter((option) => grouped || filter === ALL || option.filter === filter)
      .filter(
        (option) =>
          !term ||
          matches(
            `${option.label}\n${option.description ?? ""}\n${groupLabels.get(option.filter) ?? ""}`,
            term,
            locale,
          ),
      )
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [options, filters, grouped, filter, term, locale]);

  const bodyRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const body = bodyRef.current;
    const content = contentRef.current;
    if (!body || !content || filter !== ALL || term) return;
    content.style.minHeight = "";
    const { paddingTop, paddingBottom } = getComputedStyle(body);
    const inner = body.clientHeight - parseFloat(paddingTop) - parseFloat(paddingBottom);
    content.style.minHeight = `${inner}px`;
  }, [options, layout, filter, term]);

  const renderOptions = (list: ChecklistPickerOption[]) => (
    <BlockStack gap={3}>
      {list.map((option) => {
        const holder = included.get(option.id);
        return (
          <Checkbox
            key={option.id}
            label={option.label}
            description={
              holder ? (
                <>
                  {option.description}
                  <span className="block">{includedTemplate.replace("{label}", holder)}</span>
                </>
              ) : (
                option.description
              )
            }
            checked={holder !== undefined || selected.has(option.id)}
            disabled={holder !== undefined}
            onCheckedChange={(checked) => onToggle(option.id, checked === true)}
          />
        );
      })}
    </BlockStack>
  );

  return (
    <>
      <Box
        data-slot="checklist-picker-header"
        padding={4}
        border
        borderSide="bottom"
        className="shrink-0"
      >
        <BlockStack gap={4}>
          <SearchField
            label={searchLabel}
            labelHidden
            placeholder={searchLabel}
            value={query}
            onValueChange={setQuery}
          />
          {!grouped && filters.length > 0 && (
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
          )}
        </BlockStack>
      </Box>
      <div
        ref={bodyRef}
        data-slot="checklist-picker-body"
        className={cn(DIALOG_BODY, grouped && "pt-0")}
      >
        <div ref={contentRef}>
          {visible.length === 0 ? (
            <Text tone="muted" className={cn(grouped && "pt-4")}>
              {term ? noResultsTemplate.replace("{query}", query.trim()) : emptyLabel}
            </Text>
          ) : grouped ? (
            <BlockStack gap={2}>
              {filters.map(({ value, label }, index) => {
                const list = visible.filter((option) => option.filter === value);
                if (list.length === 0) return null;
                const headingId = `${groupId}-${index}`;
                return (
                  <div key={value} role="group" aria-labelledby={headingId}>
                    <Text
                      id={headingId}
                      size="sm"
                      weight="medium"
                      tone="muted"
                      className="sticky top-0 z-sticky bg-card py-3"
                    >
                      {label}
                    </Text>
                    {renderOptions(list)}
                  </div>
                );
              })}
            </BlockStack>
          ) : (
            renderOptions(visible)
          )}
        </div>
      </div>
    </>
  );
}
