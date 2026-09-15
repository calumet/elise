/**
 * La barra que avisa de cambios sin guardar y se apodera de la cabecera.
 *
 * @module
 */

import { AlertCircle } from "@calumet/elise-icons";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { Box } from "./box";
import { Button } from "./button";
import { InlineStack } from "./stack";
import { Text } from "./text";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Props de {@link SaveBar}. */
export type SaveBarProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Si hay algo sin guardar. Sin esto la barra no se dibuja. */
  dirty: boolean;
  /** Lo que hace el botón de guardar. */
  onSave: () => void;
  /** Lo que hace descartar, ya confirmado por el usuario. */
  onDiscard: () => void;
  /** Tapa el rótulo de guardar con un indicador y deshabilita los dos botones. */
  saving?: boolean;
  /** Reemplaza el «Cambios sin guardar» de la izquierda. */
  message?: React.ReactNode;
  /**
   * Avisa antes de cerrar la pestaña, recargar o escribir otra dirección.
   * El diálogo lo pinta el navegador, con su texto, que no se puede sustituir.
   */
  retain?: boolean;
};

/**
 * La barra que avisa de cambios sin guardar.
 *
 * Aparece mientras `dirty`, encima de la cabecera del marco, y se lleva de ahí
 * las dos únicas salidas que quedan: guardar y descartar. Una pantalla de
 * ajustes larga deja el pie varias pantallas por debajo del primer campo, así
 * que quien cambia algo arriba pierde de vista el control que lo aplica.
 *
 * Va sobre la franja invertida, la misma superficie del toast, porque es una
 * capa que se pone encima de la pantalla y no una sección suya.
 *
 * **Descartar destruye lo editado**, así que pasa por `AlertDialog` y no por el
 * botón a secas, como fija `reglas-ui.md` § 1.4.
 *
 * `retain` cubre la mitad que es del navegador: cerrar la pestaña, recargar o
 * escribir otra dirección. La otra mitad, navegar dentro de la aplicación, no
 * tiene evento que valga porque el enrutado es de cada app; esa la conecta la
 * pantalla con su propio enrutador leyendo el mismo `dirty` que le pasa acá.
 *
 * ```tsx
 * const form = useZodForm(esquema);
 *
 * <SaveBar
 *   dirty={form.formState.isDirty}
 *   saving={form.formState.isSubmitting}
 *   onSave={form.handleSubmit(guardar)}
 *   onDiscard={() => form.reset()}
 * />
 * ```
 */
export function SaveBar({
  dirty,
  onSave,
  onDiscard,
  saving = false,
  message,
  retain = false,
  className,
  ...props
}: SaveBarProps): React.JSX.Element | null {
  const [confirmando, setConfirmando] = React.useState(false);

  const rotulo = useElLabel("ui", "saveBarMessage", "Cambios sin guardar");
  const rotuloDescartar = useElLabel("ui", "saveBarDiscard", "Descartar");
  const rotuloGuardar = useElLabel("ui", "saveBarSave", "Guardar");
  const tituloConfirmar = useElLabel("ui", "saveBarConfirmTitle", "¿Descartar los cambios?");
  const textoConfirmar = useElLabel(
    "ui",
    "saveBarConfirmDescription",
    "Lo que editaste se pierde y no se puede recuperar.",
  );
  const rotuloSeguir = useElLabel("ui", "saveBarKeepEditing", "Seguir editando");

  /* El aviso del navegador se engancha solo mientras haya algo que perder: un
     `beforeunload` puesto siempre le quita a la pestaña el bfcache. */
  React.useEffect(() => {
    if (!dirty || !retain) return;

    const alSalir = (evento: BeforeUnloadEvent) => {
      evento.preventDefault();
      /* Chrome todavía pide que el evento quede con `returnValue` asignado. El
         texto no se usa: el navegador pinta el suyo desde hace años. */
      evento.returnValue = "";
    };

    window.addEventListener("beforeunload", alSalir);
    return () => window.removeEventListener("beforeunload", alSalir);
  }, [dirty, retain]);

  if (!dirty) return null;

  return (
    <>
      {/* La misma receta que el resto de las piezas de la cabecera: `bg-card`
          bajo el tema oscuro más el contorno, porque contra un fondo casi negro
          la diferencia de luminosidad no alcanza a dibujar la caja y lo que la
          define es el borde. Dentro de `AppShellHeader` el tema ya es ese y el
          atributo no cambia nada; suelta en una pantalla clara, es lo que la
          vuelve oscura.

          Las medidas salen de sus dueños: el relleno y la superficie de `Box`,
          el hueco de `InlineStack`, el cuerpo de `Text`. El relleno es de un
          escalón para que la barra se lea dentro de la cabecera y no encima. */}
      <Box
        data-slot="save-bar"
        data-theme="dark"
        /* `status` y no `alert`: aparece al teclear y un `alert` interrumpiría
           al lector de pantalla en mitad de la palabra. */
        role="status"
        background="card"
        border
        radius="md"
        paddingX={2}
        paddingY={1}
        className={cn("min-w-0", className)}
        {...props}
      >
        {/* Sin `wrap`: es una fila de cabecera, y al envolver se sale de ella y
            se monta encima de las acciones. */}
        <InlineStack gap={2} align="center" wrap={false}>
          <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
          {/* En estrecho entre el botón del cajón y las acciones no queda ancho
              para el rótulo y los dos botones, y lo que no puede faltar son los
              botones. El rótulo se va a `sr-only`, así que lo sigue leyendo el
              lector de pantalla y el icono carga con el aviso a la vista. */}
          <Text size="sm" weight="medium" className="min-w-0 flex-1 truncate max-md:sr-only">
            {message ?? rotulo}
          </Text>
          <InlineStack gap={1} align="center" wrap={false} className="shrink-0">
            {/* Relleno sutil y contorno, no un contorno a secas: en la barra los
                dos botones se leen como un par y el de descartar es el que pesa
                menos, no el que desaparece. `--state-hover` en oscuro es blanco
                al 5%. */}
            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              className="bg-state-hover"
              onClick={() => setConfirmando(true)}
            >
              {rotuloDescartar}
            </Button>
            {/* El relleno sale de `--foreground` y no de `--primary`: el sólido
                del sistema en oscuro es azul casi negro y sobre esta caja no se
                despega. */}
            <Button
              size="sm"
              loading={saving}
              className="bg-foreground text-inverse shadow-none hover:bg-foreground/90 active:bg-foreground/80"
              onClick={onSave}
            >
              {rotuloGuardar}
            </Button>
          </InlineStack>
        </InlineStack>
      </Box>

      <AlertDialog open={confirmando} onOpenChange={setConfirmando}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tituloConfirmar}</AlertDialogTitle>
            <AlertDialogDescription>{textoConfirmar}</AlertDialogDescription>
          </AlertDialogHeader>
          {/* Los dos van con `asChild`: `AlertDialogCancel` y `AlertDialogAction`
              son el primitivo de Radix tal cual, sin estilo, así que sueltos
              salen como texto pelado. */}
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">{rotuloSeguir}</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                tone="danger"
                onClick={() => {
                  setConfirmando(false);
                  onDiscard();
                }}
              >
                {rotuloDescartar}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
