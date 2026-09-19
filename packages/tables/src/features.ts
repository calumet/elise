/**
 * El juego de características con el que `DataTable` arma su tabla.
 *
 * @module
 */

import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrIncludes,
  filterFn_equals,
  filterFn_inDateRange,
  filterFn_inNumberRange,
  filterFn_includesString,
  filterFn_weakEquals,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table";
import type {
  CreatedFilterFn,
  CreatedSortFn,
  RowModel,
  RowData,
  Table,
  TableFeature,
  TableFeatures,
} from "@tanstack/react-table";

/** Ajustes de columna que lee `DataTable`, en el `meta` de cada columna. */
export type ColumnMeta = {
  /** Control que se dibuja en la barra de filtros. Sin esto no hay filtro. */
  filterVariant?: "text" | "range" | "select" | "date" | "daterange";
  className?: string;
};

/* TanStack v9 no trae todas las características puestas: cada tabla declara las
   que usa y el resto no entra al bundle. Estas son las que `DataTable` necesita
   para lo que ya dibujaba, y quitar cualquiera borra su API de la instancia.

   De los dos registros de funciones va solo lo que el `auto` de por defecto
   puede elegir, que es lo que decide el orden y el filtro de una columna que no
   pide ninguno. Ordenar mira el tipo del valor y busca `datetime`,
   `alphanumeric` o `text`, cayendo en `basic`, que no pasa por el registro.
   Filtrar busca uno de seis según el valor sea texto, número, booleano,
   arreglo, fecha u objeto. Spread de los registros enteros metería las treinta
   funciones en el bundle para usar nueve.

   Una columna que quiera otra pasa la función por referencia en su `filterFn` o
   su `sortFn`, que es lo que hace acá la variante `select`: v9 acepta la
   función directa y el registro existe solo para poder nombrarla por su string.

   `columnMeta` es una ranura de solo tipo: de ahí sale el tipo de
   `columnDef.meta` para toda la tabla. Antes eso pedía un `declare module` sobre
   `ColumnMeta` de TanStack, que JSR rechaza por ampliar un módulo desde fuera. */
export type Features = {
  columnFacetingFeature: TableFeature;
  columnFilteringFeature: TableFeature;
  columnVisibilityFeature: TableFeature;
  rowPaginationFeature: TableFeature;
  rowSelectionFeature: TableFeature;
  rowSortingFeature: TableFeature;
  facetedMinMaxValues: (
    table: Table<TableFeatures, RowData>,
    columnId: string,
  ) => () => undefined | [number, number];
  facetedRowModel: (
    table: Table<TableFeatures, RowData>,
    columnId: string,
  ) => () => RowModel<TableFeatures, RowData>;
  facetedUniqueValues: (
    table: Table<TableFeatures, RowData>,
    columnId: string,
  ) => () => Map<unknown, number>;
  filteredRowModel: (
    table: Table<TableFeatures, RowData>,
  ) => () => RowModel<TableFeatures, RowData>;
  paginatedRowModel: (
    table: Table<TableFeatures, RowData>,
  ) => () => RowModel<TableFeatures, RowData>;
  sortedRowModel: (table: Table<TableFeatures, RowData>) => () => RowModel<TableFeatures, RowData>;
  filterFns: {
    arrIncludes: CreatedFilterFn<TableFeatures, RowData>;
    equals: CreatedFilterFn<TableFeatures, RowData>;
    inDateRange: CreatedFilterFn<TableFeatures, RowData>;
    inNumberRange: CreatedFilterFn<TableFeatures, RowData>;
    includesString: CreatedFilterFn<TableFeatures, RowData>;
    weakEquals: CreatedFilterFn<TableFeatures, RowData>;
  };
  sortFns: {
    alphanumeric: CreatedSortFn<TableFeatures, RowData>;
    datetime: CreatedSortFn<TableFeatures, RowData>;
    text: CreatedSortFn<TableFeatures, RowData>;
  };
  columnMeta: ColumnMeta;
};

export const features: Features = tableFeatures({
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  facetedMinMaxValues: createFacetedMinMaxValues(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: {
    arrIncludes: filterFn_arrIncludes,
    equals: filterFn_equals,
    inDateRange: filterFn_inDateRange,
    inNumberRange: filterFn_inNumberRange,
    includesString: filterFn_includesString,
    weakEquals: filterFn_weakEquals,
  },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  columnMeta: metaHelper<ColumnMeta>(),
});
