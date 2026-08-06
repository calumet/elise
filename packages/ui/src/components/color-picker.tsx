import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { CAJA_CAMPO } from "./input";

import { cn } from "@/lib/cn";
import { aCss, aHex, analizar, type Color, limitar, tonoPuro } from "@/lib/color";
import { useElLabel } from "@/lib/i18n";

const CARRIL = "relative h-3 w-full grow overflow-hidden rounded-full";
const PULGAR =
  "block size-4 rounded-full border-2 border-white bg-transparent shadow-md ring-1 ring-black/25 transition-[box-shadow] duration-(--duration-fast) ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export type ColorPickerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  /** Controlado. Acepta hex de 3, 4, 6 y 8, `rgb()`, `rgba()`, `hsl()` y `hsla()`. */
  value?: string;

  /** Sin controlar. Mismos formatos. */
  defaultValue?: string;

  /** Añade la barra de opacidad y hace que el hex salga de 8 dígitos. */
  alpha?: boolean;

  /** Envía el color con el formulario, en un campo oculto. */
  name?: string;

  /** En cada paso del arrastre, mientras se arrastra. */
  onValueChange?: (hex: string) => void;

  /** Al soltar, una sola vez. */
  onValueCommit?: (hex: string) => void;
};

/**
 * Selector de color.
 *
 * Cuatro piezas, que son las que hacen falta para llegar a un color concreto sin
 * saber de números: el área de saturación y brillo, la barra de tono, la de
 * opacidad cuando se admite, y el campo hex.
 *
 * El campo hex no es un extra: es la única de las cuatro que permite escribir un
 * valor exacto y la única que sirve con lector de pantalla, porque un área de
 * dos ejes no tiene equivalente en ARIA. Las dos barras sí son deslizadores de
 * verdad, con su teclado y su valor anunciado.
 *
 * Emite siempre hex, de 6 o de 8 con `alpha`, aunque le entre `rgb()` o `hsl()`.
 * Una sola salida evita que cada consumidor tenga que normalizar lo que reciba.
 */
export const ColorPicker: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ColorPickerProps> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      className,
      value,
      defaultValue = "#2d69de",
      alpha = false,
      name,
      onValueChange,
      onValueCommit,
      ...props
    },
    ref,
  ) => {
    const etiquetaArea = useElLabel("ui", "colorArea", "Saturación y brillo");
    const etiquetaTono = useElLabel("ui", "colorHue", "Tono");
    const etiquetaAlfa = useElLabel("ui", "colorAlpha", "Opacidad");
    const etiquetaHex = useElLabel("ui", "colorHex", "Valor hexadecimal");

    const [color, setColor] = React.useState<Color>(
      () => analizar(value ?? defaultValue) ?? { hsv: { h: 220, s: 80, v: 87 }, alfa: 1 },
    );
    const [escrito, setEscrito] = React.useState<string | null>(null);

    const hex = aHex(color, alpha);

    /* Solo se relee el prop cuando dice algo distinto de lo que este selector
       acaba de emitir. Si se releyera siempre, el tono se perdería al pasar por
       negro: el hex no lo lleva, y volver de #000000 dejaría el área en rojo. */
    const ultimoEmitido = React.useRef(hex);
    React.useEffect(() => {
      if (value === undefined || value === ultimoEmitido.current) return;
      const leido = analizar(value);
      if (leido) setColor(leido);
    }, [value]);

    const emitir = React.useCallback(
      (siguiente: Color, cerrado: boolean) => {
        setColor(siguiente);
        setEscrito(null);
        const texto = aHex(siguiente, alpha);
        ultimoEmitido.current = texto;
        onValueChange?.(texto);
        if (cerrado) onValueCommit?.(texto);
      },
      [alpha, onValueChange, onValueCommit],
    );

    /* Área de saturación y brillo */
    const area = React.useRef<HTMLDivElement | null>(null);

    const desdePuntero = React.useCallback(
      (evento: { clientX: number; clientY: number }, cerrado: boolean) => {
        const caja = area.current?.getBoundingClientRect();
        if (!caja) return;
        const s = limitar(((evento.clientX - caja.left) / caja.width) * 100, 0, 100);
        const v = limitar(100 - ((evento.clientY - caja.top) / caja.height) * 100, 0, 100);
        emitir({ ...color, hsv: { ...color.hsv, s, v } }, cerrado);
      },
      [color, emitir],
    );

    const arrastrar = (evento: React.PointerEvent<HTMLDivElement>) => {
      if (evento.button !== 0) return;
      evento.currentTarget.setPointerCapture(evento.pointerId);
      desdePuntero(evento, false);
    };

    const teclasDelArea = (evento: React.KeyboardEvent) => {
      const paso = evento.shiftKey ? 10 : 1;
      const mover: Record<string, [number, number]> = {
        ArrowLeft: [-paso, 0],
        ArrowRight: [paso, 0],
        ArrowUp: [0, paso],
        ArrowDown: [0, -paso],
      };
      const delta = mover[evento.key];
      if (!delta) return;
      evento.preventDefault();
      emitir(
        {
          ...color,
          hsv: {
            ...color.hsv,
            s: limitar(color.hsv.s + delta[0], 0, 100),
            v: limitar(color.hsv.v + delta[1], 0, 100),
          },
        },
        true,
      );
    };

    const alEscribirHex = (texto: string) => {
      setEscrito(texto);
      const leido = analizar(texto);
      if (!leido) return;
      /* Con `alpha` apagado un hex de 8 no puede traer su opacidad consigo. */
      const siguiente = alpha ? leido : { ...leido, alfa: 1 };
      setColor(siguiente);
      const emitido = aHex(siguiente, alpha);
      ultimoEmitido.current = emitido;
      onValueChange?.(emitido);
      onValueCommit?.(emitido);
    };

    return (
      <div
        data-slot="color-picker"
        ref={ref}
        className={cn("flex w-64 flex-col gap-3 select-none", className)}
        {...props}
      >
        <div
          data-slot="color-picker-area"
          ref={area}
          role="application"
          aria-label={etiquetaArea}
          tabIndex={0}
          onPointerDown={arrastrar}
          onPointerMove={(e) =>
            e.currentTarget.hasPointerCapture(e.pointerId) && desdePuntero(e, false)
          }
          onPointerUp={(e) =>
            e.currentTarget.hasPointerCapture(e.pointerId) && desdePuntero(e, true)
          }
          onKeyDown={teclasDelArea}
          className="relative h-40 w-full cursor-crosshair touch-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{
            /* Blanco de izquierda a derecha y negro de abajo arriba sobre el
               tono puro: eso es exactamente saturación por brillo. */
            backgroundImage: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)`,
            backgroundColor: tonoPuro(color.hsv.h),
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-1 ring-black/25"
            style={{
              left: `${color.hsv.s}%`,
              top: `${100 - color.hsv.v}%`,
              backgroundColor: aCss({ ...color, alfa: 1 }),
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "size-9 shrink-0 rounded-md ring-1 ring-border-strong ring-inset",
              "ajedrez",
            )}
          >
            <span className="block size-full rounded-md" style={{ backgroundColor: aCss(color) }} />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <SliderPrimitive.Root
              data-slot="color-picker-hue"
              aria-label={etiquetaTono}
              className="relative flex w-full touch-none items-center"
              min={0}
              max={360}
              step={1}
              value={[color.hsv.h]}
              onValueChange={([h]) => emitir({ ...color, hsv: { ...color.hsv, h } }, false)}
              onValueCommit={([h]) => emitir({ ...color, hsv: { ...color.hsv, h } }, true)}
            >
              <SliderPrimitive.Track
                className={CARRIL}
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                }}
              />
              <SliderPrimitive.Thumb
                className={PULGAR}
                style={{ backgroundColor: tonoPuro(color.hsv.h) }}
              />
            </SliderPrimitive.Root>

            {alpha ? (
              <SliderPrimitive.Root
                data-slot="color-picker-alpha"
                aria-label={etiquetaAlfa}
                className="relative flex w-full touch-none items-center"
                min={0}
                max={100}
                step={1}
                value={[Math.round(color.alfa * 100)]}
                onValueChange={([a]) => emitir({ ...color, alfa: a / 100 }, false)}
                onValueCommit={([a]) => emitir({ ...color, alfa: a / 100 }, true)}
              >
                <SliderPrimitive.Track className={cn(CARRIL, "ajedrez")}>
                  <span
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `linear-gradient(to right, transparent, ${aCss({ ...color, alfa: 1 })})`,
                    }}
                  />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb
                  className={PULGAR}
                  style={{ backgroundColor: aCss(color) }}
                />
              </SliderPrimitive.Root>
            ) : null}
          </div>
        </div>

        <input
          data-slot="color-picker-hex"
          aria-label={etiquetaHex}
          value={escrito ?? hex}
          onChange={(e) => alEscribirHex(e.target.value)}
          onBlur={() => setEscrito(null)}
          spellCheck={false}
          autoComplete="off"
          className={cn(CAJA_CAMPO, "font-mono text-sm")}
        />

        {name ? <input type="hidden" name={name} value={hex} /> : null}
      </div>
    );
  },
);
ColorPicker.displayName = "ColorPicker";
