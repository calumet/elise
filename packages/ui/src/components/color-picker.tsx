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
 *
 * @module
 */

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/cn";
import { toCss, toHex, parse, type Color, clamp, pureTone } from "@/lib/color";
import { useElLabel } from "@/lib/i18n";

import { FIELD_BOX } from "./input";

const RAIL = "relative h-3 w-full grow overflow-hidden rounded-full";
const THUMB =
  "block size-4 rounded-full border-2 border-white bg-transparent shadow-md ring-1 ring-black/25 transition-[box-shadow] duration-(--duration-fast) ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Props de {@link ColorPicker}. */
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
    const areaLabel = useElLabel("ui", "colorArea", "Saturación y brillo");
    const toneLabel = useElLabel("ui", "colorHue", "Tono");
    const alphaLabel = useElLabel("ui", "colorAlpha", "Opacidad");
    const hexLabel = useElLabel("ui", "colorHex", "Valor hexadecimal");

    const [color, setColor] = React.useState<Color>(
      () => parse(value ?? defaultValue) ?? { hsv: { h: 220, s: 80, v: 87 }, alpha: 1 },
    );
    const [typed, setTyped] = React.useState<string | null>(null);

    const hex = toHex(color, alpha);

    /* Solo se relee el prop cuando dice algo distinto de lo que este selector
       acaba de emitir. Si se releyera siempre, el tono se perdería al pasar por
       negro: el hex no lo lleva, y volver de #000000 dejaría el área en rojo. */
    const [lastEmitted, setLastEmitted] = React.useState(hex);
    const [previousValue, setPreviousValue] = React.useState(value);
    if (value !== previousValue) {
      setPreviousValue(value);
      if (value !== undefined && value !== lastEmitted) {
        const read = parse(value);
        if (read) setColor(read);
      }
    }

    const emit = React.useCallback(
      (next: Color, closed: boolean) => {
        setColor(next);
        setTyped(null);
        const text = toHex(next, alpha);
        setLastEmitted(text);
        onValueChange?.(text);
        if (closed) onValueCommit?.(text);
      },
      [alpha, onValueChange, onValueCommit],
    );

    /* Área de saturación y brillo */
    const area = React.useRef<HTMLDivElement | null>(null);

    const fromPointer = React.useCallback(
      (event: { clientX: number; clientY: number }, closed: boolean) => {
        const box = area.current?.getBoundingClientRect();
        if (!box) return;
        const s = clamp(((event.clientX - box.left) / box.width) * 100, 0, 100);
        const v = clamp(100 - ((event.clientY - box.top) / box.height) * 100, 0, 100);
        emit({ ...color, hsv: { ...color.hsv, s, v } }, closed);
      },
      [color, emit],
    );

    const drag = (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      fromPointer(event, false);
    };

    const areaKeys = (event: React.KeyboardEvent) => {
      const step = event.shiftKey ? 10 : 1;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, step],
        ArrowDown: [0, -step],
      };
      const delta = moves[event.key];
      if (!delta) return;
      event.preventDefault();
      emit(
        {
          ...color,
          hsv: {
            ...color.hsv,
            s: clamp(color.hsv.s + delta[0], 0, 100),
            v: clamp(color.hsv.v + delta[1], 0, 100),
          },
        },
        true,
      );
    };

    const onTypeHex = (text: string) => {
      setTyped(text);
      const read = parse(text);
      if (!read) return;
      /* Con `alpha` apagado un hex de 8 no puede traer su opacidad consigo. */
      const next = alpha ? read : { ...read, alpha: 1 };
      setColor(next);
      const emitted = toHex(next, alpha);
      setLastEmitted(emitted);
      onValueChange?.(emitted);
      onValueCommit?.(emitted);
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
          aria-label={areaLabel}
          tabIndex={0}
          onPointerDown={drag}
          onPointerMove={(e) =>
            e.currentTarget.hasPointerCapture(e.pointerId) && fromPointer(e, false)
          }
          onPointerUp={(e) =>
            e.currentTarget.hasPointerCapture(e.pointerId) && fromPointer(e, true)
          }
          onPointerCancel={() => emit(color, true)}
          onKeyDown={areaKeys}
          className="relative h-40 w-full cursor-crosshair touch-none rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          style={{
            /* Blanco de izquierda a derecha y negro de abajo arriba sobre el
               tono puro: eso es exactamente saturación por brillo. */
            backgroundImage: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)`,
            backgroundColor: pureTone(color.hsv.h),
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-1 ring-black/25"
            style={{
              left: `${color.hsv.s}%`,
              top: `${100 - color.hsv.v}%`,
              backgroundColor: toCss({ ...color, alpha: 1 }),
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
            <span
              className="block size-full rounded-md"
              style={{ backgroundColor: toCss(color) }}
            />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <SliderPrimitive.Root
              data-slot="color-picker-hue"
              aria-label={toneLabel}
              className="relative flex w-full touch-none items-center"
              min={0}
              max={360}
              step={1}
              value={[color.hsv.h]}
              onValueChange={([h]) => emit({ ...color, hsv: { ...color.hsv, h } }, false)}
              onValueCommit={([h]) => emit({ ...color, hsv: { ...color.hsv, h } }, true)}
            >
              <SliderPrimitive.Track
                className={RAIL}
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                }}
              />
              <SliderPrimitive.Thumb
                className={THUMB}
                style={{ backgroundColor: pureTone(color.hsv.h) }}
              />
            </SliderPrimitive.Root>

            {alpha ? (
              <SliderPrimitive.Root
                data-slot="color-picker-alpha"
                aria-label={alphaLabel}
                className="relative flex w-full touch-none items-center"
                min={0}
                max={100}
                step={1}
                value={[Math.round(color.alpha * 100)]}
                onValueChange={([a]) => emit({ ...color, alpha: a / 100 }, false)}
                onValueCommit={([a]) => emit({ ...color, alpha: a / 100 }, true)}
              >
                <SliderPrimitive.Track className={cn(RAIL, "ajedrez")}>
                  <span
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `linear-gradient(to right, transparent, ${toCss({ ...color, alpha: 1 })})`,
                    }}
                  />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb
                  className={THUMB}
                  style={{ backgroundColor: toCss(color) }}
                />
              </SliderPrimitive.Root>
            ) : null}
          </div>
        </div>

        <input
          data-slot="color-picker-hex"
          aria-label={hexLabel}
          value={typed ?? hex}
          onChange={(e) => onTypeHex(e.target.value)}
          onBlur={() => setTyped(null)}
          spellCheck={false}
          autoComplete="off"
          className={cn(FIELD_BOX, "font-mono text-sm")}
        />

        {name ? <input type="hidden" name={name} value={hex} /> : null}
      </div>
    );
  },
);
ColorPicker.displayName = "ColorPicker";
