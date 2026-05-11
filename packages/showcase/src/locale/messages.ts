import type { Messages } from "@calumet/elise-i18n";

export const messages: Messages = {
  "es-CO": {
    // Namespaces de las librerías Elise
    tables: {
      noData: "No hay datos para mostrar.",
      loading: "Cargando datos.",
      rowsPerPage: "Filas por página:",
      rowsPerPagePlaceholder: "Cantidad de resultados",
      of: "de",
      firstPage: "Ir a la primera página",
      previousPage: "Página anterior",
      nextPage: "Página siguiente",
      lastPage: "Ir a la última página",
      min: "Mín",
      max: "Máx",
      selectPlaceholder: "Seleccionar...",
      noOptions: "Sin opciones.",
      clear: "Limpiar",
      searchInColumn: "Buscar en {column}...",
      searchByColumn: "Buscar {column}",
    },
    alerts: {
      ok: "Aceptar",
      confirm: "Confirmar",
      cancel: "Cancelar",
    },
    toasts: {
      close: "Cerrar",
    },
    // Namespace propio de la app (demuestra que no se limita a Elise)
    app: {
      title: "Showcase de Elise UI",
      subtitle: "Ejemplos rápidos usando Radix + Tailwind con el design system.",
      theme: "Tema",
      languageSwitcher: "Idioma: {locale}",
      contactGreeting: "Hola {name}, gracias por contactarnos.",
      currentTime: "Ahora son las {time}.",
      revenue: "Ingresos del mes: {amount}",
      growth: "Crecimiento: {percent}",
    },
  },
  "en-US": {
    tables: {
      noData: "There is no data to display.",
      loading: "Loading data.",
      rowsPerPage: "Rows per page:",
      rowsPerPagePlaceholder: "Select number of results",
      of: "of",
      firstPage: "Go to first page",
      previousPage: "Go to previous page",
      nextPage: "Go to next page",
      lastPage: "Go to last page",
      min: "Min",
      max: "Max",
      selectPlaceholder: "Select...",
      noOptions: "No options found.",
      clear: "Clear",
      searchInColumn: "Search {column}...",
      searchByColumn: "Search {column}",
    },
    alerts: {
      ok: "OK",
      confirm: "Confirm",
      cancel: "Cancel",
    },
    toasts: {
      close: "Close",
    },
    app: {
      title: "Elise UI Showcase",
      subtitle: "Quick examples using Radix + Tailwind with the design system.",
      theme: "Theme",
      languageSwitcher: "Language: {locale}",
      contactGreeting: "Hi {name}, thanks for reaching out.",
      currentTime: "It is now {time}.",
      revenue: "Monthly revenue: {amount}",
      growth: "Growth: {percent}",
    },
  },
};

export type AppLocale = keyof typeof messages;
