import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/cn";

function TooltipProvider({
  children,
  delayDuration: _,
}: {
  children: React.ReactNode;
  delayDuration?: number;
}) {
  return <>{children}</>;
}

function clampToViewport(group: HTMLElement) {
  const el = group.querySelector<HTMLElement>('[role="tooltip"]');
  if (!el) return;
  el.style.translate = "";
  const rect = el.getBoundingClientRect();
  const pad = 8;
  let dx = 0;
  if (rect.right > window.innerWidth - pad) dx = window.innerWidth - pad - rect.right;
  if (rect.left < pad) dx = pad - rect.left;
  if (dx) el.style.translate = `${dx}px 0`;
}

function resetClamp(group: HTMLElement) {
  const el = group.querySelector<HTMLElement>('[role="tooltip"]');
  if (el) el.style.translate = "";
}

const Tooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("group/tooltip relative inline-flex", className)}
    onMouseEnter={(e) => clampToViewport(e.currentTarget)}
    onMouseLeave={(e) => resetClamp(e.currentTarget)}
    onFocusCapture={(e) => clampToViewport(e.currentTarget)}
    onBlurCapture={(e) => resetClamp(e.currentTarget)}
    {...props}
  />
));
Tooltip.displayName = "Tooltip";

const TooltipTrigger = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & { asChild?: boolean }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "span";
  return <Comp ref={ref} className={cn("inline-flex", className)} {...props} />;
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    side?: "top" | "bottom" | "left" | "right";
    sideOffset?: number;
    align?: "start" | "center" | "end";
  }
>(({ className, side = "top", sideOffset = 8, align = "center", style, ...props }, ref) => {
  const isHorizontal = side === "top" || side === "bottom";

  const offsetStyle: React.CSSProperties =
    side === "top" ? { marginBottom: sideOffset } :
    side === "bottom" ? { marginTop: sideOffset } :
    side === "left" ? { marginRight: sideOffset } :
    { marginLeft: sideOffset };

  return (
    <div
      ref={ref}
      role="tooltip"
      style={{ ...offsetStyle, ...style }}
      className={cn(
        "invisible pointer-events-none absolute z-50 w-max max-w-[calc(100vw-1rem)] rounded-sm bg-foreground px-3 py-1.5 text-xs text-background text-balance opacity-0 transition-opacity group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-focus-within/tooltip:visible group-focus-within/tooltip:opacity-100",
        side === "top" && "bottom-full",
        side === "bottom" && "top-full",
        side === "left" && "right-full",
        side === "right" && "left-full",
        align === "center" && isHorizontal && "left-1/2 -translate-x-1/2",
        align === "center" && !isHorizontal && "top-1/2 -translate-y-1/2",
        align === "start" && isHorizontal && "left-0",
        align === "start" && !isHorizontal && "top-0",
        align === "end" && isHorizontal && "right-0",
        align === "end" && !isHorizontal && "bottom-0",
        className,
      )}
      {...props}
    />
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
