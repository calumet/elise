import {
  ChevronDown,
  ChevronUp,
  FileText,
  RefreshCw,
  Search,
  X,
  Check,
  ChevronsUpDown,
  Download,
} from "@calumet/elise-icons";
import { Popover, PopoverContent, PopoverTrigger } from "@calumet/elise-ui";
import { Button } from "@calumet/elise-ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@calumet/elise-ui/command";
import { DatePicker, DateRangePicker } from "@calumet/elise-ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@calumet/elise-ui/dropdown-menu";
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

import { caracteristicas, type Caracteristicas, type MetaDeColumna } from "./features";
import { dateRangeFilterFn, multiSelectFilterFn, exportToCSV, exportToJSON } from "./filters";
import { useElLabel } from "./i18n";

export type { MetaDeColumna };

/* El `meta` ya no viaja en una intersección propia: sale de la ranura
   `columnMeta` de `features.ts`, que tipa el `meta` de esta tabla sin ampliar un
   módulo ajeno, que es lo que JSR rechaza. */
/**
 * El `ColumnDef` de TanStack con el `meta` que lee {@link DataTable} ya tipado.
 * Importalo desde acá y no desde `@tanstack/react-table`, o hay que repetir el
 * juego de características en cada columna.
 */
export type ColumnDef<TData extends RowData, TValue = unknown> = ColumnDefBase<
  Caracteristicas,
  TData,
  TValue
>;

/* El `meta` es opcional, y las tres lecturas quieren un objeto. */
const metaDe = (columnDef: { meta?: MetaDeColumna }): MetaDeColumna => columnDef.meta ?? {};

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

type DateRangePickerValue = { from: Date | undefined; to?: Date };

const isDateRangePickerValue = (value: unknown): value is DateRangePickerValue => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as { from?: unknown; to?: unknown };
  const isDateOrUndefined = (item: unknown) => item === undefined || item instanceof Date;

  return isDateOrUndefined(candidate.from) && isDateOrUndefined(candidate.to);
};

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

  const enhancedColumns: ColumnDef<TData>[] = useMemo(() => {
    return columns.map((column) => {
      if (column.meta?.filterVariant === "select") {
        return {
          ...column,
          filterFn: multiSelectFilterFn as FilterFn<Caracteristicas, TData>,
        };
      }
      if (column.meta?.filterVariant === "daterange") {
        return {
          ...column,
          filterFn: dateRangeFilterFn as FilterFn<Caracteristicas, TData>,
        };
      }
      return column;
    });
  }, [columns]);

  /* Sin selector, `useTable` se suscribe a todas las rebanadas de estado, que es
     lo que hacía la v8 y lo que espera el resto del componente. */
  const table = useTable({
    features: caracteristicas,
    data,
    columns: enhancedColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  React.useEffect(() => {
    if (initialPageSize) {
      table.setPageSize(initialPageSize);
    }
  }, [initialPageSize, table]);

  const pageOptions = React.useMemo(() => {
    const base = initialPageSize ? [...pageSizeOptions, initialPageSize] : pageSizeOptions;
    return Array.from(new Set(base)).sort((a, b) => a - b);
  }, [pageSizeOptions, initialPageSize]);

  const { pageIndex, pageSize } = table.state.pagination;
  const total = table.getRowCount();
  const primeraFila = total === 0 ? 0 : pageIndex * pageSize + 1;
  const ultimaFila = Math.min(pageIndex * pageSize + pageSize, total);

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
  const barraDeFiltros = (
    <section className="flex flex-wrap justify-between gap-3 sm:flex-nowrap">
      <div className="flex flex-wrap items-end gap-3">
        {table.getAllColumns().map((column) => {
          if (!metaDe(column.columnDef).filterVariant) return null;

          return (
            <div className="w-45" key={column.id}>
              <Filter column={column} />
            </div>
          );
        })}
        {columnFilters.length > 0 && (
          <Button
            onClick={() => {
              setColumnFilters([]);
            }}
            variant="outline"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      <div className="flex justify-end gap-2">
        {exportTo && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  const exportName = name || "datos";
                  exportToCSV(getExportData(), exportName);
                }}
              >
                <FileText className="size-4" />
                CSV (.csv)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const exportName = name || "datos";
                  exportToJSON(getExportData(), exportName);
                }}
              >
                <FileText className="size-4" />
                JSON (.json)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {refresh && (
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="size-4" />
          </Button>
        )}
      </div>
    </section>
  );

  return (
    <div className="flex h-full w-full min-w-0 flex-col justify-between">
      <div data-slot="data-table-card" className="min-w-0">
        <Table
          filters={barraDeFiltros}
          loading={isLoading}
          loadingLabel={labelLoading}
          paginate
          hasPreviousPage={table.getCanPreviousPage()}
          hasNextPage={table.getCanNextPage()}
          onPreviousPage={() => table.previousPage()}
          onNextPage={() => table.nextPage()}
          onFirstPage={() => table.firstPage()}
          onLastPage={() => table.lastPage()}
          paginationLabel={`${primeraFila}-${ultimaFila} ${labelOf} ${total}`}
          paginationEnd={
            <div className="flex items-center gap-2">
              <Label htmlFor={id} className="text-xs whitespace-nowrap max-sm:sr-only">
                {labelRowsPerPage}
              </Label>
              <Select
                value={pageSize.toString()}
                onValueChange={(valor) => table.setPageSize(Number(valor))}
              >
                <SelectTrigger id={id} className="h-7 w-fit px-2 text-xs">
                  <SelectValue placeholder={labelPageSizePlaceholder} />
                </SelectTrigger>
                <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                  {pageOptions.map((opcion) => (
                    <SelectItem key={opcion} value={opcion.toString()}>
                      {opcion}
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
                          : (metaDe(header.column.columnDef).className ?? "")
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
                                className="size-4 shrink-0 opacity-60"
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDown
                                className="size-4 shrink-0 opacity-60"
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                {/* Solo «no hay datos»: mientras carga, el aviso lo baja
                      `Table` sobre las filas que ya estuvieran. */}
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {labelNoData}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

type FilterProps<TData extends RowData> = {
  column: Column<Caracteristicas, TData, unknown>;
  columnHeader: string;
};

function RangeFilter<TData extends RowData>({
  column,
  columnHeader,
}: FilterProps<TData>): React.JSX.Element {
  const id = useId();
  const columnFilterValue = column.getFilterValue();
  const labelMin = useElLabel("tables", "min", "Min");
  const labelMax = useElLabel("tables", "max", "Max");

  return (
    <div className="*:not-first:mt-1">
      <Label>{columnHeader}</Label>
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

function DateRangeFilter<TData extends RowData>({
  column,
  columnHeader,
}: FilterProps<TData>): React.JSX.Element {
  const columnFilterValue = column.getFilterValue();

  const rangeValue = isDateRangePickerValue(columnFilterValue) ? columnFilterValue : undefined;

  return (
    <div className="*:not-first:mt-1">
      <Label>{columnHeader}</Label>
      <DateRangePicker value={rangeValue} onChange={(value) => column.setFilterValue(value)} />
    </div>
  );
}

function DateFilter<TData extends RowData>({
  column,
  columnHeader,
}: FilterProps<TData>): React.JSX.Element {
  const columnFilterValue = column.getFilterValue();

  const dateValue = columnFilterValue instanceof Date ? columnFilterValue : undefined;

  return (
    <div className="*:not-first:mt-1">
      <Label>{columnHeader}</Label>
      <DatePicker value={dateValue} onChange={(value) => column.setFilterValue(value)} />
    </div>
  );
}

function SelectFilter<TData extends RowData>({
  column,
  columnHeader,
}: FilterProps<TData>): React.JSX.Element {
  const columnFilterValue = column.getFilterValue();
  const [selectOpen, setSelectOpen] = React.useState(false);
  const idLista = React.useId();

  const labelSelectPlaceholder = useElLabel("tables", "selectPlaceholder", "Select...");
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
  const elegidas = new Set(selectedValues);

  const toggleSelection = (value: string) => {
    const newValue = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    column.setFilterValue(newValue.length === 0 ? undefined : newValue);
  };

  const clearAllSelections = () => {
    column.setFilterValue(undefined);
    setSelectOpen(false);
  };

  return (
    <div className="*:not-first:mt-1">
      <Label>{columnHeader}</Label>
      <Popover open={selectOpen} onOpenChange={setSelectOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={selectOpen}
            aria-controls={idLista}
            className="w-full justify-between border-border bg-background px-3 font-normal outline-offset-0 outline-none hover:bg-background focus-visible:outline-[3px]"
          >
            <div className="flex min-w-0 flex-1 items-center">
              {selectedValues.length > 0 ? (
                <span className="truncate">{selectedValues.join(", ")}</span>
              ) : (
                <span className="text-muted-foreground">{labelSelectPlaceholder}</span>
              )}
            </div>
            <ChevronsUpDown
              className="size-4 shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          id={idLista}
          className="w-full min-w-(--radix-popper-anchor-width) border-border p-0"
          align="start"
        >
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
                    {elegidas.has(String(value)) && <Check className="ml-auto size-4" />}
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
                      <X className="-ms-1 size-4 opacity-60" aria-hidden="true" />
                      {labelClear}
                    </Button>
                  </CommandGroup>
                </Fragment>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function TextFilter<TData extends RowData>({
  column,
  columnHeader,
}: FilterProps<TData>): React.JSX.Element {
  const id = useId();
  const columnFilterValue = column.getFilterValue();
  const labelSearch = useElLabel(
    "tables",
    "searchByColumn",
    `Buscar ${columnHeader.toLowerCase()}`,
    {
      column: columnHeader.toLowerCase(),
    },
  );

  return (
    <div className="*:not-first:mt-1">
      <Label htmlFor={`${id}-input`}>{columnHeader}</Label>
      <div className="relative">
        <Input
          id={`${id}-input`}
          className="peer ps-9"
          value={(columnFilterValue ?? "") as string}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={labelSearch}
          type="text"
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <Search className="size-4" />
        </div>
      </div>
    </div>
  );
}

function Filter<TData extends RowData>({
  column,
}: {
  column: Column<Caracteristicas, TData, unknown>;
}): React.JSX.Element {
  const { filterVariant } = metaDe(column.columnDef);
  const columnHeader = typeof column.columnDef.header === "string" ? column.columnDef.header : "";
  const shared = { column, columnHeader };

  if (filterVariant === "range") return <RangeFilter {...shared} />;
  if (filterVariant === "daterange") return <DateRangeFilter {...shared} />;
  if (filterVariant === "date") return <DateFilter {...shared} />;
  if (filterVariant === "select") return <SelectFilter {...shared} />;
  return <TextFilter {...shared} />;
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
