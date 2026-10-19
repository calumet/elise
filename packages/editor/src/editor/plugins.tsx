import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  H2Plugin,
  H3Plugin,
  HorizontalRulePlugin,
  ItalicPlugin,
} from "@platejs/basic-nodes/react";
import { DndPlugin } from "@platejs/dnd";
import { IndentPlugin } from "@platejs/indent/react";
import { LinkPlugin } from "@platejs/link/react";
import { ListPlugin } from "@platejs/list/react";
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@platejs/table/react";
import {
  ElementApi,
  ExitBreakPlugin,
  KEYS,
  NodeApi,
  NodeIdPlugin,
  TextApi,
  TrailingBlockPlugin,
  type AnyPluginConfig,
  type Descendant,
} from "platejs";
import { createPlatePlugin, type PlateEditor } from "platejs/react";

import { newId } from "../ids";
import { fromHtml } from "../render/from-html";
import { isAllowedType } from "../settings";
import type { EditorMark, EditorSchema } from "../types";
import { draggable } from "./drag";
import { BlockSelectionPlugin } from "./selection";
import { isColumns, lastIndex, normalizeColumnNode } from "./structure";
import { normalizeTableNode } from "./table";

const STRUCTURAL = new Set(["a"]);

const atColumnEdge = (editor: PlateEditor, edge: "start" | "end"): boolean => {
  const { selection } = editor;
  if (!selection || !editor.api.isCollapsed()) return false;
  const entry = editor.api.block();
  if (!entry) return false;
  const [node, path] = entry;
  const there =
    edge === "start"
      ? editor.api.isStart(selection.anchor, path)
      : editor.api.isEnd(selection.anchor, path);
  if (!there) return false;
  const parent = editor.api.parent(path);
  if (parent?.[0].type === "column") {
    return lastIndex(path) === (edge === "start" ? 0 : parent[0].children.length - 1);
  }
  const index = lastIndex(path);
  const neighbour = editor.children[edge === "start" ? index - 1 : index + 1];
  return (
    path.length === 1 && isColumns(neighbour) && (edge === "end" || NodeApi.string(node) !== "")
  );
};
const EXITABLE = new Set(["blockquote", "callout"]);
const MARKS: EditorMark[] = ["bold", "italic", "code"];

const schemaPlugin = (schema: EditorSchema) =>
  createPlatePlugin({
    key: "schema",
    parser: {
      format: "text/html",
      deserialize: ({ data }) => fromHtml(data, { schema }).content as unknown as Descendant[],
    },
    handlers: {
      onKeyDown: ({ editor, event }) => {
        if (event.key !== "Enter") return false;
        if (event.shiftKey) {
          event.preventDefault();
          editor.tf.insertText("\n");
          return true;
        }
        if (event.metaKey || event.ctrlKey || event.altKey) return false;
        const entry = editor.api.block();
        const parent = entry && editor.api.parent(entry[1]);
        if (
          entry &&
          parent &&
          entry[0].type === KEYS.p &&
          !entry[0].listStyleType &&
          NodeApi.string(entry[0]) === "" &&
          EXITABLE.has(String(parent[0].type))
        ) {
          event.preventDefault();
          editor.tf.liftNodes({ at: entry[1] });
          return true;
        }
        return false;
      },
    },
  }).overrideEditor(({ editor, tf: { normalizeNode, deleteBackward, deleteForward } }) => ({
    transforms: {
      deleteBackward(unit) {
        if (!atColumnEdge(editor, "start")) deleteBackward(unit);
      },
      deleteForward(unit) {
        if (!atColumnEdge(editor, "end")) deleteForward(unit);
      },
      normalizeNode([node, path]) {
        if (normalizeColumnNode(editor, [node, path])) return;
        if (normalizeTableNode(editor, [node, path])) return;
        if (ElementApi.isElement(node) && node.type) {
          const type = String(node.type);
          if (!isAllowedType(schema, type) && !STRUCTURAL.has(type)) {
            if (editor.api.isInline(node)) editor.tf.unwrapNodes({ at: path });
            else editor.tf.setNodes({ type: KEYS.p }, { at: path });
            return;
          }
          if (type === "a" && !schema.links) {
            editor.tf.unwrapNodes({ at: path });
            return;
          }
          if (node.listStyleType && !schema.blocks.includes("list")) {
            editor.tf.unsetNodes(["listStyleType", "indent"], { at: path });
            return;
          }
        }
        if (TextApi.isText(node)) {
          const stray = MARKS.find((mark) => node[mark] && !schema.marks.includes(mark));
          if (stray) {
            editor.tf.unsetNodes(stray, { at: path });
            return;
          }
        }
        normalizeNode([node, path]);
      },
    },
  }));

const blockPlugin = (key: string, isVoid = false) =>
  createPlatePlugin({ key, node: { isElement: true, isVoid } });

export const buildPlugins = (schema: EditorSchema): AnyPluginConfig[] => {
  const has = (type: string) => schema.blocks.includes(type);
  const plugins: AnyPluginConfig[] = [
    NodeIdPlugin.configure({ options: { idCreator: newId } }),
    schemaPlugin(schema),
    TrailingBlockPlugin,
  ];

  if (schema.marks.includes("bold")) plugins.push(BoldPlugin);
  if (schema.marks.includes("italic")) plugins.push(ItalicPlugin);
  if (schema.marks.includes("code")) plugins.push(CodePlugin);
  if (schema.links) {
    plugins.push(
      LinkPlugin.configure({ options: { allowedSchemes: ["http", "https", "mailto", "tel"] } }),
    );
  }
  if (has("list")) {
    plugins.push(
      IndentPlugin.configure({ inject: { targetPlugins: [KEYS.p] } }),
      ListPlugin.configure({ inject: { targetPlugins: [KEYS.p] } }),
    );
  }
  if (has("h2")) plugins.push(H2Plugin);
  if (has("h3")) plugins.push(H3Plugin);
  if (has("blockquote")) plugins.push(BlockquotePlugin);
  if (has("hr")) plugins.push(HorizontalRulePlugin);
  if (has("img")) plugins.push(blockPlugin("img", true));
  if (has("media_embed")) plugins.push(blockPlugin("media_embed", true));
  if (has("callout")) plugins.push(blockPlugin("callout"));
  if (has("callout") || has("blockquote")) {
    plugins.push(
      ExitBreakPlugin.configure({
        shortcuts: { insert: { keys: "mod+enter" }, insertBefore: { keys: "mod+shift+enter" } },
      }),
    );
  }
  if (has("table")) {
    plugins.push(TablePlugin, TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin);
  }
  for (const type of ["spacer", "button", "gallery", "file"]) {
    if (has(type)) plugins.push(blockPlugin(type, true));
  }
  if (has("columns")) {
    plugins.push(
      blockPlugin("columns"),
      blockPlugin("column"),
      DndPlugin.configure({ render: { aboveNodes: draggable } }),
    );
  }
  plugins.push(BlockSelectionPlugin);
  return plugins;
};
