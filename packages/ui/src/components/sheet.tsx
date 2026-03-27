import { X } from "@calumet/elise-icons";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/cn";

const SheetContext = React.createContext({
  id: "",
  onOpenChange: undefined as ((open: boolean) => void) | undefined,
});

function Sheet({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const id = `sht${React.useId().replace(/:/g, "")}`;
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
    <SheetContext value={{ id, onOpenChange }}>
      {children}
      {!controlled && (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.getElementById("${id}");if(!d)return;document.querySelectorAll('[data-dialog-open="${id}"]').forEach(function(t){t.addEventListener("click",function(){d.showModal()})});d.addEventListener("click",function(e){if(e.target===d)d.close()})})()`,
          }}
        />
      )}
    </SheetContext>
  );
}

function SheetTrigger({
  asChild,
  className,
  onClick,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }) {
  const { id, onOpenChange } = React.useContext(SheetContext);
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

function SheetClose({ className, children, ...props }: React.ComponentPropsWithoutRef<"button">) {
  return (
    <form method="dialog" className="contents">
      <button type="submit" className={cn(className)} {...props}>
        {children ?? (
          <>
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </>
        )}
      </button>
    </form>
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  animate = true,
  ...props
}: React.ComponentPropsWithoutRef<"dialog"> & {
  side?: "top" | "right" | "bottom" | "left";
  animate?: boolean;
}) {
  const { id } = React.useContext(SheetContext);
  const sv = { right: "100% 0", left: "-100% 0", top: "0 -100%", bottom: "0 100%" }[side];
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: animate
            ? `#${id}::backdrop{background:rgba(0,0,0,.5);opacity:0;transition:opacity .3s,display .3s allow-discrete,overlay .3s allow-discrete}#${id}[open]::backdrop{opacity:1}@starting-style{#${id}[open]::backdrop{opacity:0}}#${id}{position:fixed;inset:0;margin:0;padding:0;max-width:none;max-height:none;width:100%;height:100dvh;border:none;background:transparent;overflow:hidden;transition:display .3s allow-discrete,overlay .3s allow-discrete}#${id}>div{translate:${sv};transition:translate .3s ease-in}#${id}[open]>div{translate:0 0;transition:translate .3s ease-out}@starting-style{#${id}[open]>div{translate:${sv}}}`
            : `#${id}::backdrop{background:rgba(0,0,0,.5)}#${id}{position:fixed;inset:0;margin:0;padding:0;max-width:none;max-height:none;width:100%;height:100dvh;border:none;background:transparent;overflow:hidden}`,
        }}
      />
      <dialog id={id} className={cn(className)} {...props}>
        <div
          className={cn(
            "absolute flex flex-col gap-4 bg-background shadow-lg border-border",
            side === "right" && "inset-y-0 right-0 w-3/4 border-l sm:max-w-sm",
            side === "left" && "inset-y-0 left-0 w-3/4 border-r sm:max-w-sm",
            side === "top" && "inset-x-0 top-0 border-b",
            side === "bottom" && "inset-x-0 bottom-0 border-t",
          )}
        >
          {children}
          <SheetClose className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" />
        </div>
      </dialog>
    </>
  );
}

function SheetHeader({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentPropsWithoutRef<"h2">) {
  return <h2 className={cn("text-foreground font-semibold", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentPropsWithoutRef<"p">) {
  return <p className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
