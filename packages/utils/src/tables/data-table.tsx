import React, { Fragment, useId, useMemo } from "react"
import { ChevronDownIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, FileTextIcon, UpdateIcon, MagnifyingGlassIcon, Cross2Icon, CheckIcon, CaretSortIcon, DownloadIcon, } from "@elise/icons"
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
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@elise/ui"
import { Button } from "@elise/ui"
import { Input } from "@elise/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@elise/ui"
import { Pagination, PaginationContent, PaginationItem } from "@elise/ui"
import { Label } from "@elise/ui"
import { Popover, PopoverContent, PopoverTrigger } from "@elise/ui"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@elise/ui"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@elise/ui"

import { cn, dateRangeFilterFn, multiSelectFilterFn, exportToCSV, exportToJSON } from "./filters"
import { DatePicker, DateRangePicker } from "@elise/ui"
import { Suspense } from "react"
import { Skeleton } from "@elise/ui"

declare module '@tanstack/react-table' {
  // @ts-expect-error this is for override the column metadata
  interface ColumnMeta {
    filterVariant?: 'text' | 'range' | 'select' | 'date' | 'daterange',
    className?: string
  }

  interface FilterFns {
    dateRange: typeof dateRangeFilterFn
    multiSelect: typeof multiSelectFilterFn
  }
}

interface DataTableProps<TData, TValue> {
  name?: string
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  exportTo?: boolean
  refresh?: () => void | Promise<unknown>
  pageSizeOptions?: number[]
  initialPageSize?: number
}

function DataTableContent<TData, TValue>({
  name,
  columns,
  data,
  isLoading,
  exportTo,
  refresh,
  pageSizeOptions = [5, 10, 25, 50],
  initialPageSize
}: DataTableProps<TData, TValue>) {
  const id = useId()
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const [sorting, setSorting] = React.useState<SortingState>([])

  const enhancedColumns = useMemo(() => {
    return columns.map(column => {
      if (column.meta?.filterVariant === 'select') {
        return {
          ...column,
          filterFn: 'multiSelect' as const
        }
      }
      if (column.meta?.filterVariant === 'daterange') {
        return {
          ...column,
          filterFn: 'dateRange' as const
        }
      }
      return column
    })
  }, [columns])

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
      multiSelect: multiSelectFilterFn
    },
    state: {
      sorting,
      columnFilters,
    },
  })

  React.useEffect(() => {
    if (initialPageSize) {
      table.setPageSize(initialPageSize)
    }
  }, [initialPageSize, table])

  const pageOptions = React.useMemo(() => {
    const base = initialPageSize ? [...pageSizeOptions, initialPageSize] : pageSizeOptions
    return Array.from(new Set(base)).sort((a, b) => a - b)
  }, [pageSizeOptions, initialPageSize])

  const exportData = !exportTo ? [] : table.getFilteredRowModel().rows.map(row => {
    const rowData: Record<string, string> = {}

    table.getAllColumns().forEach(column => {
      if (column.id === 'actions' || !column.columnDef.header) return

      const headerText =
      typeof column.columnDef.header === "string"
        ? column.columnDef.header
        : column.id;

      let value: unknown;
      // @ts-expect-error accessorFn exists
      if (column.columnDef.accessorFn) {
      // @ts-expect-error accessorFn exists
        value = column.columnDef.accessorFn(row.original, row.index);
      } else {
        value = row.getValue(column.id);
      }

      rowData[headerText] = String(value ?? "");
    })

    return rowData
  })

  return (
    <div className='w-full h-full flex flex-col justify-between'>
      <div className='rounded-sm border border-border'>
        <section className='flex justify-between flex-wrap sm:flex-nowrap gap-3 px-4 py-4'>
          <div className="flex flex-wrap gap-3 items-end">
            {table.getAllColumns().map(column => {
              if (!column.columnDef.meta?.filterVariant) return null

              return (
                <div className='w-45' key={column.id}>
                  <Filter column={column} />
                </div>
              )
            })}
            {columnFilters.length > 0 && (
              <Button
                onClick={() => {
                  setColumnFilters([])
                }}
                variant="outline"
              >
                <Cross2Icon className="size-4" />
              </Button>
            )}
          </div>
          <div className="flex justify-end gap-2">
            {exportTo && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <DownloadIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    const exportName = name || "datos";
                    exportToCSV(exportData, exportName);
                  }}>
                    <FileTextIcon className="size-4" />
                    CSV (.csv)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const exportName = name || "datos";
                    exportToJSON(exportData, exportName);
                  }}>
                    <FileTextIcon className="size-4" />
                    JSON (.json)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {refresh && (
              <Button onClick={refresh} variant="outline">
                <UpdateIcon className="size-4" />
              </Button>
            )}
          </div>
        </section>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        header.column.getIsSorted() === 'asc'
                          ? 'ascending'
                          : header.column.getIsSorted() === 'desc'
                            ? 'descending'
                            : 'none'
                      }
                      className={
                        header.column.id === 'actions' ?
                          'w-0 text-center' :
                          header.column.columnDef.meta?.className ?? ''
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                            'flex h-full cursor-pointer items-center justify-between gap-2 select-none'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={e => {
                            if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault()
                              header.column.getToggleSortingHandler()?.(e)
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          <span className='truncate'>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {{
                            asc: <ChevronUpIcon className='shrink-0 opacity-60 size-4' aria-hidden='true' />,
                            desc: <ChevronDownIcon className='shrink-0 opacity-60 size-4' aria-hidden='true' />
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                {isLoading == undefined || !isLoading ? (
                  <TableCell colSpan={columns.length} className='h-24 text-center w-[100px]'>
                    There is no data to display.
                  </TableCell>
                ) : (
                  <TableCell colSpan={columns.length} className='h-24 text-center w-[100px]'>
                    Loading data.
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-between gap-8 mt-4'>
        <div className='flex items-center gap-3'>
          <Label htmlFor={id} className='max-sm:sr-only'>
            Rows per page:
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={value => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger id={id} className='w-fit whitespace-nowrap'>
              <SelectValue placeholder='Select number of results' />
            </SelectTrigger>
            <SelectContent className='[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2'>
              {pageOptions.map(pageSize => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='text-muted-foreground flex grow justify-end text-base whitespace-nowrap'>
          <p className='text-muted-foreground text-base whitespace-nowrap' aria-live='polite'>
            <span className='text-foreground'>
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0
                ),
                table.getRowCount()
              )}
            </span>{' '}
            of <span className='text-foreground'>{table.getRowCount().toString()}</span>
          </p>
        </div>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  size='icon'
                  variant='outline'
                  className='disabled:pointer-events-none disabled:opacity-50'
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label='Go to first page'
                >
                  <DoubleArrowLeftIcon className="size-4" aria-hidden />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size='icon'
                  variant='outline'
                  className='disabled:pointer-events-none disabled:opacity-50'
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label='Go to previous page'
                >
                  <ChevronLeftIcon className="size-4" aria-hidden='true' />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size='icon'
                  variant='outline'
                  className='disabled:pointer-events-none disabled:opacity-50'
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label='Go to next page'
                >
                  <ChevronRightIcon className="size-4" aria-hidden='true' />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size='icon'
                  variant='outline'
                  className='disabled:pointer-events-none disabled:opacity-50'
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label='Go to last page'
                >
                  <DoubleArrowRightIcon className="size-4" aria-hidden />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

function Filter<TData>({ column }: { column: Column<TData, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnHeader = typeof column.columnDef.header === 'string' ? column.columnDef.header : ''
  const [selectOpen, setSelectOpen] = React.useState(false)

  const sortedUniqueValues = useMemo(() => {
    if (filterVariant === 'range' || filterVariant === 'daterange') return []

    const values = Array.from(column.getFacetedUniqueValues().keys())

    const flattenedValues = values.reduce((acc: string[], curr) => {
      if (Array.isArray(curr)) {
        return [...acc, ...curr]
      }

      return [...acc, curr]
    }, [])

    return Array.from(new Set(flattenedValues)).sort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [column.getFacetedUniqueValues(), filterVariant])

  if (filterVariant === 'range') {
    return (
      <div className='*:not-first:mt-1'>
        <Label>{columnHeader}</Label>
        <div className='flex'>
          <Input
            id={`${id}-range-1`}
            className='flex-1 rounded-e-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none'
            value={(columnFilterValue as [number, number])?.[0] ?? ''}
            onChange={e =>
              column.setFilterValue((old: [number, number]) => [
                e.target.value ? Number(e.target.value) : undefined,
                old?.[1]
              ])
            }
            placeholder='Min'
            type='number'
            aria-label={`${columnHeader} min`}
          />
          <Input
            id={`${id}-range-2`}
            className='-ms-px flex-1 rounded-s-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none'
            value={(columnFilterValue as [number, number])?.[1] ?? ''}
            onChange={e =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                e.target.value ? Number(e.target.value) : undefined
              ])
            }
            placeholder='Max'
            type='number'
            aria-label={`${columnHeader} max`}
          />
        </div>
      </div>
    )
  }

  if (filterVariant === 'daterange') {
    return (
      <div className='*:not-first:mt-1'>
        <Label>{columnHeader}</Label>
        <DateRangePicker value={columnFilterValue as any} onChange={value => column.setFilterValue(value)} />
      </div>
    )
  }

  if (filterVariant === 'date') {
    return (
      <div className='*:not-first:mt-1'>
        <Label>{columnHeader}</Label>
        <DatePicker value={columnFilterValue as any} onChange={value => column.setFilterValue(value)} />
      </div>
    )
  } 
  if (filterVariant === 'select') {
    const selectedValues = Array.isArray(columnFilterValue)
      ? columnFilterValue
      : columnFilterValue
        ? [String(columnFilterValue)]
        : []

    const toggleSelection = (value: string) => {
      const newValue = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value]

      column.setFilterValue(newValue.length === 0 ? undefined : newValue)
    }

    const clearAllSelections = () => {
      column.setFilterValue(undefined)
      setSelectOpen(false)
    }

    return (
      <div className='*:not-first:mt-1'>
        <Label>{columnHeader}</Label>
        <Popover open={selectOpen} onOpenChange={setSelectOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={selectOpen}
              className='bg-background hover:bg-background border-border w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]'
            >
              <div className="flex items-center min-w-0 flex-1">
                {selectedValues.length > 0 ? (
                  <span className="truncate">
                    {selectedValues.join(", ")}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select...</span>
                )}
              </div>
              <CaretSortIcon className="size-4 text-muted-foreground/80 shrink-0" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="border-border w-full min-w-(--radix-popper-anchor-width) p-0" align='start'>
            <Command>
              <CommandInput placeholder={`Search ${columnHeader.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>No options found.</CommandEmpty>
                <CommandGroup>
                  {sortedUniqueValues.map(value => (
                    <CommandItem
                      key={String(value)}
                      value={String(value)}
                      onSelect={() => toggleSelection(String(value))}
                    >
                      <span className="truncate">{String(value)}</span>
                      {selectedValues.includes(String(value)) && (
                        <CheckIcon className="size-4 ml-auto" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
                {selectedValues.length > 0 && (
                  <Fragment>
                    <CommandSeparator />
                    <CommandGroup>
                      <Button variant='ghost' className='w-full justify-start px-3 font-normal' onClick={clearAllSelections}>
                        <Cross2Icon className='size-4 -ms-1 opacity-60' aria-hidden='true' />
                        Clear
                      </Button>
                    </CommandGroup>
                  </Fragment>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className='*:not-first:mt-1'>
      <Label htmlFor={`${id}-input`}>{columnHeader}</Label>
      <div className='relative'>
        <Input
          id={`${id}-input`}
          className='peer ps-9'
          value={(columnFilterValue ?? '') as string}
          onChange={e => column.setFilterValue(e.target.value)}
          placeholder={`Buscar ${columnHeader.toLowerCase()}`}
          type='text'
        />
        <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50'>
          <MagnifyingGlassIcon className="size-4" />
        </div>
      </div>
    </div>
  )
}

export function DataTable<TData, TValue>({
  name,
  columns,
  data,
  isLoading,
  exportTo,
  refresh,
  pageSizeOptions,
  initialPageSize
}: DataTableProps<TData, TValue>) {
  return (
    <Suspense fallback={<Skeleton className="w-full h-96" />}>
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
    </Suspense>
  )
}

export type { DataTableProps, ColumnDef };
