/**
 * El botón del sistema, con sus variantes, sus tonos y su estado de carga.
 *
 * @module
 */

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { Spinner } from "./spinner";

import { cn } from "@/lib/cn";

/** Props de {@link Button}. */
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl" | "icon" | "icon-sm";
  tone?: "success" | "warning" | "danger";

  asChild?: boolean;

  /**
   * Anuncia con `aria-busy` que la acción está corriendo, deshabilita el
   * control (evitar el envío repetido es su motivo de existir) y tapa el
   * contenido con un indicador centrado.
   *
   * El rótulo no se quita: se vuelve transparente. Así el botón no cambia de
   * ancho al empezar a cargar, y quien navegue por lector de pantalla sigue
   * sabiendo qué acción está en curso.
   */
  loading?: boolean;
};

/* El foco sigue la convención única del design system (ver CONTRIBUTING.md).
   El peso es `medium`: a estos tamaños el grado de arriba engorda el rótulo lo
   bastante como para que un botón secundario pese más que el texto que lo
   rodea. */
/* El icono lo acota el botón, igual que en Badge, Alert, DropdownMenu, Command y
   Sidebar: los de Lucide vienen a 24px y al lado de un rótulo de 13–14px se leen
   como otra jerarquía. `:not([class*='size-'])` deja la puerta abierta a quien
   necesite otro tamaño sin pelearse con la especificidad. */
/* `whitespace-nowrap` va junto al `overflow-hidden`, no por separado: dentro de
   una fila flex el botón encoge por debajo de su contenido, y con las dos
   sueltas el rótulo se parte en dos renglones y el recorte se lleva el segundo.
   Es la misma pareja que ya llevan `Badge` y `SegmentedControl`. */
const baseClasses =
  "relative inline-flex cursor-pointer items-center justify-center gap-2 text-center font-medium tracking-tight whitespace-nowrap rounded-md border border-transparent overflow-hidden transition-[background-color,border-color,box-shadow] duration-(--duration-fast) ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-background [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

/* El apagado es un cambio de tokens, no una capa de opacidad encima: sumar las
   dos apaga dos veces y el rótulo baja de contraste más de lo que se pretendía.
   El fondo lo pone cada variante, porque `ghost` no tiene ninguno que apagar y
   dárselo al deshabilitarlo le inventa una caja que nunca tuvo. */
const disabledClasses =
  "disabled:cursor-not-allowed disabled:text-muted-foreground disabled:shadow-none";

/* Los rellenos sólidos llevan bisel, que al presionar se invierte hacia adentro
   en lugar de solo oscurecer el fondo. Las variantes outline/ghost se apoyan en
   las superficies sutiles y no derivan el fondo con opacidad.
   `data-[state=open]` acompaña a `active` porque con `asChild` este botón es el
   disparador de un menú o un popover, y al soltar el ratón se quedaría plano
   mientras la superficie sigue abierta. */
const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  solid:
    "bg-primary text-primary-foreground shadow-bevel hover:bg-primary-hover active:bg-primary-active active:shadow-bevel-inset data-[state=open]:bg-primary-active data-[state=open]:shadow-bevel-inset disabled:bg-muted disabled:border-border",
  outline:
    "border border-border-strong text-foreground hover:bg-muted active:bg-muted active:shadow-bevel-inset data-[state=open]:bg-muted data-[state=open]:shadow-bevel-inset disabled:bg-muted disabled:border-border",
  ghost:
    "text-foreground hover:bg-muted active:bg-muted active:shadow-bevel-inset data-[state=open]:bg-muted data-[state=open]:shadow-bevel-inset",
};

const toneOverrides: Record<
  NonNullable<ButtonProps["tone"]>,
  Record<NonNullable<ButtonProps["variant"]>, string>
> = {
  success: {
    solid:
      "bg-success text-success-foreground shadow-bevel hover:bg-success-hover active:bg-success-active active:shadow-bevel-inset",
    outline:
      "border-success text-success-subtle-foreground hover:bg-success-subtle hover:text-success-subtle-foreground active:bg-success-subtle",
    ghost:
      "text-success-subtle-foreground hover:bg-success-subtle hover:text-success-subtle-foreground active:bg-success-subtle",
  },
  warning: {
    solid:
      "bg-warning text-warning-foreground shadow-bevel hover:bg-warning-hover active:bg-warning-active active:shadow-bevel-inset",
    outline:
      "border-warning text-warning-subtle-foreground hover:bg-warning-subtle hover:text-warning-subtle-foreground active:bg-warning-subtle",
    ghost:
      "text-warning-subtle-foreground hover:bg-warning-subtle hover:text-warning-subtle-foreground active:bg-warning-subtle",
  },
  danger: {
    solid:
      "bg-destructive text-destructive-foreground shadow-bevel hover:bg-destructive-hover active:bg-destructive-active active:shadow-bevel-inset",
    outline:
      "border-destructive text-destructive-subtle-foreground hover:bg-destructive-subtle hover:text-destructive-subtle-foreground active:bg-destructive-subtle",
    ghost:
      "text-destructive-subtle-foreground hover:bg-destructive-subtle hover:text-destructive-subtle-foreground active:bg-destructive-subtle",
  },
};

/** Devuelve las clases de un `Button`, para reusar su aspecto en un enlace o en cualquier otro elemento. */
export const buttonVariants = ({
  variant = "solid",
  size = "md",
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
} = {}): string => cn(baseClasses, disabledClasses, variantClasses[variant], sizeClasses[size]);

/* Un escalón por debajo de lo que traía Elise, sin bajar a los 28px de un
   chrome de escritorio denso: el resto del catálogo escribe a 14px y un botón
   de 28px al lado de ese texto se lee como un control secundario.
   Los dos cuadrados igualan el alto de `md` y de `sm`, para que una barra que
   mezcle rótulos e iconos no se desnivele. Un icono solo dentro de un botón con
   relleno de texto queda descentrado y la caja se lee corrida. */
const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-base",
  lg: "h-10 px-5 text-base",
  /* El paso táctil: 44px es el mínimo de área de toque, y ninguno de los otros
     tres llega. Los campos tienen el suyo del mismo alto, para que un botón y
     un campo en la misma fila sigan cuadrando también acá. */
  xl: "h-11 px-6 text-base",
  icon: "size-9",
  "icon-sm": "size-8",
};

/** El botón del sistema. `variant` elige el peso, `tone` el color de la acción, y `loading` la deshabilita y tapa el rótulo con un indicador sin cambiarle el ancho. */
export const Button: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ButtonProps> & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "solid",
      size = "md",
      tone,
      asChild = false,
      loading = false,
      disabled,
      type,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const toneClass = tone ? toneOverrides[tone][variant] : undefined;
    /* Con `asChild` el contenido pasa intacto: `Slot` admite un solo hijo, así
       que envolverlo rompería la composición. Ahí el estado lo anuncia
       `aria-busy` y el hijo pinta lo que quiera. */
    const cargando = loading && !asChild;
    /* El default de HTML para `type` es "submit", así que un Button dentro de un
       form lo enviaba aunque solo llevara onClick. Quien envíe tiene que pedir
       `type="submit"` explícitamente. Con `asChild` no se fuerza nada, porque el
       hijo puede ser un <a> y `type` no le corresponde. */
    return (
      <Comp
        data-slot="button"
        ref={ref}
        type={asChild ? type : (type ?? "button")}
        disabled={disabled || cargando || undefined}
        data-loading={loading ? "" : undefined}
        aria-busy={loading || undefined}
        className={cn(
          baseClasses,
          disabledClasses,
          variantClasses[variant],
          toneClass,
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {/* Las dos capas del estado de carga van dentro de una sola expresión:
            `Slot` cuenta un `null` suelto como un hijo más, y con `asChild` eso
            rompe su `Children.only`. */}
        {cargando ? (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center text-muted-foreground"
            >
              <Spinner />
            </span>
            {/* `contents` saca la envoltura del layout, de modo que el hueco y la
                separación entre los hijos siguen siendo los del botón sin cargar;
                lo único que aporta es el color que los apaga. */}
            <span className="contents text-transparent">{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";
