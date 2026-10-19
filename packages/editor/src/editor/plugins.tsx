import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  H2Plugin,
  H3Plugin,
  HorizontalRulePlugin,
  ItalicPlugin,
} from "@platejs/basic-nodes/react";
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
import { createPlatePlugin } from "platejs/react";

import { newId } from "../ids";
import { fromHtml } from "../render/from-html";
import type { EditorMark, EditorSchema } from "../types";

const STRUCTURAL = new Set(["tr", "td", "th", "a"]);
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
  }).overrideEditor(({ editor, tf: { normalizeNode } }) => ({
    transforms: {
      normalizeNode([node, path]) {
        if (ElementApi.isElement(node) && node.type) {
          const type = String(node.type);
          if (!schema.blocks.includes(type) && !STRUCTURAL.has(type)) {
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
  return plugins;
};
