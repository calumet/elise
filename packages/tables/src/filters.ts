import { type FilterFn } from "@tanstack/react-table";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Concatena clases de Tailwind resolviendo las que se pisan entre sí. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un importe como moneda con `Intl.NumberFormat`, siempre con dos
 * decimales.
 *
 * @param currency Código ISO de la moneda. Por defecto `"USD"`.
 * @param locale Por defecto `"en-US"`.
 */
export function toCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Filtro de rango de fechas. El valor son dos fechas ISO, y cualquiera de las
 * dos puede venir vacía para acotar por un solo extremo. Descarta las filas sin
 * valor o con una fecha que no se puede parsear.
 */
export const dateRangeFilterFn: FilterFn<unknown> = (row, columnId, value: [string, string]) => {
  if (!value || value.length !== 2) return true;
  const [from, to] = value;

  const rowValue = row.getValue<unknown>(columnId);
  if (!rowValue) return false;

  const rowDate = new Date(rowValue as string);
  if (isNaN(rowDate.getTime())) return false;

  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;

  if (fromDate) fromDate.setHours(0, 0, 0, 0);
  if (toDate) toDate.setHours(23, 59, 59, 999);

  if (fromDate && isNaN(fromDate.getTime())) return false;
  if (toDate && isNaN(toDate.getTime())) return false;

  if (fromDate && toDate) {
    return rowDate >= fromDate && rowDate <= toDate;
  }
  if (fromDate) {
    return rowDate >= fromDate;
  }
  if (toDate) {
    return rowDate <= toDate;
  }
  return true;
};
dateRangeFilterFn.autoRemove = (val: [string, string]) => !val || (val[0] === "" && val[1] === "");

/**
 * Filtro de selección múltiple. El valor es la lista de opciones elegidas, y
 * la fila pasa si su valor, convertido a texto, está entre ellas.
 */
export const multiSelectFilterFn: FilterFn<unknown> = (row, columnId, value: string[]) => {
  if (!value || value.length === 0) return true;

  const rowValue = row.getValue<unknown>(columnId);
  if (rowValue === null || rowValue === undefined) return false;

  const stringValue = String(rowValue);
  return value.includes(stringValue);
};
multiSelectFilterFn.autoRemove = (val: string[]) => !val || val.length === 0;

/**
 * Devuelve el primer y el último instante del mes actual en ISO, listos para
 * usar como valor de un filtro `daterange`.
 */
export function getCurrentFullMonthRange(): string[] {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return [start.toISOString(), end.toISOString()];
}

const triggerDownload = (blob: Blob, fileName: string) => {
  const href = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), {
    href,
    download: fileName,
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(href), 0);
};

/**
 * Baja los datos como CSV, escapando comas, comillas y saltos de línea. El
 * nombre del archivo lleva la fecha. Devuelve `false` si no hay datos.
 */
export function exportToCSV(data: Record<string, string>[], name: string): boolean {
  if (!data || data.length === 0) {
    return false;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header] || "";
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const fileName = `${(name || "datos").toLowerCase()}-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
  triggerDownload(blob, fileName);
  return true;
}

/**
 * Baja los datos como JSON indentado. El nombre del archivo lleva la fecha.
 * Devuelve `false` si no hay datos.
 */
export function exportToJSON(data: Record<string, string>[], name: string): boolean {
  if (!data || data.length === 0) {
    return false;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const fileName = `${(name || "datos").toLowerCase()}-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
  triggerDownload(blob, fileName);
  return true;
}
