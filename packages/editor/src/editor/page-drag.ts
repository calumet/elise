import type { TElement } from "platejs";
import type { PlateEditor } from "platejs/react";

import { motionOptions, reducedMotion } from "./motion";
import { blockEntry, canMoveBlock, isColumns, moveBlock, type DropPosition } from "./structure";

export type DropTarget = { id: string; position: DropPosition };

export type PageDrag = { finish: (commit: boolean) => void };

type Point = { x: number; y: number };
type Anchor = { element: HTMLElement; side: "before" | "after"; gap: number; height: number };
type Lane = {
  container: HTMLElement;
  area: DOMRect;
  items: HTMLElement[];
  mids: number[];
  slacks: number[];
};

const BLOCK = '[data-slot="block"]';
const PAGE_SLACK = { x: 64, y: 32 };
const GAP = 16;
const EASE = 0.25;
const INSET = 24;
const DEAD = 16;
const HYSTERESIS = 16;

const blocksIn = (container: Element): HTMLElement[] =>
  [...container.children].filter(
    (node): node is HTMLElement => node instanceof HTMLElement && node.matches(BLOCK),
  );

const idOf = (element: HTMLElement): string => element.dataset.blockId ?? "";

const within = (box: DOMRect, point: Point, slack: number): boolean =>
  point.x >= box.left - slack &&
  point.x <= box.right + slack &&
  point.y >= box.top - slack &&
  point.y <= box.bottom + slack;

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
    const resized = idOf(element) === id && Math.abs(from.width - now.width) > 1;
    if (reduce || (Math.abs(x) < 1 && Math.abs(y) < 1 && !resized)) continue;
    const animation = element.animate(
      resized
        ? [
            { transform: `translate(${x}px, ${y}px)`, width: `${from.width}px` },
            { transform: "none", width: `${now.width}px` },
          ]
        : [{ transform: `translate(${x}px, ${y}px)` }, { transform: "none" }],
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
  const collapse =
    Number.parseFloat(style.marginBottom) -
    start.height -
    Number.parseFloat(following ? getComputedStyle(following).marginTop : style.marginTop);
  const nested = isColumns(blockEntry(editor, id)?.[0]);
  const smooth = !reducedMotion();
  const bases = new Map<HTMLElement, number>();
  const heights = new Map<HTMLElement, number>();
  let pointer = pointOf(activator);
  const grab = { x: pointer.x - start.left, y: pointer.y - start.top };
  const offset = { x: 0, y: 0 };
  let target: DropTarget | null = null;
  let anchor: Anchor | null = null;
  let lane: Lane | null = null;
  let index = -1;
  let frame = 0;

  const heightAt = (container: HTMLElement, width: number): number => {
    let height = start.height;
    if (Math.abs(width - start.width) > 1) {
      active.style.width = `${width}px`;
      height = active.offsetHeight;
      active.style.width = "";
    }
    heights.set(container, height);
    return height;
  };

  const laneOf = (container: HTMLElement, area: DOMRect): Lane => {
    const items = blocksIn(container).filter((element) => element !== active);
    const boxes = items.map((element) => element.getBoundingClientRect());
    return {
      container,
      area,
      items,
      mids: boxes.map((box) => box.top + box.height / 2),
      slacks: boxes.map((box) => Math.min(HYSTERESIS, Math.max(0, box.height / 2 - 2))),
    };
  };

  const scrolled = (): Point => {
    const sum = { x: 0, y: 0 };
    for (let node = root.parentElement; node; node = node.parentElement) {
      sum.x += node.scrollLeft;
      sum.y += node.scrollTop;
    }
    return sum;
  };
  const origin = root.getBoundingClientRect();
  const scrollStart = scrolled();
  const areas = new Map<HTMLElement, DOMRect>();
  for (const column of nested ? [] : root.querySelectorAll<HTMLElement>('[data-slot="column"]')) {
    const group = column.parentElement?.closest<HTMLElement>('[data-slot="columns"]');
    if (!group || active.contains(column)) continue;
    const box = column.getBoundingClientRect();
    const outer = group.getBoundingClientRect();
    const gaps = getComputedStyle(group);
    const x = (Number.parseFloat(gaps.columnGap) || 0) / 2;
    const y = (Number.parseFloat(gaps.rowGap) || 0) / 2;
    const stacked = box.width > outer.width * 0.75;
    areas.set(
      column,
      stacked
        ? new DOMRect(outer.x, box.y - y, outer.width, box.height + y * 2)
        : new DOMRect(box.x - x, outer.y, box.width + x * 2, outer.height),
    );
    heightAt(column, box.width);
  }
  heightAt(root, origin.width);
  active.style.marginBottom = `${collapse}px`;
  const page = laneOf(
    root,
    new DOMRect(
      origin.x - PAGE_SLACK.x,
      origin.y - PAGE_SLACK.y,
      origin.width + PAGE_SLACK.x * 2,
      origin.height + PAGE_SLACK.y * 2,
    ),
  );
  const columns = [...areas].map(([column, area]) => laneOf(column, area));
  active.style.marginBottom = "";
  active.getBoundingClientRect();
  lane =
    [page, ...columns].find((candidate) => candidate.container === active.parentElement) ?? null;
  index = lane ? blocksIn(lane.container).indexOf(active) : -1;

  const baseMargin = (element: HTMLElement): number => {
    let base = bases.get(element);
    if (base === undefined) {
      base = Number.parseFloat(getComputedStyle(element).marginTop) || 0;
      bases.set(element, base);
    }
    return base;
  };

  const probe = (): Point & { top: number } => {
    const now = scrolled();
    const shift = { x: scrollStart.x - now.x, y: scrollStart.y - now.y };
    const x = follow ? pointer.x - grab.x + INSET : pointer.x;
    const top = (follow ? pointer.y - grab.y : pointer.y) - shift.y;
    return { x: x - shift.x, y: pointer.y - shift.y, top };
  };

  const laneAt = (point: Point): Lane | null => {
    if (lane && lane !== page && within(lane.area, point, DEAD)) return lane;
    const column = columns.find((candidate) => within(candidate.area, point, -DEAD));
    if (column) return column;
    return within(page.area, point, lane === page ? DEAD : 0) ? page : null;
  };

  const indexIn = (next: Lane, top: number): number => {
    const current = next === lane ? index : -1;
    return next.mids.filter((mid, at) => {
      const slack = current < 0 ? 0 : (next.slacks[at] ?? 0);
      return top > mid + (at >= current ? slack : -slack);
    }).length;
  };

  const fromOutline = (row: HTMLElement): DropTarget | null => {
    const rowId = row.dataset.outlineId;
    if (!rowId) return null;
    const box = (row.firstElementChild ?? row).getBoundingClientRect();
    const position: DropPosition =
      blockEntry(editor, rowId)?.[0].type === "column"
        ? "inside"
        : pointer.y < box.top + box.height / 2
          ? "before"
          : "after";
    return { id: rowId, position };
  };

  const fromPage = (): DropTarget | null => {
    const point = probe();
    const next = laneAt(point);
    index = next ? indexIn(next, point.top) : -1;
    lane = next;
    if (!next) return null;
    const before = next.items[index];
    if (before) return { id: idOf(before), position: "before" };
    const last = next.items[next.items.length - 1];
    return last ? { id: idOf(last), position: "after" } : null;
  };

  const locate = (): DropTarget | null => {
    const row = document
      .elementFromPoint(pointer.x, pointer.y)
      ?.closest<HTMLElement>("[data-outline-id]");
    const found = row ? fromOutline(row) : fromPage();
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
    const container = element?.parentElement;
    if (!element || !container) return null;
    if (side === "after") {
      const after = blocksIn(container).filter((block) => block !== active);
      const next = after[after.indexOf(element) + 1];
      if (next) {
        element = next;
        side = "before";
      }
    }
    const base = baseMargin(element);
    const first = container.firstElementChild === element;
    const height = heights.get(container) ?? heightAt(container, container.clientWidth);
    return { element, side, gap: first || base <= 0 ? GAP : base, height };
  };

  const place = (next: Anchor | null): void => {
    if (anchor?.element === next?.element && anchor?.side === next?.side) return;
    if (anchor) {
      anchor.element.style.marginTop = "";
      anchor.element.style.marginBottom = "";
    }
    anchor = next;
    if (next?.side === "before") {
      next.element.style.marginTop = `${baseMargin(next.element) + next.height + next.gap}px`;
    } else if (next) {
      next.element.style.marginBottom = `${next.height + next.gap}px`;
    }
    active.style.marginBottom = next ? `${collapse}px` : "";
  };

  const slot = (layout: Point): Point => {
    if (!anchor) return layout;
    const near = anchor.element.getBoundingClientRect();
    const y =
      anchor.side === "before" ? near.top - anchor.height - anchor.gap : near.bottom + anchor.gap;
    return { x: near.left, y };
  };

  const track = (): void => {
    const found = locate();
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
      onTarget(null);
      if (!commit || !target) {
        settle(root, before, id);
        return;
      }
      const observer = new MutationObserver(() => {
        observer.disconnect();
        settle(root, before, id);
      });
      observer.observe(root, { childList: true, subtree: true });
      if (!moveBlock(editor, id, target.id, target.position)) observer.disconnect();
    },
  };
};
