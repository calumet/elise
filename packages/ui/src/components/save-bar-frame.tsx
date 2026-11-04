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
import { Box, type BoxProps } from "./box";
import { Button, type ButtonProps } from "./button";
import { InlineStack, type InlineStackProps } from "./stack";
import { Text, type TextProps } from "./text";

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

type SaveBarLook = {
  box: Pick<BoxProps, "radius" | "background" | "shadow" | "className">;
  row: Pick<InlineStackProps, "gap" | "className">;
  icon?: string;
  text: TextProps["size"];
  actions: Pick<InlineStackProps, "gap" | "className">;
  button: Pick<ButtonProps, "size" | "className">;
};

const HEADER_LOOK: SaveBarLook = {
  box: { radius: "lg", className: "ps-3" },
  row: { gap: 2 },
  text: "sm",
  actions: { gap: 1 },
  button: { size: "xs" },
};

const FLOATING_LOOK: SaveBarLook = {
  box: {
    radius: "xl",
    background: "inverse",
    shadow: "lg",
    className:
      "relative ps-4 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-surface-bevel max-sm:ps-1 max-sm:pt-2",
  },
  row: { gap: 3, className: "max-sm:flex-wrap max-sm:gap-y-2" },
  icon: "max-sm:ms-3",
  text: "base",
  actions: { gap: 2, className: "max-sm:w-full" },
  button: { size: "md", className: "max-sm:flex-1" },
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

  const look = floating ? FLOATING_LOOK : HEADER_LOOK;

  return (
    <>
      <Box
        data-slot="save-bar"
        data-theme="dark"
        role="status"
        paddingY={1}
        {...look.box}
        className={cn("min-w-0 pe-1 text-foreground", look.box.className, className)}
        {...props}
      >
        <InlineStack align="center" wrap={false} {...look.row}>
          <AlertCircle aria-hidden="true" className={cn("size-icon-md shrink-0", look.icon)} />
          <Text size={look.text} className="min-w-0 flex-1 truncate">
            {message ?? renderLabel}
          </Text>
          <InlineStack
            align="center"
            wrap={false}
            gap={look.actions.gap}
            className={cn("shrink-0", look.actions.className)}
          >
            <Button
              size={look.button.size}
              variant="ghost"
              disabled={saving}
              className={cn(
                "bg-fill-tertiary-hover hover:bg-fill-tertiary-active",
                look.button.className,
              )}
              onClick={() => setConfirming(true)}
            >
              {dismissLabel}
            </Button>
            <Button
              size={look.button.size}
              loading={saving}
              className={cn(
                "bg-foreground text-inverse shadow-none hover:bg-foreground/90 active:bg-foreground/80",
                look.button.className,
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
