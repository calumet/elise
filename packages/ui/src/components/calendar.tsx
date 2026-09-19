/**
 * El calendario que usan por dentro los selectores de fecha.
 *
 * @module
 */

import { ChevronDown, ChevronLeft, ChevronRight } from "@calumet/elise-icons";
import * as React from "react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/cn";

import { Button, buttonVariants } from "./button";

/**
 * Calendario.
 *
 * La retícula es de celda de 32px con radio de 8, número en 12px y encabezado de
 * día tenue. Los días de los meses vecinos no se pintan, se deja la celda vacía:
 * son fechas de otro mes ofrecidas como si fueran de este, y el único sitio
 * donde se distinguirían es un gris que también usan las deshabilitadas.
 *
 * Al apuntar un día se rellena como si ya estuviera elegido: el estado de foco
 * y el de selección son el mismo dibujo, así que apuntar es la vista previa de
 * elegir. Hoy se marca solo con el peso del número, sin fondo, para no competir
 * con lo que sí está elegido.
 */
/* `DayPickerProps` es una unión discriminada por `mode`, y un `Omit` normal la
   colapsa en un solo miembro: `selected` deja de existir. Distribuyendo sobre
   cada miembro, la unión sobrevive. */
type WithoutLocale<T> = T extends unknown ? Omit<T, "locale"> : never;

/** El calendario, sobre react-day-picker. Es lo que dibujan por dentro `DatePicker` y `DateRangePicker`. */
function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: WithoutLocale<React.ComponentProps<typeof DayPicker>> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];

  /**
   * Idioma de los nombres de mes y de día, en BCP 47: `"es-CO"`, `"en-US"`.
   * Sin él se usa el del navegador.
   */
  locale?: string;
}): React.JSX.Element {
  const defaultClassNames = getDefaultClassNames();

  /* `react-day-picker` trae el inglés incrustado, así que sin esto un mes se
     escribe «August» dentro de una interfaz en español. Se formatea con `Intl`
     y no con un paquete de idiomas para no arrastrar uno por cada lengua: el
     navegador ya sabe escribir fechas en la suya. */
  const names = React.useMemo(() => {
    const withIntl = (options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, options);
    /* Varios idiomas abrevian con punto («dom.», «lun.»); en una columna de
       32px ese punto solo gasta ancho. */
    const noDot = (text: string) => text.replace(/\.$/, "");
    const mes = withIntl({ month: "long", year: "numeric" });
    const shortMonth = withIntl({ month: "short" });
    const weekday = withIntl({ weekday: "short" });
    return {
      mes: (f: Date) => mes.format(f),
      shortMonth: (f: Date) => noDot(shortMonth.format(f)),
      weekday: (f: Date) => noDot(weekday.format(f)),
    };
  }, [locale]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-background p-3 [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatCaption: names.mes,
        formatMonthDropdown: names.shortMonth,
        formatWeekdayName: names.weekday,
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        /* 4px entre el título y la retícula. Con 16 el encabezado se despega y
           el mes deja de leerse como una sola pieza. */
        month: cn("flex w-full flex-col gap-1", defaultClassNames.month),
        /* Nada de `w-full` aquí: la raíz es `w-fit`, así que el ancho de la
           tabla y el de su contenedor se definirían el uno al otro. El ancho
           sale de las celdas, que miden `--cell-size`. */
        month_grid: cn("border-collapse", defaultClassNames.month_grid),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-sm border border-border has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn("absolute inset-0 bg-popover opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "font-medium select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex h-8 items-center gap-1 rounded-sm pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label,
        ),
        /* Las filas se quedan como filas de tabla en vez de pasar a `flex`.
           Dentro de un `role="grid"`, poner `display:flex` en un `<tr>` le quita
           el rol implícito de fila, y el lector de pantalla se encuentra celdas
           sueltas sin nada que las agrupe. El ancho lo reparte `table-fixed`. */
        weekdays: cn(defaultClassNames.weekdays),
        weekday: cn(
          "py-2 text-xs font-normal text-muted-foreground select-none",
          defaultClassNames.weekday,
        ),
        /* Sin separación entre semanas: un rango de varias filas tiene que
           leerse como un bloque y no como barras sueltas.
           Al cruzar de semana el tramo se corta, y ahí remata con una esquina
           pequeña, para que el corte se lea como un dobladillo y no como si el
           rango terminara en el sábado. */
        week: cn(
          "[&>td:first-child>button[data-range-middle=true]]:rounded-l-[0.25rem]",
          "[&>td:last-child>button[data-range-middle=true]]:rounded-r-[0.25rem]",
          defaultClassNames.week,
        ),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number,
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none",
          defaultClassNames.day,
        ),
        /* El rango lo pinta el botón, no la celda. Pintarlo en las dos hacía que
           con un rango de un solo día, donde la misma celda es principio y fin,
           se aplicaran a la vez `rounded-l-md` de principio y `rounded-l-none`
           de fin, y las esquinas izquierdas salían rectas detrás del botón. La
           celda solo aporta el color de texto, que el botón hereda. */
        range_start: cn(defaultClassNames.range_start),
        range_middle: cn("text-foreground", defaultClassNames.range_middle),
        range_end: cn(defaultClassNames.range_end),
        /* El peso de hoy lo pone el propio botón, no esta celda: el número vive
           en el botón y ahí manda su `font-normal`. */
        today: cn(defaultClassNames.today),
        outside: cn("text-muted-foreground opacity-50", defaultClassNames.outside),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("size-4", className)} {...props} />;
          }

          if (orientation === "right") {
            return <ChevronRight className={cn("size-4", className)} {...props} />;
          }

          return <ChevronDown className={cn("size-4", className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

/** El botón de un día. Se exporta para poder reemplazarlo desde afuera. */
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>): React.JSX.Element {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      data-today={modifiers.today}
      className={cn(
        "flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1 rounded-md text-xs leading-none font-normal",
        /* Hoy solo cambia de peso. Un fondo lo pondría a competir con el día
           elegido, que es el que de verdad tiene que destacar. */
        "data-[today=true]:font-bold",
        /* Apuntar pinta el mismo relleno que elegir, un tono por debajo: así se
           ve de antemano en qué queda el clic. Gana al tramo intermedio a
           propósito, que es lo que hace que el rango se pueda recorrer. */
        "hover:bg-primary-hover hover:text-primary-foreground",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        "data-[range-start=true]:rounded-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        "data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground",
        "[&[data-range-end=false][data-range-start=true]]:rounded-r-none [&[data-range-end=true][data-range-start=false]]:rounded-l-none",
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50",
        "[&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
