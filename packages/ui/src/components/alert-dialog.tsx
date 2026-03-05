import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/cn";

const AlertDialogContext = React.createContext({
  id: "",
  onOpenChange: undefined as ((open: boolean) => void) | undefined,
});

export function AlertDialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const id = `adlg${React.useId().replace(/:/g, "")}`;
  const controlled = open !== undefined;

  React.useEffect(() => {
    const dialog = document.getElementById(id) as HTMLDialogElement | null;
    if (!dialog) return;

    if (controlled) {
      if (open && !dialog.open) dialog.showModal();
      if (!open && dialog.open) dialog.close();
    }

    const handleClose = () => onOpenChange?.(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [open, controlled, id, onOpenChange]);

  return (
    <AlertDialogContext value={{ id, onOpenChange }}>
      {children}
      {!controlled && (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.getElementById("${id}");if(!d)return;document.querySelectorAll('[data-dialog-open="${id}"]').forEach(function(t){t.addEventListener("click",function(){d.showModal()})})})()`,
          }}
        />
      )}
    </AlertDialogContext>
  );
}

export function AlertDialogTrigger({
  asChild,
  className,
  onClick,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }) {
  const { id, onOpenChange } = React.useContext(AlertDialogContext);
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

export function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"dialog">) {
  const { id } = React.useContext(AlertDialogContext);
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
          "m-auto w-[min(90vw,480px)] rounded-sm border border-border bg-surface p-6 shadow-floating outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </dialog>
    </>
  );
}

export function AlertDialogAction({
  asChild,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <form method="dialog" className="contents">
      <Comp type="submit" className={cn(className)} {...props} />
    </form>
  );
}

export function AlertDialogCancel({
  asChild,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <form method="dialog" className="contents">
      <Comp type="submit" className={cn(className)} {...props} />
    </form>
  );
}

export const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-2 text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

export const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<"h2">
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

export const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

export const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end",
      className,
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";
