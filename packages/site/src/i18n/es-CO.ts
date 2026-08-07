export default {
  meta: {
    title: "Elise, la plataforma frontend de Calumet",
    description:
      "58 componentes accesibles con tema propio, más formularios, tablas, i18n y toasts, en un solo monorepo.",
  },

  nav: {
    home: "Ir al inicio",
    components: "Componentes",
    packages: "Paquetes",
    themes: "Temas",
    docs: "Docs",
    start: "Empezar",
    language: "Cambiar idioma",
  },

  hero: {
    titleLine1: "Interfaces accesibles",
    titleLine2: "sin diseñarlas de cero.",
    lede: "Instalás un paquete y ya tenés formularios, tablas, fechas y avisos con el mismo tema.",
    cta: "Ver componentes",
    "stat.components": "componentes",
    "stat.packages": "paquetes publicados",
    "stat.contrast": "de contraste en ambos temas",
    "stat.stack": "con pnpm, Vite y TypeScript",
  },

  packages: {
    titleLine1: "Ocho paquetes,",
    titleLine2: "una sola instalación",
    lede: "Del linter al formateo de fechas. Cada uno se publica por separado, así que entra solo el que uses.",
    docsLink: "Ver documentación",
    "ui.title": "Componentes",
    "ui.body":
      "Botones, campos, diálogos, menús y navegación, con el comportamiento sobre primitivas de Radix.",
    "forms.title": "Formularios",
    "forms.body": "`useZodForm` ata react-hook-form a un esquema de Zod.",
    "tables.title": "Tablas",
    "tables.body": "DataTable sobre TanStack, con orden, filtros, paginación y export.",
    "i18n.title": "i18n",
    "i18n.body": "Provider, hooks y formateo de fechas y números con Intl.",
    "toasts.title": "Toasts",
    "toasts.body":
      "`toast()` se llama desde cualquier función y el `Toaster` lo recibe por un bus de eventos.",
    "alerts.title": "Alertas modales",
    "alerts.body":
      "`AlertHost` resuelve `confirm()` como una promesa, sin estado en quien pregunta.",
    "icons.title": "Iconos",
    "icons.body": "Lucide re-exportado con tipos, para tener la dependencia en un solo sitio.",
    "linter.title": "Linter y formato",
    "linter.body":
      "La configuración de ESLint 9 y Prettier que usa el monorepo, para extender en tu repo.",
  },

  install: {
    title: "Dos líneas y tres imports.",
    lede: "El tema entero entra por CSS. No hay que registrar plugins de Tailwind ni declarar los tokens en tu configuración.",
    "panel.terminal": "terminal",
    "panel.css": "app.css",
  },

  preview: {
    titleLine1: "Una pantalla real,",
    titleLine2: "ocho paquetes",
    lede: "Un módulo de COMA, el sistema de Calumet para la comunidad académica de la UIS. La tabla, el formato de fechas y cifras, el toast, los iconos y el anillo de foco salen del monorepo.",
    catalogLink: "Abrir el catálogo",
    "note.ui":
      "La barra, los botones, los campos y las etiquetas de estado, con el mismo anillo de foco en toda la vista.",
    "note.tables":
      "Una sola DataTable resuelve el orden por columna, los filtros, la paginación y el export a CSV.",
    "note.i18n":
      "Las fechas y los porcentajes siguen al idioma. Al cambiarlo en la barra, la tabla se reformatea entera.",
    "note.toasts":
      "El aviso de abajo salió de `toast.success()` dentro del handler, sin providers anidados.",
    "note.forms":
      "«Registrar trabajo» abre un formulario con `useZodForm`. Borrar llama a `confirm()` y espera la promesa.",
    "note.icons":
      "Los iconos vienen tipados de Lucide y el repo entero pasa por el mismo ESLint 9.",

    "app.name": "COMA",
    "app.org": "UIS",
    "app.search": "Buscar estudiante o trabajo…",
    "app.nav.home": "Inicio",
    "app.nav.works": "Trabajos de grado",
    "app.nav.inProgress": "En desarrollo",
    "app.nav.defended": "Sustentados",
    "app.nav.groups": "Grupos",
    "app.nav.jobs": "Bolsa de empleo",
    "app.nav.section": "Académico",
    "app.nav.classroom": "Aula virtual",
    "app.nav.evaluation": "Evaluación docente",
    "app.nav.settings": "Ajustes",
    "app.notifications": "Notificaciones",
    "app.language": "Idioma",
    "app.title": "En desarrollo",
    "app.subtitle": "48 trabajos, Escuela de Ingeniería de Sistemas",
    "app.new": "Registrar trabajo",
    "app.col.student": "estudiante",
    "app.col.advisor": "director",
    "app.col.filed": "radicado",
    "app.col.progress": "avance",
    "app.col.status": "estado",
    "app.status.inProgress": "En desarrollo",
    "app.status.review": "En evaluación",
    "app.status.approved": "Aprobado",
    "app.status.draft": "Borrador",
    "app.toast": "Trabajo TG-0242 radicado",
  },

  decisions: {
    title: "Lo que ya viene decidido",
    lede: "Las seis preguntas que aparecen al montar un design system, con la respuesta que tomó Elise.",
    "theme.title": "El tema se pasa como objeto a applyTheme()",
    "theme.light": "claro",
    "theme.dark": "oscuro",
    "theme.save": "Guardar",
    "theme.brand": "Brand",
    "theme.ok": "OK",
    "copy.title": "Los componentes llegan como dependencia",
    "copy.rest": "+ 55 archivos",
    "copy.yours": "los mantenés vos",
    "copy.ours": "los mantenemos nosotros",
    "locale.title": "El mismo dato en es-CO y en en-US",
    "form.title": "useZodForm deja el error atado al campo",
    "form.label": "Correo",
    "form.error": "Ingresá un correo válido.",
    "form.comment1": "// aria-describedby, id y role",
    "form.comment2": "// ya vienen atados",
    "form.stack": "react-hook-form + Zod",
    "imperative.title": "Los avisos y las confirmaciones se llaman como funciones",
    "imperative.saved": "Guardado",
    "imperative.notify": "Mostrar aviso",
    "imperative.confirm": "Pedir confirmación",
    "imperative.ask": "¿Eliminar el trabajo?",
    "imperative.askBody": "Se borran el registro y sus anexos.",
    "imperative.delete": "Eliminar",
    "imperative.cancel": "Cancelar",
    "versions.title": "Una línea de configuración, ocho versiones",
    "versions.note": "changesets, cada paquete a su ritmo",
  },

  footer: {
    copyright: "© {year} Calumet. Todos los derechos reservados.",
    cta: "Ver componentes",
    "link.start": "Guía de inicio",
    "link.architecture": "Arquitectura",
    "link.themes": "Temas",
    "link.changelog": "Changelog",
    "link.github": "GitHub",
  },

  common: {
    copy: "Copiar {cmd}",
    copied: "Copiado al portapapeles",
  },

  /* Namespaces que consumen los propios paquetes de Elise. Sin ellos la
     DataTable y el Toaster caen a sus textos por defecto y se quedan en español
     con la página en inglés. */
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

  toasts: {
    close: "Cerrar",
  },

  ui: {
    close: "Cerrar",
    previous: "Anterior",
    next: "Siguiente",
    previousPage: "Ir a la página anterior",
    nextPage: "Ir a la página siguiente",
    toggleSidebar: "Alternar barra lateral",
    sidebar: "Barra lateral",
    sidebarDescription: "Muestra la barra lateral móvil.",
  },
};
