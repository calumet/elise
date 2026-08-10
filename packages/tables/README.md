# @calumet/elise-tables

`DataTable` arma sobre TanStack Table una tabla con filtros, orden, paginado y exportación, tomando la configuración del `meta` de cada columna.

## Instalación

```bash
pnpm add jsr:@calumet/elise-tables    # JSR
pnpm add @calumet/elise-tables        # GitHub Packages
```

Requiere React 19 y `@calumet/elise-ui`. La configuración del registro de GitHub está en el [README del repositorio](../../README.md#consumir-los-paquetes).

## Uso

```tsx
import { DataTable, type ColumnDef } from "@calumet/elise-tables";

const columns: ColumnDef<Proyecto>[] = [
  { accessorKey: "name", header: "Proyecto", meta: { filterVariant: "text" } },
  { accessorKey: "status", header: "Estado", meta: { filterVariant: "select" } },
];

<DataTable name="proyectos" columns={columns} data={filas} initialPageSize={5} exportTo />;
```

El `ColumnDef` que exportamos es el de TanStack con el `meta` ya tipado. Antes eso venía de un `declare module`, que JSR rechaza por ser una ampliación global.

### filterVariant

Una columna sin `filterVariant` no aparece en la barra de filtros.

| Valor       | Control                                       |
| ----------- | --------------------------------------------- |
| `text`      | Campo de búsqueda por coincidencia            |
| `select`    | Lista con los valores presentes en la columna |
| `range`     | Mínimo y máximo                               |
| `date`      | Fecha única                                   |
| `daterange` | Rango de fechas                               |

## Utilidades

`exportToCSV` y `exportToJSON` bajan un archivo con los datos que reciben y devuelven `false` si no hay ninguno. `toCurrency` formatea importes, `getCurrentFullMonthRange` devuelve el primer y el último día del mes actual, y `dateRangeFilterFn` junto con `multiSelectFilterFn` son las funciones de filtro que usa la tabla por dentro.
