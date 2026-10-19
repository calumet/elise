import { KEYS, NodeApi } from "platejs";
import { useEditorRef, useEditorSelector } from "platejs/react";
import * as React from "react";

import { useEditorCommands } from "./commands";
import type { InsertItem } from "./items";

const SLASH = /^\/(\S*)$/;
const DEFERRED = new Set(["image", "video", "file"]);

export type SlashMenuState = {
  id: string;
  optionId: (index: number) => string;
  open: boolean;
  query: string;
  matches: InsertItem[];
  active: number;
  setActive: (index: number) => void;
  pick: (index: number) => InsertItem | undefined;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export const useSlashMenu = (onPicked?: (item: InsertItem) => void): SlashMenuState => {
  const id = React.useId();
  const editor = useEditorRef();
  const commands = useEditorCommands();
  const state = useEditorSelector((ed) => {
    const entry = ed.selection && ed.api.isCollapsed() ? ed.api.block() : undefined;
    if (!entry || entry[1].length !== 1 || entry[0].type !== KEYS.p || entry[0].listStyleType) {
      return null;
    }
    const match = SLASH.exec(NodeApi.string(entry[0]));
    return match ? `${String(entry[0].id)}:${match[1]}` : null;
  }, []);
  const [dismissed, setDismissed] = React.useState<string | null>(null);
  const [cursor, setCursor] = React.useState<{ key: string | null; index: number }>({
    key: null,
    index: 0,
  });
  const active = cursor.key === state ? cursor.index : 0;
  const setActive = (index: number): void => setCursor({ key: state, index });

  const query = state?.slice(state.indexOf(":") + 1).toLowerCase() ?? "";
  const matches = commands.items.filter((item) =>
    `${item.label} ${item.keywords}`.toLowerCase().includes(query),
  );
  const open = state !== null && state !== dismissed && commands.items.length > 0;

  const pick = (index: number): InsertItem | undefined => {
    const item = matches[index];
    if (!item) return undefined;
    const entry = editor.api.block();
    if (entry) editor.tf.delete({ at: editor.api.range(entry[1]) });
    if (!DEFERRED.has(item.id)) commands.insert(item.id, { replace: true });
    onPicked?.(item);
    return item;
  };

  const onKeyDown = (event: React.KeyboardEvent): void => {
    if (!open) return;
    const size = Math.max(matches.length, 1);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive((active + (event.key === "ArrowDown" ? 1 : -1) + size) % size);
    } else if ((event.key === "Enter" || event.key === "Tab") && matches.length > 0) {
      event.preventDefault();
      pick(active);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setDismissed(state);
    }
  };

  const optionId = (index: number): string => `${id}-${matches[index]?.id ?? index}`;

  return { id, optionId, open, query, matches, active, setActive, pick, onKeyDown };
};
