import * as React from "react";

import { cn } from "@/lib/cn";

const DropdownContext = React.createContext<React.RefObject<HTMLDetailsElement | null> | null>(null);

const useDropdownClose = () => {
  const ref = React.useContext(DropdownContext);
  return () => {
    if (ref?.current) ref.current.open = false;
  };
};

export const Dropdown = React.forwardRef<
  HTMLDetailsElement,
  React.ComponentPropsWithoutRef<"details">
>(({ className, ...props }, ref) => {
  const innerRef = React.useRef<HTMLDetailsElement>(null);
  const detailsRef = (ref as React.RefObject<HTMLDetailsElement | null>) ?? innerRef;

  React.useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (el.open && !el.contains(e.target as Node)) {
        el.open = false;
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [detailsRef]);

  return (
    <DropdownContext value={detailsRef}>
      <details ref={detailsRef} className={cn("relative", className)} {...props} />
    </DropdownContext>
  );
});
Dropdown.displayName = "Dropdown";

export const DropdownTrigger = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"summary">
>(({ className, children, ...props }, ref) => (
  <summary
    ref={ref}
    className={cn("list-none cursor-pointer [&::-webkit-details-marker]:hidden", className)}
    {...props}
  >
    {children}
  </summary>
));
DropdownTrigger.displayName = "DropdownTrigger";

export const DropdownContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { align?: "start" | "center" | "end" }
>(({ className, align = "start", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute z-40 mt-1 min-w-[200px] rounded-sm border border-border bg-popover p-1 shadow-lg",
      align === "start" && "left-0",
      align === "center" && "left-1/2 -translate-x-1/2",
      align === "end" && "right-0",
      className,
    )}
    {...props}
  />
));
DropdownContent.displayName = "DropdownContent";

const baseItem =
  "flex cursor-default select-none items-center gap-2 rounded-sm px-3 py-2 text-base text-foreground outline-none transition hover:bg-muted hover:text-foreground";

export const DropdownItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, onClick, ...props }, ref) => {
  const close = useDropdownClose();
  return (
    <button
      ref={ref}
      type="button"
      className={cn(baseItem, "w-full text-left", className)}
      onClick={(e) => {
        onClick?.(e);
        close();
      }}
      {...props}
    />
  );
});
DropdownItem.displayName = "DropdownItem";

export const DropdownLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
    {...props}
  />
));
DropdownLabel.displayName = "DropdownLabel";

export const DropdownSeparator = React.forwardRef<
  HTMLHRElement,
  React.ComponentPropsWithoutRef<"hr">
>(({ className, ...props }, ref) => (
  <hr ref={ref} className={cn("-mx-1 my-1 h-px border-0 bg-border", className)} {...props} />
));
DropdownSeparator.displayName = "DropdownSeparator";
