import { Text } from "@calumet/elise-ui/text";
import { Tree, TreeItem } from "@calumet/elise-ui/tree";
import { useEditorRef } from "platejs/react";
import * as React from "react";

import { useLabels } from "../labels";
import { useBlockCommands, useOutline, useSelectedBlock, type OutlineNode } from "./blocks";
import { useOutlineDnd } from "./drag";
import { blockIcon } from "./icons";
import { blockEntry } from "./structure";

const ROW =
  "relative data-dragging:opacity-40 before:pointer-events-none before:absolute before:inset-x-1 before:z-sticky before:hidden before:h-0.5 before:rounded-full before:bg-primary data-[drop=after]:before:-bottom-px data-[drop=after]:before:block data-[drop=before]:before:-top-px data-[drop=before]:before:block [&[data-drop=inside]>span:first-child]:bg-accent [&[data-drop=inside]>span:first-child]:ring-2 [&[data-drop=inside]>span:first-child]:ring-primary";

const OutlineRow = ({ node }: { id: string; node: OutlineNode }): React.JSX.Element => {
  const { ref, isDragging, position } = useOutlineDnd(node.id);
  const Icon = blockIcon(node.type);
  return (
    <TreeItem
      ref={ref}
      id={node.id}
      label={<span title={node.label}>{node.label}</span>}
      icon={<Icon className="size-icon-md text-muted-foreground" />}
      data-drop={position ?? undefined}
      data-dragging={isDragging || undefined}
      className={ROW}
    >
      {node.children.map((child) => (
        <OutlineRow key={child.id} id={child.id} node={child} />
      ))}
    </TreeItem>
  );
};

const branchIds = (nodes: OutlineNode[]): string[] =>
  nodes.flatMap((node) =>
    node.children.length ? [node.id, ...branchIds(node.children)] : branchIds(node.children),
  );

export type EditorOutlineProps = { className?: string };

export const EditorOutline = ({ className }: EditorOutlineProps): React.JSX.Element => {
  const t = useLabels();
  const editor = useEditorRef();
  const outline = useOutline();
  const selected = useSelectedBlock()?.id;
  const blocks = useBlockCommands();
  const headingId = React.useId();
  const [collapsed, setCollapsed] = React.useState<ReadonlySet<string>>(new Set());
  const picked = React.useRef<string | null>(null);
  const branches = branchIds(outline);
  const expanded = branches.filter((id) => !collapsed.has(id));

  const select = (id: string) => {
    picked.current = id === selected ? null : id;
    if (!blocks.select(id)) return;
    const entry = blockEntry(editor, id);
    const element = entry ? editor.api.toDOMNode(entry[0]) : undefined;
    element?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const toggle = (next: string[]) => {
    const open = new Set(next);
    const changed = branches.find((id) => collapsed.has(id) === open.has(id));
    const skip = changed !== undefined && changed === picked.current;
    picked.current = null;
    if (!skip) setCollapsed(new Set(branches.filter((id) => !open.has(id))));
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
      <Tree
        aria-labelledby={headingId}
        value={selected ?? ""}
        onValueChange={select}
        expanded={expanded}
        onExpandedChange={toggle}
      >
        {outline.map((node) => (
          <OutlineRow key={node.id} id={node.id} node={node} />
        ))}
      </Tree>
      <Text size="xs" tone="muted" className="mt-auto px-2 pt-2">
        {t.outlineHint}
      </Text>
    </div>
  );
};
