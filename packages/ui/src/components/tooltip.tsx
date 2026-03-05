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

function Tooltip({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("group/tooltip relative inline-flex", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function TooltipTrigger({
  asChild,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return <Comp className={cn("inline-flex", className)} {...props} />;
}

function TooltipContent({
  className,
  children,
  side = "top",
  sideOffset = 8,
  align = "center",
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
}) {
  const isHorizontal = side === "top" || side === "bottom";
  const style: React.CSSProperties = {};

  if (side === "top") {
    style.bottom = "100%";
    style.marginBottom = sideOffset;
  } else if (side === "bottom") {
    style.top = "100%";
    style.marginTop = sideOffset;
  } else if (side === "left") {
    style.right = "100%";
    style.marginRight = sideOffset;
  } else {
    style.left = "100%";
    style.marginLeft = sideOffset;
  }

  if (align === "center") {
    if (isHorizontal) {
      style.left = "50%";
      style.transform = "translateX(-50%)";
    } else {
      style.top = "50%";
      style.transform = "translateY(-50%)";
    }
  } else if (align === "start") {
    if (isHorizontal) style.left = 0;
    else style.top = 0;
  } else {
    if (isHorizontal) style.right = 0;
    else style.bottom = 0;
  }

  return (
    <div
      role="tooltip"
      style={style}
      className={cn(
        "invisible pointer-events-none absolute z-50 w-max rounded-sm bg-foreground px-3 py-1.5 text-xs text-background text-balance opacity-0 transition-opacity group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-focus-within/tooltip:visible group-focus-within/tooltip:opacity-100",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
