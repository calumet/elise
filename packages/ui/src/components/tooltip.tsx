import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

interface TooltipContextValue {
  open: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const TooltipContext = React.createContext<TooltipContextValue>({
  open: false,
  triggerRef: { current: null },
});

function TooltipProvider({
  children,
  delayDuration: _,
}: {
  children: React.ReactNode;
  delayDuration?: number;
}) {
  return <>{children}</>;
}

function Tooltip({ className, children, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement>(null);

  return (
    <TooltipContext.Provider value={{ open, triggerRef }}>
      <div
        className={cn("relative inline-flex", className)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocusCapture={() => setOpen(true)}
        onBlurCapture={() => setOpen(false)}
        {...props}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({
  asChild,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span"> & { asChild?: boolean }) {
  const { triggerRef } = React.useContext(TooltipContext);
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      ref={triggerRef as React.Ref<HTMLElement>}
      className={cn("inline-flex", className)}
      {...props}
    />
  );
}

function getAlignedPosition(
  rect: DOMRect,
  size: number,
  align: "start" | "center" | "end",
  isHorizontal: boolean,
): number {
  if (isHorizontal) {
    if (align === "center") return rect.left + rect.width / 2 - size / 2;
    if (align === "start") return rect.left;
    return rect.right - size;
  }
  if (align === "center") return rect.top + rect.height / 2 - size / 2;
  if (align === "start") return rect.top;
  return rect.bottom - size;
}

function TooltipContent({
  className,
  children,
  side = "top",
  sideOffset = 8,
  align = "center",
  hidden,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
}) {
  const { open, triggerRef } = React.useContext(TooltipContext);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [style, setStyle] = React.useState<React.CSSProperties | null>(null);

  const isVisible = open && !hidden;

  React.useLayoutEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) {
      setStyle(null);
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const tw = tooltipRef.current.offsetWidth;
    const th = tooltipRef.current.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 8;

    let top: number;
    let left: number;

    if (side === "top") {
      top = rect.top - th - sideOffset;
      left = getAlignedPosition(rect, tw, align, true);
    } else if (side === "bottom") {
      top = rect.bottom + sideOffset;
      left = getAlignedPosition(rect, tw, align, true);
    } else if (side === "left") {
      top = getAlignedPosition(rect, th, align, false);
      left = rect.left - tw - sideOffset;
    } else {
      top = getAlignedPosition(rect, th, align, false);
      left = rect.right + sideOffset;
    }

    left = Math.max(pad, Math.min(left, vw - tw - pad));
    top = Math.max(pad, Math.min(top, vh - th - pad));

    setStyle({ position: "fixed", top, left });
  }, [isVisible, side, sideOffset, align, triggerRef]);

  if (!isVisible) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      style={style ?? { position: "fixed", visibility: "hidden" }}
      className={cn(
        "pointer-events-none z-50 w-max max-w-[calc(100vw-1rem)] rounded-sm bg-foreground px-3 py-1.5 text-xs text-background text-balance transition-opacity",
        style ? "opacity-100" : "opacity-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
