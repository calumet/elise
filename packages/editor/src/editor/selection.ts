import { NodeApi, PathApi, type PluginConfig } from "platejs";
import { createPlatePlugin, type PlateEditor, type PlatePlugin } from "platejs/react";

import { blockEntry, unitPath } from "./structure";

export const BlockSelectionPlugin: PlatePlugin<
  PluginConfig<"blockSelection", { id: string | null }>
> = createPlatePlugin({
  key: "blockSelection",
  options: { id: null as string | null },
  handlers: {
    onChange: ({ editor, getOption, setOption }) => {
      const id = getOption("id");
      if (id && selectedId(editor) !== id) setOption("id", null);
    },
  },
});

const inside = (editor: PlateEditor, id: string): boolean => {
  const entry = blockEntry(editor, id);
  const anchor = editor.selection?.anchor.path;
  return Boolean(
    entry && (!anchor || PathApi.isAncestor(entry[1], anchor) || PathApi.equals(entry[1], anchor)),
  );
};

export const selectedId = (editor: PlateEditor): string | null => {
  const explicit = editor.getOption(BlockSelectionPlugin, "id");
  if (explicit && inside(editor, explicit)) return explicit;
  const anchor = editor.selection?.anchor.path;
  if (!anchor) return null;
  const node = NodeApi.get(editor, unitPath(editor, anchor));
  return node && "id" in node ? String(node.id) : null;
};

export const selectBlockById = (editor: PlateEditor, id: string): boolean => {
  const entry = blockEntry(editor, id);
  if (!entry) return false;
  const start = editor.api.start(entry[1]);
  if (start) editor.tf.select(start);
  editor.setOption(BlockSelectionPlugin, "id", id);
  return true;
};
