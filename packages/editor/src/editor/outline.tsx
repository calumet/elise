import {
  SortableTree,
  type SortableTreeMove,
  type SortableTreeNode,
} from "@calumet/elise-blocks/sortable-tree";
import { Text } from "@calumet/elise-ui/text";
import { useEditorRef } from "platejs/react";
import * as React from "react";

import { useLabels } from "../labels";
import { useBlockCommands, useOutline, useSelectedBlock, type OutlineNode } from "./blocks";
import { blockIcon } from "./icons";
import { blockEntry, type DropPosition } from "./structure";

type OutlineItem = SortableTreeNode & { id: string; type: string; children: OutlineItem[] };

const MAX_DEPTH = 3;

const TREE =
  "[&_[data-slot=sortable-tree-item]>div:has([aria-current=true])]:bg-accent [&_[data-slot=sortable-tree-item]>div:has([aria-current=true])]:text-accent-foreground";

const toItems = (nodes: OutlineNode[]): OutlineItem[] =>
  nodes.map((node) => ({
    id: node.id,
    label: node.label,
    type: node.type,
    children: toItems(node.children),
    draggable: node.type !== "column",
    acceptsChildren: node.type === "column",
  }));

const findItem = (items: OutlineItem[], id: string): OutlineItem | undefined => {
  for (const item of items) {
    if (item.id === id) return item;
    const inner = findItem(item.children, id);
    if (inner) return inner;
  }
  return undefined;
};

const destination = (
  { parentId, index }: SortableTreeMove,
  items: OutlineItem[],
): { id: string; position: DropPosition } | null => {
  const siblings = parentId == null ? items : (findItem(items, String(parentId))?.children ?? []);
  const before = siblings[index - 1];
  const after = siblings[index + 1];
  if (before) return { id: before.id, position: "after" };
  if (after) return { id: after.id, position: "before" };
  return parentId == null ? null : { id: String(parentId), position: "inside" };
};

export type EditorOutlineProps = { className?: string };

export const EditorOutline = ({ className }: EditorOutlineProps): React.JSX.Element => {
  const t = useLabels();
  const editor = useEditorRef();
  const outline = useOutline();
  const selected = useSelectedBlock()?.id;
  const blocks = useBlockCommands();
  const headingId = React.useId();
  const items = React.useMemo(() => toItems(outline), [outline]);

  const select = (id: string) => {
    if (!blocks.select(id)) return;
    const entry = blockEntry(editor, id);
    const element = entry ? editor.api.toDOMNode(entry[0]) : undefined;
    element?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const move = (change: SortableTreeMove, next: OutlineItem[]) => {
    const target = destination(change, next);
    if (target) blocks.moveTo(String(change.id), target.id, target.position);
  };

  return (
    <div
      data-slot="editor-outline"
      className={`flex min-h-0 flex-col gap-2 ${className ?? ""}`.trim()}
    >
      <Text
        as="h2"
        id={headingId}
        data-slot="editor-panel-heading"
        size="xs"
        weight="medium"
        tone="muted"
        className="px-2"
      >
        {t.outline}
      </Text>
      <SortableTree
        aria-labelledby={headingId}
        items={items}
        maxDepth={MAX_DEPTH}
        onMove={move}
        className={TREE}
        renderItem={(node) => {
          const Icon = blockIcon(node.type);
          return (
            <button
              type="button"
              aria-current={node.id === selected || undefined}
              title={node.label}
              onClick={() => select(node.id)}
              className="flex w-full min-w-0 items-center gap-1.5 rounded-xs text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Icon aria-hidden="true" className="size-icon-md shrink-0 text-muted-foreground" />
              <span className="truncate">{node.label}</span>
            </button>
          );
        }}
      />
      <Text size="xs" tone="muted" className="mt-auto px-2 pt-2">
        {t.outlineHint}
      </Text>
    </div>
  );
};
