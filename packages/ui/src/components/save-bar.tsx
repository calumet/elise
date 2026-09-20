/**
 * La barra que avisa de cambios sin guardar.
 *
 * @module
 */

import { AlertCircle } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

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
 * botón a secas, como fija `reglas-ui.md#14-contarle-algo-al-usuario`.
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
  const [confirming, setConfirming] = React.useState(false);

  const renderLabel = useElLabel("ui", "saveBarMessage", "Cambios sin guardar");
  const dismissLabel = useElLabel("ui", "saveBarDiscard", "Descartar");
  const saveLabel = useElLabel("ui", "saveBarSave", "Guardar");
  const confirmTitle = useElLabel("ui", "saveBarConfirmTitle", "¿Descartar los cambios?");
  const confirmText = useElLabel(
    "ui",
    "saveBarConfirmDescription",
    "Lo que editaste se pierde y no se puede recuperar.",
  );
  const followLabel = useElLabel("ui", "saveBarKeepEditing", "Seguir editando");

  React.useEffect(() => {
    if (!dirty || !retain) return;

    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
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
          <AlertCircle aria-hidden="true" className="size-icon-md shrink-0" />
          <Text size="sm" weight="medium" className="min-w-0 flex-1 truncate">
            {message ?? renderLabel}
          </Text>
          <InlineStack gap={1} align="center" wrap={false} className="shrink-0">
            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              className="bg-state-hover"
              onClick={() => setConfirming(true)}
            >
              {dismissLabel}
            </Button>
            <Button
              size="sm"
              loading={saving}
              className="bg-foreground text-inverse shadow-none hover:bg-foreground/90 active:bg-foreground/80"
              onClick={onSave}
            >
              {saveLabel}
            </Button>
          </InlineStack>
        </InlineStack>
      </Box>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{followLabel}</AlertDialogCancel>
            <AlertDialogAction
              tone="danger"
              onClick={() => {
                setConfirming(false);
                onDiscard();
              }}
            >
              {dismissLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
