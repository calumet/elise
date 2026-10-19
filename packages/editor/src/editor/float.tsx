import { useEditorRef, useEditorSelector } from "platejs/react";
import * as React from "react";
import { createPortal } from "react-dom";

import type { Measurable } from "./anchor";

type Side = "top" | "bottom";
type Place = { top: number; left: number; side: Side };

const GAP = 8;
const EDGE = 8;

const scrollBox = (node: HTMLElement): DOMRect => {
  let parent = node.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") return parent.getBoundingClientRect();
    parent = parent.parentElement;
  }
  return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
};

const layerOf = (editor: ReturnType<typeof useEditorRef>): HTMLElement | null => {
  try {
    return editor.api.toDOMNode(editor)?.parentElement ?? null;
  } catch {
    return null;
  }
};

export type FloatProps = Omit<React.ComponentProps<"div">, "ref"> & {
  anchor: Measurable | undefined;
  side?: Side;
  align?: "start" | "end";
  offset?: number;
  refresh?: unknown;
  floatRef?: React.Ref<HTMLDivElement>;
  focusOnOpen?: boolean;
};

export const Float = ({
  anchor,
  side = "top",
  align = "start",
  offset = GAP,
  refresh,
  floatRef,
  focusOnOpen = false,
  className,
  style,
  children,
  ...props
}: FloatProps): React.ReactPortal | null => {
  const editor = useEditorRef();
  const layer = layerOf(editor);
  const [place, setPlace] = React.useState<Place | null>(null);
  const node = React.useRef<HTMLDivElement | null>(null);
  const chosen = React.useRef<Side | null>(null);

  const measure = React.useCallback(() => {
    const float = node.current;
    if (!float || !layer || !anchor) return;
    const target = anchor.getBoundingClientRect();
    if (!target.width && !target.height) return;
    const frame = layer.getBoundingClientRect();
    const view = scrollBox(layer);
    const { offsetWidth: width, offsetHeight: height } = float;
    if (!chosen.current) {
      const above = target.top - height - offset >= view.top;
      const below = target.bottom + height + offset <= view.bottom;
      chosen.current =
        side === "top" ? (above || !below ? "top" : "bottom") : below || !above ? "bottom" : "top";
    }
    const top =
      (chosen.current === "top" ? target.top - height - offset : target.bottom + offset) -
      frame.top;
    const wanted = (align === "start" ? target.left : target.right - width) - frame.left;
    const min = view.left - frame.left + EDGE;
    const max = view.right - frame.left - width - EDGE;
    const left = Math.max(min, Math.min(wanted, max));
    const placed = chosen.current ?? side;
    setPlace((last) =>
      last && last.top === top && last.left === left && last.side === placed
        ? last
        : { top, left, side: placed },
    );
  }, [anchor, layer, side, align, offset]);

  const version = useEditorSelector((ed) => ed.children, []);

  React.useLayoutEffect(() => {
    measure();
  }, [measure, refresh, version]);

  const shown = place !== null;
  React.useEffect(() => {
    if (!focusOnOpen || !shown) return;
    node.current
      ?.querySelector<HTMLElement>("input, textarea, button")
      ?.focus({ preventScroll: true });
  }, [focusOnOpen, shown]);

  React.useEffect(() => {
    if (!layer) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(layer);
    if (node.current) observer.observe(node.current);
    return () => observer.disconnect();
  }, [layer, measure]);

  const setNode = React.useCallback(
    (element: HTMLDivElement | null) => {
      node.current = element;
      if (typeof floatRef === "function") floatRef(element);
      else if (floatRef) floatRef.current = element;
    },
    [floatRef],
  );

  if (!layer || !anchor) return null;
  return createPortal(
    <div
      {...props}
      ref={setNode}
      data-slot="editor-float"
      data-side={place?.side ?? side}
      className={`absolute z-popover transition-opacity duration-(--duration-fast) ease-out ${className ?? ""}`}
      style={{
        ...style,
        top: place?.top ?? 0,
        left: place?.left ?? 0,
        opacity: place ? 1 : 0,
        pointerEvents: place ? undefined : "none",
      }}
    >
      {children}
    </div>,
    layer,
  );
};

export const useDismiss = (
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
): void => {
  const editor = useEditorRef();
  const latest = React.useRef(onDismiss);
  React.useLayoutEffect(() => {
    latest.current = onDismiss;
  });
  React.useEffect(() => {
    if (!open) return;
    const press = (event: PointerEvent) => {
      const target = event.target as Node;
      if (ref.current?.contains(target)) return;
      if (editor.api.toDOMNode(editor)?.contains(target)) return;
      if ((target as Element).closest?.("[data-radix-popper-content-wrapper]")) return;
      latest.current();
    };
    document.addEventListener("pointerdown", press, true);
    return () => document.removeEventListener("pointerdown", press, true);
  }, [editor, open, ref]);
};
