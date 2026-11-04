/**
 * La caja de cambios sin guardar. La colocan `SaveBar` y `AppShellSaveBar`.
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
  AlertDialogBody,
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

/** Props de `SaveBar` y `AppShellSaveBar`. */
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

/** Props de {@link SaveBarFrame}. */
export type SaveBarFrameProps = SaveBarProps & {
  /** La capa suelta sobre la pantalla, y no la banda de 36px de la cabecera. */
  floating?: boolean;
};

/** La caja, sus dos salidas y la confirmación de descartar. */
export function SaveBarFrame({
  dirty,
  onSave,
  onDiscard,
  saving = false,
  message,
  retain = false,
  floating = false,
  className,
  ...props
}: SaveBarFrameProps): React.JSX.Element | null {
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
        radius={floating ? "xl" : "lg"}
        background={floating ? "inverse" : "none"}
        shadow={floating ? "lg" : undefined}
        paddingY={1}
        className={cn(
          "min-w-0 pe-1 text-foreground",
          floating
            ? "relative ps-4 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-surface-bevel max-sm:ps-1 max-sm:pt-2"
            : "ps-3",
          className,
        )}
        {...props}
      >
        <InlineStack
          gap={floating ? 3 : 2}
          align="center"
          wrap={false}
          className={cn(floating && "max-sm:flex-wrap max-sm:gap-y-2")}
        >
          <AlertCircle
            aria-hidden="true"
            className={cn("size-icon-md shrink-0", floating && "max-sm:ms-3")}
          />
          <Text size={floating ? "base" : "sm"} className="min-w-0 flex-1 truncate">
            {message ?? renderLabel}
          </Text>
          <InlineStack
            gap={floating ? 2 : 1}
            align="center"
            wrap={false}
            className={cn("shrink-0", floating && "max-sm:w-full")}
          >
            <Button
              size={floating ? "md" : "xs"}
              variant="ghost"
              disabled={saving}
              className={cn(
                "bg-fill-tertiary-hover hover:bg-fill-tertiary-active",
                floating && "max-sm:flex-1",
              )}
              onClick={() => setConfirming(true)}
            >
              {dismissLabel}
            </Button>
            <Button
              size={floating ? "md" : "xs"}
              loading={saving}
              className={cn(
                "bg-foreground text-inverse shadow-none hover:bg-foreground/90 active:bg-foreground/80",
                floating && "max-sm:flex-1",
              )}
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
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>{confirmText}</AlertDialogDescription>
          </AlertDialogBody>
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
