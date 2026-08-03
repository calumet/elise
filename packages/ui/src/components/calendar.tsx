import { ChevronDown, ChevronLeft, ChevronRight } from "@calumet/elise-icons";
import * as React from "react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { Button, buttonVariants } from "./button";

import { cn } from "@/lib/cn";

/**
 * Calendario.
 *
 * Sigue la retícula del `DatePicker` de Polaris: celda de 32px con radio de 8,
 * número en 12px y encabezado de día tenue. Los días de los meses vecinos no se
 * pintan —Polaris deja la celda vacía— porque son fechas de otro mes ofrecidas
 * como si fueran de este, y el único sitio donde se distinguen es en un gris
 * que también usan las deshabilitadas.
 *
 * Al apuntar un día se rellena como si ya estuviera elegido: el estado de foco
 * y el de selección son el mismo dibujo, así que apuntar es la vista previa de
 * elegir. Hoy se marca solo con el peso del número, sin fondo, para no competir
 * con lo que sí está elegido.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-border has-focus:ring-ring/50 has-focus:ring-[3px] rounded-sm",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn("absolute bg-popover inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-sm pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 font-normal text-xs select-none",
          defaultClassNames.weekday,
        ),
        /* 2px entre semanas, no 8: la retícula tiene que leerse como un bloque
           y no como siete columnas sueltas.
           Un rango que cruza varias semanas se corta al final de cada fila; ahí
           el tramo remata con una esquina pequeña, para que el corte se lea
           como un dobladillo y no como si el rango terminara en el sábado. */
        week: cn(
          "flex w-full mt-0.5",
          "[&>td:first-child>button[data-range-middle=true]]:rounded-l-[0.25rem]",
          "[&>td:last-child>button[data-range-middle=true]]:rounded-r-[0.25rem]",
          defaultClassNames.week,
        ),
        week_number_header: cn("select-none w-(--cell-size)", defaultClassNames.week_number_header),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number,
        ),
        day: cn(
          "relative w-full h-full p-0 text-center group/day aspect-square select-none",
          defaultClassNames.day,
        ),
        /* El tramo intermedio va cuadrado y en superficie tenue; solo los
           extremos redondean, y solo por fuera. Así el rango se lee como una
           barra con dos topes en vez de como días sueltos pintados. */
        range_start: cn(
          "rounded-l-md bg-primary text-primary-foreground",
          defaultClassNames.range_start,
        ),
        range_middle: cn("rounded-none bg-muted text-foreground", defaultClassNames.range_middle),
        range_end: cn(
          "rounded-r-md rounded-l-none bg-primary text-primary-foreground",
          defaultClassNames.range_end,
        ),
        /* Hoy solo cambia de peso. Un fondo lo pondría a competir con el día
           elegido, que es el que de verdad tiene que destacar. */
        today: cn("font-bold", defaultClassNames.today),
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

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
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
      className={cn(
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 rounded-md text-xs leading-none font-normal",
        /* Apuntar pinta el mismo relleno que elegir, un tono por debajo: así se
           ve de antemano en qué queda el clic. Gana al tramo intermedio a
           propósito, que es lo que hace que el rango se pueda recorrer. */
        "hover:bg-primary-hover hover:text-primary-foreground",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-start=true]:rounded-md",
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-end=true]:rounded-r-md",
        "data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-middle=true]:rounded-none",
        "[&[data-range-end=true][data-range-start=false]]:rounded-l-none [&[data-range-end=false][data-range-start=true]]:rounded-r-none",
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
