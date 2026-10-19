import type { TElement } from "platejs";
import type { PlateEditor } from "platejs/react";
import { flushSync } from "react-dom";

import { motionOptions, reducedMotion } from "./motion";
import { blockEntry, canMoveBlock, isColumns, moveBlock, type DropPosition } from "./structure";

export type DropTarget = { id: string; position: DropPosition };

export type PageDrag = { finish: (commit: boolean) => void };

type Point = { x: number; y: number };
type Anchor = { element: HTMLElement; side: "before" | "after"; gap: number };

const BLOCK = '[data-slot="block"]';
const PAGE_SLACK = { x: 64, y: 32 };
const GAP = 16;
const EASE = 0.25;

const blocksIn = (container: Element): HTMLElement[] =>
  [...container.children].filter(
    (node): node is HTMLElement => node instanceof HTMLElement && node.matches(BLOCK),
  );

const idOf = (element: HTMLElement): string => element.dataset.blockId ?? "";

const within = (box: DOMRect, point: Point, x: number, y: number): boolean =>
  point.x >= box.left - x &&
  point.x <= box.right + x &&
  point.y >= box.top - y &&
  point.y <= box.bottom + y;

const sameTarget = (a: DropTarget | null, b: DropTarget | null): boolean =>
  a?.id === b?.id && a?.position === b?.position;

const pointOf = (event: Event | null): Point => {
  const pointer = event as PointerEvent | null;
  return { x: pointer?.clientX ?? 0, y: pointer?.clientY ?? 0 };
};

const settle = (root: HTMLElement, before: Map<string, DOMRect>, id: string): void => {
  const reduce = reducedMotion();
  const options = motionOptions(root);
  const shifts = new Map<Element, Point>();
  for (const element of root.querySelectorAll<HTMLElement>("[data-block-id]")) {
    const from = before.get(idOf(element));
    if (!from) continue;
    const now = element.getBoundingClientRect();
    const shift = { x: from.left - now.left, y: from.top - now.top };
    shifts.set(element, shift);
    const parent = element.parentElement?.closest("[data-block-id]");
    const carried = parent ? shifts.get(parent) : undefined;
    const x = shift.x - (carried?.x ?? 0);
    const y = shift.y - (carried?.y ?? 0);
    if (reduce || (Math.abs(x) < 1 && Math.abs(y) < 1)) continue;
    const animation = element.animate(
      [{ transform: `translate(${x}px, ${y}px)` }, { transform: "none" }],
      options,
    );
    if (idOf(element) !== id) continue;
    element.dataset.settling = "";
    const done = () => delete element.dataset.settling;
    animation.finished.then(done, done);
  }
};

export const startPageDrag = ({
  editor,
  id,
  follow,
  activator,
  onTarget,
}: {
  editor: PlateEditor;
  id: string;
  follow: boolean;
  activator: Event | null;
  onTarget: (target: DropTarget | null) => void;
}): PageDrag | null => {
  const root = editor.api.toDOMNode(editor);
  const active = root?.querySelector<HTMLElement>(`${BLOCK}[data-block-id="${CSS.escape(id)}"]`);
  if (!root || !active) return null;

  const start = active.getBoundingClientRect();
  const style = getComputedStyle(active);
  const following = active.nextElementSibling;
  const closing =
    Number.parseFloat(style.marginBottom) -
    Number.parseFloat(following ? getComputedStyle(following).marginTop : style.marginTop);
  let height = start.height;
  const nested = isColumns(blockEntry(editor, id)?.[0]);
  const smooth = !reducedMotion();
  const bases = new Map<HTMLElement, number>();
  let pointer = pointOf(activator);
  const grab = { x: pointer.x - start.left, y: pointer.y - start.top };
  const offset = { x: 0, y: 0 };
  let target: DropTarget | null = null;
  let anchor: Anchor | null = null;
  let frame = 0;

  const baseMargin = (element: HTMLElement): number => {
    let base = bases.get(element);
    if (base === undefined) {
      base = Number.parseFloat(getComputedStyle(element).marginTop) || 0;
      bases.set(element, base);
    }
    return base;
  };

  const columnAt = (point: Point): HTMLElement | null => {
    for (const column of root.querySelectorAll<HTMLElement>('[data-slot="column"]')) {
      const group = column.parentElement?.closest<HTMLElement>('[data-slot="columns"]');
      if (!group || active.contains(column)) continue;
      const box = column.getBoundingClientRect();
      const outer = group.getBoundingClientRect();
      const gaps = getComputedStyle(group);
      const x = (Number.parseFloat(gaps.columnGap) || 0) / 2;
      const y = (Number.parseFloat(gaps.rowGap) || 0) / 2;
      const stacked = box.width > outer.width * 0.75;
      const area = stacked ? box : new DOMRect(box.x, outer.y, box.width, outer.height);
      if (within(area, point, x, stacked ? y : 0)) return column;
    }
    return null;
  };

  const fromOutline = (row: HTMLElement, point: Point): DropTarget | null => {
    const rowId = row.dataset.outlineId;
    if (!rowId) return null;
    const box = (row.firstElementChild ?? row).getBoundingClientRect();
    const position: DropPosition =
      blockEntry(editor, rowId)?.[0].type === "column"
        ? "inside"
        : point.y < box.top + box.height / 2
          ? "before"
          : "after";
    return { id: rowId, position };
  };

  const fromPage = (point: Point): DropTarget | null => {
    if (!within(root.getBoundingClientRect(), point, PAGE_SLACK.x, PAGE_SLACK.y)) return null;
    const container = (!nested && columnAt(point)) || root;
    const items = blocksIn(container).filter((element) => element !== active);
    const next = items.find((element) => {
      const box = element.getBoundingClientRect();
      return point.y < box.top + box.height / 2;
    });
    if (next) return { id: idOf(next), position: "before" };
    const last = items[items.length - 1];
    return last ? { id: idOf(last), position: "after" } : null;
  };

  const locate = (point: Point): DropTarget | null => {
    const row = document
      .elementFromPoint(point.x, point.y)
      ?.closest<HTMLElement>("[data-outline-id]");
    const found = row ? fromOutline(row, point) : fromPage(point);
    return found && canMoveBlock(editor, id, found.id, found.position) ? found : null;
  };

  const anchorOf = (found: DropTarget | null): Anchor | null => {
    if (!found) return null;
    let element: HTMLElement | null | undefined;
    let side: Anchor["side"] = found.position === "before" ? "before" : "after";
    if (found.position === "inside") {
      const node = blockEntry(editor, found.id)?.[0] as TElement | undefined;
      const column = node ? editor.api.toDOMNode(node) : undefined;
      const rest = column ? blocksIn(column).filter((block) => block !== active) : [];
      element = rest[rest.length - 1];
    } else {
      element = root.querySelector<HTMLElement>(
        `${BLOCK}[data-block-id="${CSS.escape(found.id)}"]`,
      );
    }
    if (!element) return null;
    if (side === "after") {
      const after = blocksIn(element.parentElement ?? root).filter((block) => block !== active);
      const next = after[after.indexOf(element) + 1];
      if (next) {
        element = next;
        side = "before";
      }
    }
    const base = baseMargin(element);
    const first = element.parentElement?.firstElementChild === element;
    return { element, side, gap: first || base <= 0 ? GAP : base };
  };

  const place = (next: Anchor | null): void => {
    if (anchor?.element === next?.element && anchor?.side === next?.side) return;
    if (anchor) {
      anchor.element.style.marginTop = "";
      anchor.element.style.marginBottom = "";
    }
    anchor = next;
    const width = next?.element.offsetWidth ?? start.width;
    active.style.width = Math.abs(width - start.width) > 1 ? `${width}px` : "";
    height = active.offsetHeight;
    if (next?.side === "before") {
      next.element.style.marginTop = `${baseMargin(next.element) + height + next.gap}px`;
    } else if (next) {
      next.element.style.marginBottom = `${height + next.gap}px`;
    }
    active.style.marginBottom = next ? `${closing - height}px` : "";
  };

  const slot = (layout: Point): Point => {
    if (!anchor) return layout;
    const near = anchor.element.getBoundingClientRect();
    const y = anchor.side === "before" ? near.top - height - anchor.gap : near.bottom + anchor.gap;
    return { x: near.left, y };
  };

  const track = (): void => {
    const found = locate(pointer);
    if (!sameTarget(found, target)) {
      target = found;
      onTarget(found);
      place(anchorOf(found));
    }
    const box = active.getBoundingClientRect();
    const layout = { x: box.left - offset.x, y: box.top - offset.y };
    if (follow) {
      offset.x = pointer.x - grab.x - layout.x;
      offset.y = pointer.y - grab.y - layout.y;
    } else {
      const to = slot(layout);
      const ease = smooth ? EASE : 1;
      offset.x += (to.x - layout.x - offset.x) * ease;
      offset.y += (to.y - layout.y - offset.y) * ease;
    }
    active.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
    frame = requestAnimationFrame(track);
  };

  const move = (event: PointerEvent): void => {
    pointer = { x: event.clientX, y: event.clientY };
  };

  root.dataset.blockDrag = "";
  active.dataset.dragging = "";
  window.addEventListener("pointermove", move, { capture: true, passive: true });
  frame = requestAnimationFrame(track);

  return {
    finish: (commit) => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move, { capture: true });
      const before = new Map(
        [...root.querySelectorAll<HTMLElement>("[data-block-id]")].map((element) => [
          idOf(element),
          element.getBoundingClientRect(),
        ]),
      );
      delete root.dataset.blockDrag;
      delete active.dataset.dragging;
      place(null);
      active.style.transform = "";
      if (commit && target) {
        const { id: to, position } = target;
        flushSync(() => moveBlock(editor, id, to, position));
      }
      onTarget(null);
      settle(root, before, id);
    },
  };
};
