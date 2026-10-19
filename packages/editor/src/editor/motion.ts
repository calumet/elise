import type { PlateEditor } from "platejs/react";

import { selectedId } from "./selection";

const afterPaint = (run: () => void): void => {
  requestAnimationFrame(() => requestAnimationFrame(run));
};

export const reducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const motionOptions = (element: Element): KeyframeAnimationOptions => {
  const style = getComputedStyle(element);
  return {
    duration: Number.parseFloat(style.getPropertyValue("--duration-base")) || 200,
    easing: style.getPropertyValue("--ease-out").trim() || "ease-out",
  };
};

export const revealSelected = (editor: PlateEditor): void => {
  const id = selectedId(editor);
  if (!id) return;
  afterPaint(() => {
    const block = editor.api
      .toDOMNode(editor)
      ?.querySelector<HTMLElement>(`[data-block-id="${CSS.escape(id)}"]`);
    if (!block) return;
    const reduce = reducedMotion();
    block.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    block.animate(
      reduce
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: "translateY(0.5rem)" },
            { opacity: 1, transform: "none" },
          ],
      motionOptions(block),
    );
  });
};
