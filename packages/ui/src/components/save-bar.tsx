/**
 * La barra que avisa de cambios sin guardar.
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
 * Aparece mientras `dirty` y se lleva ahí las dos salidas que quedan: guardar y
 * descartar. Una pantalla de ajustes larga deja el pie varias pantallas por
 * debajo del primer campo, así que quien cambia algo arriba pierde de vista el
 * control que lo aplica.
 *
 * Dentro del marco va `AppShellSaveBar`, que la coloca en la banda de la
 * cabecera. Suelta sirve igual en un formulario que no viva en un marco.
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

  React.useEffect(() => {
    if (!dirty || !retain) return;

    const alSalir = (evento: BeforeUnloadEvent) => {
      evento.preventDefault();
      evento.returnValue = "";
    };

    window.addEventListener("beforeunload", alSalir);
    return () => window.removeEventListener("beforeunload", alSalir);
  }, [dirty, retain]);

  if (!dirty) return null;

  return (
    <>
      <Box
        data-slot="save-bar"
        data-theme="dark"
        role="status"
        background="card"
        border
        radius="md"
        paddingX={2}
        paddingY={1}
        className={cn("min-w-0", className)}
        {...props}
      >
        <InlineStack gap={2} align="center" wrap={false}>
          <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
          <Text size="sm" weight="medium" className="min-w-0 flex-1 truncate">
            {message ?? rotulo}
          </Text>
          <InlineStack gap={1} align="center" wrap={false} className="shrink-0">
            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              className="bg-state-hover"
              onClick={() => setConfirmando(true)}
            >
              {rotuloDescartar}
            </Button>
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
          <AlertDialogFooter>
            <AlertDialogCancel>{rotuloSeguir}</AlertDialogCancel>
            <AlertDialogAction
              tone="danger"
              onClick={() => {
                setConfirmando(false);
                onDiscard();
              }}
            >
              {rotuloDescartar}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
