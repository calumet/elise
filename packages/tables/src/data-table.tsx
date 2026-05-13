import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
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
import { Pagination, PaginationContent, PaginationItem } from "@calumet/elise-ui/pagination";
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
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowData,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { Fragment, useCallback, useId, useMemo } from "react";

import { cn, dateRangeFilterFn, multiSelectFilterFn, exportToCSV, exportToJSON } from "./filters";
import { useElLabel } from "./i18n";

declare module "@tanstack/react-table" {
  // Los generics deben coincidir con los de @tanstack/react-table (mismo
  // nombre, count y bounds) para que el declaration merging produzca un .d.ts
  // válido. tsup descarta @ts-expect-error en el emit, así que tenemos que
  // declarar la firma correcta en vez de silenciarla.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select" | "date" | "daterange";
    className?: string;
  }

  interface FilterFns {
    dateRange: typeof dateRangeFilterFn;
    multiSelect: typeof multiSelectFilterFn;
  }
}

interface DataTableProps<TData, TValue> {
  name?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  exportTo?: boolean;
  refresh?: () => void | Promise<unknown>;
  pageSizeOptions?: number[];
  initialPageSize?: number;
}

type DateRangePickerValue = { from: Date | undefined; to?: Date };

const isDateRangePickerValue = (value: unknown): value is DateRangePickerValue => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as { from?: unknown; to?: unknown };
  const isDateOrUndefined = (item: unknown) => item === undefined || item instanceof Date;

  return isDateOrUndefined(candidate.from) && isDateOrUndefined(candidate.to);
};

function DataTableContent<TData, TValue>({
  name,
  columns,
  data,
  isLoading,
  exportTo,
  refresh,
  pageSizeOptions = [5, 10, 25, 50],
  initialPageSize,
}: DataTableProps<TData, TValue>) {
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
  const labelFirstPage = useElLabel("tables", "firstPage", "Go to first page");
  const labelPreviousPage = useElLabel("tables", "previousPage", "Go to previous page");
  const labelNextPage = useElLabel("tables", "nextPage", "Go to next page");
  const labelLastPage = useElLabel("tables", "lastPage", "Go to last page");

  const enhancedColumns = useMemo(() => {
    return columns.map((column) => {
      if (column.meta?.filterVariant === "select") {
        return {
          ...column,
          filterFn: "multiSelect" as const,
        };
      }
      if (column.meta?.filterVariant === "daterange") {
        return {
          ...column,
          filterFn: "dateRange" as const,
        };
      }
      return column;
    });
  }, [columns]);

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      dateRange: dateRangeFilterFn,
      multiSelect: multiSelectFilterFn,
    },
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

  return (
    <div className="w-full h-full min-w-0 flex flex-col justify-between">
      <div className="rounded-sm border border-border min-w-0">
        <section className="flex justify-between flex-wrap sm:flex-nowrap gap-3 px-4 py-4">
          <div className="flex flex-wrap gap-3 items-end">
            {table.getAllColumns().map((column) => {
              if (!column.columnDef.meta?.filterVariant) return null;

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
        <div className="w-full overflow-x-auto">
          <Table>
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
                            : (header.column.columnDef.meta?.className ?? "")
                        }
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              header.column.getCanSort() &&
                                "flex h-full cursor-pointer items-center justify-between gap-2 select-none",
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={(e) => {
                              if (
                                header.column.getCanSort() &&
                                (e.key === "Enter" || e.key === " ")
                              ) {
                                e.preventDefault();
                                header.column.getToggleSortingHandler()?.(e);
                              }
                            }}
                            tabIndex={header.column.getCanSort() ? 0 : undefined}
                          >
                            <span className="truncate">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {{
                              asc: (
                                <ChevronUp
                                  className="shrink-0 opacity-60 size-4"
                                  aria-hidden="true"
                                />
                              ),
                              desc: (
                                <ChevronDown
                                  className="shrink-0 opacity-60 size-4"
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
                  {isLoading == undefined || !isLoading ? (
                    <TableCell colSpan={columns.length} className="h-24 text-center w-[100px]">
                      {labelNoData}
                    </TableCell>
                  ) : (
                    <TableCell colSpan={columns.length} className="h-24 text-center w-[100px]">
                      {labelLoading}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-between gap-8 mt-4">
        <div className="flex items-center gap-3">
          <Label htmlFor={id} className="max-sm:sr-only">
            {labelRowsPerPage}
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger id={id} className="w-fit whitespace-nowrap">
              <SelectValue placeholder={labelPageSizePlaceholder} />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
              {pageOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-muted-foreground flex grow justify-end text-base whitespace-nowrap">
          <p className="text-muted-foreground text-base whitespace-nowrap" aria-live="polite">
            <span className="text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0,
                ),
                table.getRowCount(),
              )}
            </span>{" "}
            {labelOf} <span className="text-foreground">{table.getRowCount().toString()}</span>
          </p>
        </div>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label={labelFirstPage}
                >
                  <ChevronsLeft className="size-4" aria-hidden />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label={labelPreviousPage}
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label={labelNextPage}
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label={labelLastPage}
                >
                  <ChevronsRight className="size-4" aria-hidden />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

function Filter<TData>({ column }: { column: Column<TData, unknown> }) {
  const id = useId();
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};
  const columnHeader = typeof column.columnDef.header === "string" ? column.columnDef.header : "";
  const [selectOpen, setSelectOpen] = React.useState(false);

  const labelMin = useElLabel("tables", "min", "Min");
  const labelMax = useElLabel("tables", "max", "Max");
  const labelSelectPlaceholder = useElLabel("tables", "selectPlaceholder", "Select...");
  const labelNoOptions = useElLabel("tables", "noOptions", "No options found.");
  const labelClear = useElLabel("tables", "clear", "Clear");
  const labelSearchInColumn = useElLabel(
    "tables",
    "searchInColumn",
    `Search ${columnHeader.toLowerCase()}...`,
  );
  const labelSearch = useElLabel(
    "tables",
    "searchByColumn",
    `Buscar ${columnHeader.toLowerCase()}`,
  );

  const facetedUniqueValues = column.getFacetedUniqueValues();

  const sortedUniqueValues = useMemo(() => {
    if (filterVariant === "range" || filterVariant === "daterange") return [];

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
  }, [facetedUniqueValues, filterVariant]);

  if (filterVariant === "range") {
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

  if (filterVariant === "daterange") {
    const rangeValue = isDateRangePickerValue(columnFilterValue) ? columnFilterValue : undefined;

    return (
      <div className="*:not-first:mt-1">
        <Label>{columnHeader}</Label>
        <DateRangePicker value={rangeValue} onChange={(value) => column.setFilterValue(value)} />
      </div>
    );
  }

  if (filterVariant === "date") {
    const dateValue = columnFilterValue instanceof Date ? columnFilterValue : undefined;

    return (
      <div className="*:not-first:mt-1">
        <Label>{columnHeader}</Label>
        <DatePicker value={dateValue} onChange={(value) => column.setFilterValue(value)} />
      </div>
    );
  }
  if (filterVariant === "select") {
    const selectedValues = Array.isArray(columnFilterValue)
      ? columnFilterValue.map((value) => String(value))
      : columnFilterValue
        ? [String(columnFilterValue)]
        : [];

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
              className="bg-background hover:bg-background border-border w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
            >
              <div className="flex items-center min-w-0 flex-1">
                {selectedValues.length > 0 ? (
                  <span className="truncate">{selectedValues.join(", ")}</span>
                ) : (
                  <span className="text-muted-foreground">{labelSelectPlaceholder}</span>
                )}
              </div>
              <ChevronsUpDown
                className="size-4 text-muted-foreground/80 shrink-0"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="border-border w-full min-w-(--radix-popper-anchor-width) p-0"
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
                      {selectedValues.includes(String(value)) && (
                        <Check className="size-4 ml-auto" />
                      )}
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
                        <X className="size-4 -ms-1 opacity-60" aria-hidden="true" />
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
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <Search className="size-4" />
        </div>
      </div>
    </div>
  );
}

export function DataTable<TData, TValue>({
  name,
  columns,
  data,
  isLoading,
  exportTo,
  refresh,
  pageSizeOptions,
  initialPageSize,
}: DataTableProps<TData, TValue>) {
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

export type { DataTableProps, ColumnDef };
