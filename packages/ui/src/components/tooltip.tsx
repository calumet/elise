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

const Tooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("group/tooltip relative inline-flex", className)} {...props} />
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
  const pos: React.CSSProperties = {};

  if (side === "top") {
    pos.bottom = "100%";
    pos.marginBottom = sideOffset;
  } else if (side === "bottom") {
    pos.top = "100%";
    pos.marginTop = sideOffset;
  } else if (side === "left") {
    pos.right = "100%";
    pos.marginRight = sideOffset;
  } else {
    pos.left = "100%";
    pos.marginLeft = sideOffset;
  }

  if (align === "center") {
    if (isHorizontal) {
      pos.left = "50%";
      pos.transform = "translateX(-50%)";
    } else {
      pos.top = "50%";
      pos.transform = "translateY(-50%)";
    }
  } else if (align === "start") {
    if (isHorizontal) pos.left = 0;
    else pos.top = 0;
  } else {
    if (isHorizontal) pos.right = 0;
    else pos.bottom = 0;
  }

  return (
    <div
      ref={ref}
      role="tooltip"
      style={{ ...pos, ...style }}
      className={cn(
        "invisible pointer-events-none absolute z-50 w-max max-w-[calc(100vw-1rem)] rounded-sm bg-foreground px-3 py-1.5 text-xs text-background text-balance opacity-0 transition-opacity group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-focus-within/tooltip:visible group-focus-within/tooltip:opacity-100",
        className,
      )}
      {...props}
    />
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
