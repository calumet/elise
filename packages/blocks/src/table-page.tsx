import { Table, type TableProps } from "@calumet/elise-ui/table";
import * as React from "react";

import { Page, type PageProps } from "./page";

export type TablePageProps = Omit<PageProps, "children"> & {
  /**
   * Lo que Table acepta, tal cual. Va como un objeto y no como props sueltas
   * para no repetir acá la lista entera de la tabla: repetida, se queda vieja
   * en cuanto la tabla gana algo.
   */
  table?: Omit<TableProps, "children" | "filters" | "empty">;

  /** La barra de filtros, dentro del marco y encima de la tabla. */
  filters?: React.ReactNode;

  /** Encabezado y filas: lo que va dentro de `Table`. */
  children?: React.ReactNode;

  /**
   * Que no haya ni una fila. Elige cuál de los dos carteles se ve, así que se
   * pasa aunque los dos sean el mismo nodo.
   */
  empty?: boolean;

  /** No hay nada todavía. Lleva la acción que crea lo primero. */
  emptyState?: React.ReactNode;

  /** Hay filtros puestos. */
  filtered?: boolean;

  /**
   * Esos filtros no devuelven nada. Es otro cartel y no el mismo, porque son
   * dos situaciones con dos salidas: una se resuelve creando algo y la otra
   * quitando un filtro. Con un solo cartel, quien filtró se queda creyendo que
   * se le borraron los datos.
   */
  filteredEmptyState?: React.ReactNode;
};

/**
 * La pantalla de listado: cabecera, filtros, tabla y su estado vacío.
 *
 * Las filas van como hijos, no como datos: quien la usa ya tiene su tabla
 * armada y lo que le falta es dónde apoyarla.
 */
function TablePage({
  table,
  filters,
  children,
  empty = false,
  emptyState,
  filtered = false,
  filteredEmptyState,
  ...page
}: TablePageProps) {
  const cartel = filtered ? (filteredEmptyState ?? emptyState) : emptyState;

  return (
    <Page {...page}>
      <Table {...table} filters={filters} empty={empty ? cartel : undefined}>
        {empty ? null : children}
      </Table>
    </Page>
  );
}

export { TablePage };
