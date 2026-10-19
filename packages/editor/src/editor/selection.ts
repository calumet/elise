import { NodeApi, PathApi, PointApi, type PluginConfig, type Point } from "platejs";
import {
  createPlatePlugin,
  useEditorSelector,
  usePluginOption,
  type PlateEditor,
  type PlatePlugin,
} from "platejs/react";

import { blockEntry, unitPath } from "./structure";

const STRUCTURAL = new Set(["move_node", "set_node", "insert_node", "remove_node"]);

export const BlockSelectionPlugin: PlatePlugin<
  PluginConfig<"blockSelection", { id: string | null; at: Point | null }>
> = createPlatePlugin({
  key: "blockSelection",
  options: { id: null as string | null, at: null as Point | null },
  handlers: {
    onChange: ({ editor, getOption, setOption }) => {
      const id = getOption("id");
      if (!id) return;
      const anchor = editor.selection?.anchor ?? null;
      if (selectedId(editor) !== id) {
        setOption("id", null);
      } else if (editor.operations.some((op) => STRUCTURAL.has(op.type))) {
        setOption("at", anchor);
      } else {
        const at = getOption("at");
        if (anchor && at && !PointApi.equals(anchor, at)) setOption("id", null);
      }
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

export const useSelectedId = (): string | null => {
  const explicit = usePluginOption(BlockSelectionPlugin, "id");
  return useEditorSelector((editor) => selectedId(editor), [explicit]);
};

export const deselectBlock = (editor: PlateEditor): void => {
  editor.setOption(BlockSelectionPlugin, "id", null);
  editor.tf.deselect();
  editor.tf.blur();
};

export const selectBlockById = (editor: PlateEditor, id: string): boolean => {
  const entry = blockEntry(editor, id);
  if (!entry) return false;
  const start = editor.api.start(entry[1]);
  if (start) editor.tf.select(start);
  editor.setOption(BlockSelectionPlugin, "at", start ?? null);
  editor.setOption(BlockSelectionPlugin, "id", id);
  return true;
};
