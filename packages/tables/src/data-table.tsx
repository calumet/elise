import {
  ChevronDown,
  ChevronUp,
  FileText,
  RefreshCw,
  Search,
  X,
  Check,
  Download,
} from "@calumet/elise-icons";
import { Popover, PopoverContent, PopoverTrigger } from "@calumet/elise-ui";
import { Button } from "@calumet/elise-ui/button";
import { Calendar } from "@calumet/elise-ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@calumet/elise-ui/command";
import { toISOText } from "@calumet/elise-ui/date-field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@calumet/elise-ui/dropdown-menu";
import { EmptyState, EmptyStateTitle } from "@calumet/elise-ui/empty-state";
import { Input } from "@calumet/elise-ui/input";
import { Label } from "@calumet/elise-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@calumet/elise-ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@calumet/elise-ui/table";
import {
  type Column,
  type ColumnDef as ColumnDefBase,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  type RowData,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import React, { Fragment, useCallback, useId, useMemo } from "react";

import { features, type Features, type ColumnMeta } from "./features";
import { dateRangeFilterFn, multiSelectFilterFn, exportToCSV, exportToJSON } from "./filters";
import { useElLabel } from "./i18n";

export type { ColumnMeta };

/* El `meta` ya no viaja en una intersección propia: sale de la ranura
   `columnMeta` de `features.ts`, que tipa el `meta` de esta tabla sin ampliar un
   módulo ajeno, que es lo que JSR rechaza. */
/**
 * El `ColumnDef` de TanStack con el `meta` que lee {@link DataTable} ya tipado.
 * Importalo desde acá y no desde `@tanstack/react-table`, o hay que repetir el
 * juego de características en cada columna.
 */
export type ColumnDef<TData extends RowData, TValue = unknown> = ColumnDefBase<
  Features,
  TData,
  TValue
>;

/* El `meta` es opcional, y las tres lecturas quieren un objeto. */
const metaOf = (columnDef: { meta?: ColumnMeta }): ColumnMeta => columnDef.meta ?? {};

/** Props de {@link DataTable}. */
interface DataTableProps<TData extends RowData> {
  /** Nombre del archivo que se baja al exportar. */
  name?: string;
  /** Las columnas. Su `meta.filterVariant` decide qué filtros aparecen. */
  columns: ColumnDef<TData>[];
  data: TData[];
  /** Tapa el cuerpo con el indicador de carga. */
  isLoading?: boolean;
  /** Muestra los botones de exportar a CSV y a JSON. */
  exportTo?: boolean;
  /** Si viene, se dibuja el botón de recargar y se llama al pulsarlo. */
  refresh?: () => void | Promise<unknown>;
  /** Opciones del selector de filas por página. */
  pageSizeOptions?: number[];
  /** Filas por página al montar. Se suma a `pageSizeOptions` si no estaba. */
  initialPageSize?: number;
}

function DataTableContent<TData extends RowData>({
  name,
  columns,
  data,
  isLoading,
  exportTo,
  refresh,
  pageSizeOptions = [5, 10, 25, 50],
  initialPageSize,
}: DataTableProps<TData>) {
  const id = useId();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const labelNoData = useElLabel("tables", "noData", "There is no data to display.");
  const labelLoading = useElLabel("tables", "loading", "Loading data.");
  const labelRowsPerPage = useElLabel("tables", "rowsPerPage", "Rows per page:");
  const labelPageSizePlaceholder = useElLabel(
    "tables",
    "rowsPerPagePlaceholder",
    "Select number of results",
  );
  const labelOf = useElLabel("tables", "of", "of");
  const labelClearFilters = useElLabel("tables", "clearFilters", "Clear filters");
  const labelExport = useElLabel("tables", "export", "Export");
  const labelRefresh = useElLabel("tables", "refresh", "Refresh");

  const enhancedColumns: ColumnDef<TData>[] = useMemo(() => {
    return columns.map((column) => {
      if (column.meta?.filterVariant === "select") {
        return {
          ...column,
          filterFn: multiSelectFilterFn as FilterFn<Features, TData>,
        };
      }
      if (column.meta?.filterVariant === "daterange") {
        return {
          ...column,
          filterFn: dateRangeFilterFn as FilterFn<Features, TData>,
        };
      }
      return column;
    });
  }, [columns]);

  /* Sin selector, `useTable` se suscribe a todas las rebanadas de estado, que es
     lo que hacía la v8 y lo que espera el resto del componente. */
  const table = useTable({
    features: features,
    data,
    columns: enhancedColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    initialState: initialPageSize
      ? { pagination: { pageIndex: 0, pageSize: initialPageSize } }
      : undefined,
    state: {
      sorting,
      columnFilters,
    },
  });

  const pageOptions = React.useMemo(() => {
    const base = initialPageSize ? [...pageSizeOptions, initialPageSize] : pageSizeOptions;
    return Array.from(new Set(base)).sort((a, b) => a - b);
  }, [pageSizeOptions, initialPageSize]);

  const { pageIndex, pageSize } = table.state.pagination;
  const total = table.getRowCount();
  const firstRow = total === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min(pageIndex * pageSize + pageSize, total);

  const getExportData = useCallback(() => {
    return table.getFilteredRowModel().rows.map((row) => {
      const rowData: Record<string, string> = {};

      table.getAllColumns().forEach((column) => {
        if (column.id === "actions" || !column.columnDef.header) return;

        const headerText =
          typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;

        rowData[headerText] = String(row.getValue(column.id) ?? "");
      });

      return rowData;
    });
  }, [table]);

  /* La barra de filtros, la franja de paginar y el aviso de carga los pone
     `Table` por su cuenta, con `filters`, `paginate` y `loading`. Antes esto
     armaba su propia tarjeta con la misma `SUPERFICIE`, y eran dos sitios donde
     arreglar lo mismo. */
  /* Una sola franja, como la de un listado de Shopify: el primer filtro de texto
     es el buscador y el resto son chips que abren su control. */
  const filtered = table.getAllColumns().filter((column) => metaOf(column.columnDef).filterVariant);
  const search = filtered.find((column) => metaOf(column.columnDef).filterVariant === "text");

  const filterBar = (
    <section className="flex min-h-8 flex-wrap items-center gap-2">
      {search ? <SearchFilter column={search} /> : null}
      {filtered
        .filter((column) => column !== search)
        .map((column) => (
          <FilterChip key={column.id} column={column} />
        ))}
      {columnFilters.length > 0 && (
        <Button size="xs" variant="ghost" onClick={() => setColumnFilters([])}>
          {labelClearFilters}
        </Button>
      )}
      <div className="ms-auto flex items-center gap-1">
        {exportTo && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={labelExport}>
                <Download className="size-icon-md" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  const exportName = name || "datos";
                  exportToCSV(getExportData(), exportName);
                }}
              >
                <FileText className="size-icon-md" />
                CSV (.csv)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const exportName = name || "datos";
                  exportToJSON(getExportData(), exportName);
                }}
              >
                <FileText className="size-icon-md" />
                JSON (.json)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {refresh && (
          <Button onClick={refresh} variant="ghost" size="icon-sm" aria-label={labelRefresh}>
            <RefreshCw className="size-icon-md" />
          </Button>
        )}
      </div>
    </section>
  );

  return (
    <div className="flex h-full w-full min-w-0 flex-col justify-between">
      <div data-slot="data-table-card" className="min-w-0">
        <Table
          empty={table.getRowModel().rows.length === 0}
          filters={filterBar}
          loading={isLoading}
          loadingLabel={labelLoading}
          paginate
          hasPreviousPage={table.getCanPreviousPage()}
          hasNextPage={table.getCanNextPage()}
          onPreviousPage={() => table.previousPage()}
          onNextPage={() => table.nextPage()}
          onFirstPage={() => table.firstPage()}
          onLastPage={() => table.lastPage()}
          paginationLabel={`${firstRow}-${lastRow} ${labelOf} ${total}`}
          paginationEnd={
            <div className="flex items-center gap-2">
              <Label htmlFor={id} className="text-xs whitespace-nowrap max-sm:sr-only">
                {labelRowsPerPage}
              </Label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger id={id} className="h-7 w-fit px-2 text-xs">
                  <SelectValue placeholder={labelPageSizePlaceholder} />
                </SelectTrigger>
                <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                  {pageOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
          frameClassName="min-w-0"
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                      }
                      className={
                        header.column.id === "actions"
                          ? "w-0 text-center"
                          : (metaOf(header.column.columnDef).className ?? "")
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          {...(header.column.getCanSort()
                            ? {
                                role: "button" as const,
                                tabIndex: 0,
                                className:
                                  "flex h-full cursor-pointer items-center justify-between gap-2 select-none",
                                onClick: header.column.getToggleSortingHandler(),
                                onKeyDown: (e: React.KeyboardEvent) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    header.column.getToggleSortingHandler()?.(e);
                                  }
                                },
                              }
                            : {})}
                        >
                          <span className="truncate">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {{
                            asc: (
                              <ChevronUp
                                className="size-icon-md shrink-0 opacity-60"
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDown
                                className="size-icon-md shrink-0 opacity-60"
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          {/* Solo «no hay datos»: mientras carga, el aviso lo baja `Table`
              sobre las filas que ya estuvieran. */}
          <TableEmpty>
            <EmptyState size="sm">
              <EmptyStateTitle>{labelNoData}</EmptyStateTitle>
            </EmptyState>
          </TableEmpty>
        </Table>
      </div>
    </div>
  );
}

type FilterProps<TData extends RowData> = {
  column: Column<Features, TData, unknown>;
  columnHeader: string;
};

const headerOf = <TData extends RowData>(column: Column<Features, TData, unknown>): string =>
  typeof column.columnDef.header === "string" ? column.columnDef.header : "";

/* `dateRangeFilterFn` lee una tupla `[desde, hasta]`. Con el objeto de
   `Calendar` no tiene `length` y la función dejaba pasar todas las filas. */
type DateRangeTuple = [Date | undefined, Date | undefined];

const isDateRangeTuple = (value: unknown): value is DateRangeTuple =>
  Array.isArray(value) && value.length === 2;

/** Lo que el chip dice que está puesto, o nada si el filtro está vacío. */
const summarize = (variant: ColumnMeta["filterVariant"], value: unknown): string | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  if (variant === "select" && Array.isArray(value)) return value.join(", ") || undefined;
  if (variant === "range" && Array.isArray(value)) {
    const [min, max] = value as [number | undefined, number | undefined];
    return min === undefined && max === undefined ? undefined : `${min ?? ""}–${max ?? ""}`;
  }
  if (variant === "date" && value instanceof Date) return toISOText(value);
  if (variant === "daterange" && isDateRangeTuple(value)) {
    const [from, to] = value;
    if (!from) return undefined;
    return to ? `${toISOText(from)}--${toISOText(to)}` : toISOText(from);
  }
  return String(value);
};

/**
 * El buscador de la franja, sin caja: el primer filtro de texto. El nombre de
 * la columna va en `aria-label`, ya que no hay rótulo a la vista.
 */
function SearchFilter<TData extends RowData>({
  column,
}: {
  column: Column<Features, TData, unknown>;
}): React.JSX.Element {
  const columnHeader = headerOf(column);
  const labelSearch = useElLabel(
    "tables",
    "searchByColumn",
    `Search ${columnHeader.toLowerCase()}`,
    { column: columnHeader.toLowerCase() },
  );

  return (
    <div className="relative min-w-40 flex-1 sm:max-w-80">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute start-2 top-1/2 size-icon-md -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="text"
        aria-label={labelSearch}
        placeholder={labelSearch}
        value={(column.getFilterValue() ?? "") as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        className="h-8 w-full rounded-md bg-transparent ps-8 pe-2 text-sm text-foreground transition-[background-color] duration-(--duration-fast) ease-out placeholder:text-muted-foreground hover:bg-state-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      />
    </div>
  );
}

/**
 * Un filtro que no es el buscador. Vacío va con borde discontinuo y solo el
 * nombre de la columna; puesto, con borde lleno y lo que filtra.
 */
function FilterChip<TData extends RowData>({
  column,
}: {
  column: Column<Features, TData, unknown>;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const columnHeader = headerOf(column);
  const { filterVariant } = metaOf(column.columnDef);
  const value = column.getFilterValue();
  const summary = summarize(filterVariant, value);
  const shared = { column, columnHeader };
  const labelSearch = useElLabel(
    "tables",
    "searchByColumn",
    `Search ${columnHeader.toLowerCase()}`,
    { column: columnHeader.toLowerCase() },
  );
  const range = isDateRangeTuple(value) ? value : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="xs"
          variant="outline"
          className={`max-w-64 gap-1 ${summary ? "" : "border-dashed font-normal text-muted-foreground"}`}
        >
          <span className="truncate">{summary ? `${columnHeader}: ${summary}` : columnHeader}</span>
          <ChevronDown aria-hidden="true" className="size-icon-sm shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={
          filterVariant === "range" || filterVariant === "text" ? "w-64 p-3" : "w-auto min-w-56 p-0"
        }
      >
        {filterVariant === "select" ? (
          <SelectOptions {...shared} onClear={() => setOpen(false)} />
        ) : null}
        {filterVariant === "range" ? <RangeInputs {...shared} /> : null}
        {filterVariant === "text" ? (
          <Input
            autoFocus
            aria-label={labelSearch}
            placeholder={labelSearch}
            value={(value ?? "") as string}
            onChange={(e) => column.setFilterValue(e.target.value)}
          />
        ) : null}
        {filterVariant === "date" ? (
          <Calendar
            mode="single"
            selected={value instanceof Date ? value : undefined}
            onSelect={(date) => {
              column.setFilterValue(date ?? undefined);
              setOpen(false);
            }}
          />
        ) : null}
        {filterVariant === "daterange" ? (
          <Calendar
            mode="range"
            selected={range ? { from: range[0], to: range[1] } : undefined}
            onSelect={(next) =>
              column.setFilterValue(
                next?.from ? ([next.from, next.to] as DateRangeTuple) : undefined,
              )
            }
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function RangeInputs<TData extends RowData>({
  column,
  columnHeader,
}: FilterProps<TData>): React.JSX.Element {
  const id = useId();
  const columnFilterValue = column.getFilterValue();
  const labelMin = useElLabel("tables", "min", "Min");
  const labelMax = useElLabel("tables", "max", "Max");

  return (
    <div>
      <div className="flex">
        <Input
          id={`${id}-range-1`}
          className="flex-1 rounded-e-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(e) =>
            column.setFilterValue((old: [number, number]) => [
              e.target.value ? Number(e.target.value) : undefined,
              old?.[1],
            ])
          }
          placeholder={labelMin}
          type="number"
          aria-label={`${columnHeader} ${labelMin}`}
        />
        <Input
          id={`${id}-range-2`}
          className="-ms-px flex-1 rounded-s-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(e) =>
            column.setFilterValue((old: [number, number]) => [
              old?.[0],
              e.target.value ? Number(e.target.value) : undefined,
            ])
          }
          placeholder={labelMax}
          type="number"
          aria-label={`${columnHeader} ${labelMax}`}
        />
      </div>
    </div>
  );
}

function SelectOptions<TData extends RowData>({
  column,
  columnHeader,
  onClear,
}: FilterProps<TData> & { onClear: () => void }): React.JSX.Element {
  const columnFilterValue = column.getFilterValue();

  const labelNoOptions = useElLabel("tables", "noOptions", "No options found.");
  const labelClear = useElLabel("tables", "clear", "Clear");
  const labelSearchInColumn = useElLabel(
    "tables",
    "searchInColumn",
    `Search ${columnHeader.toLowerCase()}...`,
    { column: columnHeader.toLowerCase() },
  );

  const facetedUniqueValues = column.getFacetedUniqueValues();

  const sortedUniqueValues = useMemo(() => {
    const flattenedValues: string[] = [];

    for (const value of facetedUniqueValues.keys()) {
      if (Array.isArray(value)) {
        for (const nestedValue of value) {
          flattenedValues.push(String(nestedValue));
        }
        continue;
      }

      if (value !== null && value !== undefined) {
        flattenedValues.push(String(value));
      }
    }

    return Array.from(new Set(flattenedValues)).sort((a, b) => a.localeCompare(b));
  }, [facetedUniqueValues]);

  const selectedValues = Array.isArray(columnFilterValue)
    ? columnFilterValue.map((value) => String(value))
    : columnFilterValue
      ? [String(columnFilterValue)]
      : [];
  const selected = new Set(selectedValues);

  const toggleSelection = (value: string) => {
    const newValue = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    column.setFilterValue(newValue.length === 0 ? undefined : newValue);
  };

  const clearAllSelections = () => {
    column.setFilterValue(undefined);
    onClear();
  };

  return (
    <Command>
      <CommandInput placeholder={labelSearchInColumn} />
      <CommandList>
        <CommandEmpty>{labelNoOptions}</CommandEmpty>
        <CommandGroup>
          {sortedUniqueValues.map((value) => (
            <CommandItem
              key={String(value)}
              value={String(value)}
              onSelect={() => toggleSelection(String(value))}
            >
              <span className="truncate">{String(value)}</span>
              {selected.has(String(value)) && <Check className="ml-auto size-icon-md" />}
            </CommandItem>
          ))}
        </CommandGroup>
        {selectedValues.length > 0 && (
          <Fragment>
            <CommandSeparator />
            <CommandGroup>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 font-normal"
                onClick={clearAllSelections}
              >
                <X className="-ms-1 size-icon-md opacity-60" aria-hidden="true" />
                {labelClear}
              </Button>
            </CommandGroup>
          </Fragment>
        )}
      </CommandList>
    </Command>
  );
}

/**
 * Tabla con barra de filtros, orden por columna, paginado y exportación.
 *
 * Los filtros salen del `meta.filterVariant` de cada columna: una columna sin
 * él no aparece en la barra. Las opciones de un filtro `select` se arman con
 * los valores presentes en los datos.
 *
 * ```tsx
 * const columns: ColumnDef<Proyecto>[] = [
 *   { accessorKey: "name", header: "Proyecto", meta: { filterVariant: "text" } },
 * ];
 *
 * <DataTable name="proyectos" columns={columns} data={filas} exportTo />;
 * ```
 */
export function DataTable<TData extends RowData>({
  name,
  columns,
  data,
  isLoading,
  exportTo,
  refresh,
  pageSizeOptions,
  initialPageSize,
}: DataTableProps<TData>): React.JSX.Element {
  return (
    <DataTableContent
      name={name}
      columns={columns}
      data={data}
      isLoading={isLoading}
      exportTo={exportTo}
      refresh={refresh}
      pageSizeOptions={pageSizeOptions}
      initialPageSize={initialPageSize}
    />
  );
}

export type { DataTableProps };
