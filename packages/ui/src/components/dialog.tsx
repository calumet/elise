import { X } from "@calumet/elise-icons";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/cn";

const DialogContext = React.createContext({
  id: "",
  onOpenChange: undefined as ((open: boolean) => void) | undefined,
});

export function Dialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const id = `dlg${React.useId().replace(/:/g, "")}`;
  const controlled = open !== undefined;

  React.useEffect(() => {
    const dialog = document.getElementById(id) as HTMLDialogElement | null;
    if (!dialog) return;

    if (controlled) {
      if (open && !dialog.open) dialog.showModal();
      if (!open && dialog.open) dialog.close();
    }

    const handleClose = () => onOpenChange?.(false);
    const handleBackdrop = (e: MouseEvent) => {
      if (e.target === dialog) {
        if (onOpenChange) onOpenChange(false);
        else dialog.close();
      }
    };

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleBackdrop);
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleBackdrop);
    };
  }, [open, controlled, id, onOpenChange]);

  return (
    <DialogContext value={{ id, onOpenChange }}>
      {children}
      {!controlled && (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.getElementById("${id}");if(!d)return;document.querySelectorAll('[data-dialog-open="${id}"]').forEach(function(t){t.addEventListener("click",function(){d.showModal()})});d.addEventListener("click",function(e){if(e.target===d)d.close()})})()`,
          }}
        />
      )}
    </DialogContext>
  );
}

export function DialogTrigger({
  asChild,
  className,
  onClick,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }) {
  const { id, onOpenChange } = React.useContext(DialogContext);
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-dialog-open={id}
      className={cn(className)}
      {...props}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        onOpenChange?.(true);
      }}
    />
  );
}

export function DialogClose({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  return (
    <form method="dialog" className="contents">
      <button type="submit" className={cn(className)} {...props}>
        {children ?? (
          <>
            <X aria-hidden />
            <span className="sr-only">Close</span>
          </>
        )}
      </button>
    </form>
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"dialog">) {
  const { id } = React.useContext(DialogContext);
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `#${id}::backdrop{backdrop-filter:blur(1px);opacity:0;transition:opacity .15s,display .15s allow-discrete,overlay .15s allow-discrete}#${id}[open]::backdrop{opacity:1}@starting-style{#${id}[open]::backdrop{opacity:0}}#${id}{opacity:0;transform:scale(.95);transition:opacity .15s,transform .15s,display .15s allow-discrete,overlay .15s allow-discrete}#${id}[open]{opacity:1;transform:scale(1)}@starting-style{#${id}[open]{opacity:0;transform:scale(.95)}}`,
        }}
      />
      <dialog
        id={id}
        className={cn(
          "m-auto w-[min(90vw,480px)] rounded-sm border border-border bg-background p-6 shadow-lg outline-none",
          className,
        )}
        {...props}
      >
        <DialogClose className="absolute right-3 top-2 inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" />
        {children}
      </dialog>
    </>
  );
}

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-2 text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<"h2">
>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold tracking-tight", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";
