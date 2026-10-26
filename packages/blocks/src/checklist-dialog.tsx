/**
 * Elegir con {@link ChecklistPicker} dentro de un diálogo que aplica o cancela:
 * cada apertura parte de lo aplicado, y lo marcado no sale hasta aplicar.
 *
 * @module
 */

import { Button } from "@calumet/elise-ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@calumet/elise-ui/dialog";
import * as React from "react";

import { ChecklistPicker, type ChecklistPickerProps } from "./checklist-picker";
import { useElLabel } from "./lib/i18n";

/** Props de {@link ChecklistDialog}. */
export type ChecklistDialogProps = Omit<ChecklistPickerProps, "selected" | "onToggle"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;

  /** Lo aplicado. Cada apertura parte de aquí. */
  selected: ReadonlySet<string>;

  /** Recibe el conjunto entero al aplicar; el diálogo se cierra solo. */
  onApply: (ids: ReadonlySet<string>) => void;

  applyLabel?: string;
  cancelLabel?: string;
};

/**
 * Elegir con {@link ChecklistPicker} dentro de un diálogo con Aplicar y Cancelar.
 *
 * El borrador vive dentro y se descarta al cerrar sin aplicar. Los textos por
 * defecto salen del namespace `ui` de `elise-i18n`.
 */
export function ChecklistDialog({
  open,
  onOpenChange,
  ...props
}: ChecklistDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" {...(!props.description && { "aria-describedby": undefined })}>
        <ChecklistDialogBody {...props} />
      </DialogContent>
    </Dialog>
  );
}

function ChecklistDialogBody({
  title,
  description,
  selected,
  onApply,
  applyLabel,
  cancelLabel,
  ...picker
}: Omit<ChecklistDialogProps, "open" | "onOpenChange">): React.JSX.Element {
  const defaultApply = useElLabel("ui", "checklistDialogApply", "Aplicar");
  const defaultCancel = useElLabel("ui", "checklistDialogCancel", "Cancelar");
  const [draft, setDraft] = React.useState(selected);
  const lockedIds = new Set(picker.options.filter((o) => o.locked).map((o) => o.id));

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <ChecklistPicker
        {...picker}
        selected={draft}
        onToggle={(id, checked) =>
          setDraft((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
          })
        }
      />
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">{cancelLabel ?? defaultCancel}</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={() => onApply(new Set([...draft].filter((id) => !lockedIds.has(id))))}>
            {applyLabel ?? defaultApply}
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}
