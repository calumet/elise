import { unwrapLink, upsertLink } from "@platejs/link";
import { someList } from "@platejs/list";
import {
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTableColumn,
  insertTableRow,
} from "@platejs/table";
import { useEditorRef, useEditorSelector } from "platejs/react";

import { newId } from "../ids";
import { useLabels } from "../labels";
import type { EditorMark } from "../types";
import { parseVideo, safeHref } from "../urls";
import { useServices } from "./context";
import {
  buildButton,
  buildCallout,
  buildColumns,
  buildDivider,
  buildGallery,
  buildSpacer,
  buildTable,
  placeBlock,
  retype,
  setList,
  useInsertItems,
  type InsertItem,
  type InsertItemId,
} from "./items";
import { templateDefs, useTemplates, type TemplateId, type TemplateItem } from "./templates";
import { buildText } from "./text";

export type EditorCommands = {
  items: InsertItem[];
  templates: TemplateItem[];
  toggleMark: (mark: EditorMark) => void;
  toggleList: (style: "disc" | "decimal") => void;
  toggleBlock: (type: "h2" | "h3" | "blockquote") => void;
  setLink: (url: string, text?: string, newTab?: boolean) => boolean;
  removeLink: () => void;
  insert: (id: InsertItemId, options?: { replace?: boolean }) => void;
  insertImage: (source: File | { src: string; alt?: string }, alt?: string) => Promise<void>;
  insertVideo: (url: string) => boolean;
  insertFile: (source: File | { src: string; name: string; size?: number }) => Promise<void>;
  uploadImage: (file: File) => Promise<{ src: string; alt?: string }>;
  insertTemplate: (id: TemplateId) => boolean;
  addRow: () => void;
  addColumn: () => void;
  deleteRow: () => void;
  deleteColumn: () => void;
  deleteTable: () => void;
  undo: () => void;
  redo: () => void;
  focus: () => void;
};

export const useEditorCommands = (): EditorCommands => {
  const editor = useEditorRef();
  const { schema, onUploadImage, onUploadFile } = useServices();
  const t = useLabels();
  const items = useInsertItems(schema);
  const templates = useTemplates(schema);

  const toggleBlock: EditorCommands["toggleBlock"] = (type) => {
    const at = editor.api.block()?.[1];
    editor.tf.toggleBlock(type);
    const start = at ? editor.api.start(at) : undefined;
    if (start) editor.tf.select(start);
    editor.tf.focus();
  };

  const insert: EditorCommands["insert"] = (id, options) => {
    const replace = options?.replace ?? false;
    if (id === "h2" || id === "h3") retype(editor, id);
    else if (id === "quote") toggleBlock("blockquote");
    else if (id === "bulleted") setList(editor, "disc");
    else if (id === "numbered") setList(editor, "decimal");
    else if (id === "table") placeBlock(editor, buildTable(), replace);
    else if (id === "callout") placeBlock(editor, buildCallout(), replace);
    else if (id === "divider") placeBlock(editor, buildDivider(), replace);
    else if (id === "columns") placeBlock(editor, buildColumns(), replace);
    else if (id === "spacer") placeBlock(editor, buildSpacer(), replace);
    else if (id === "button") placeBlock(editor, buildButton(t.buttonBlock), replace);
    else if (id === "gallery") placeBlock(editor, buildGallery(), replace);
    else if (id === "text") placeBlock(editor, buildText(), replace);
  };

  const uploadImage: EditorCommands["uploadImage"] = (file) =>
    (onUploadImage ?? (() => Promise.reject(new Error("onUploadImage is required"))))(file);

  return {
    items,
    templates,
    toggleMark: (mark) => {
      if (!schema.marks.includes(mark)) return;
      editor.tf.toggleMark(mark);
      editor.tf.focus();
    },
    toggleList: (style) => setList(editor, style),
    toggleBlock,
    setLink: (url, text, newTab) => {
      const safe = safeHref(url);
      if (!safe || !schema.links) return false;
      editor.tf.focus();
      upsertLink(editor, { url: safe, text, target: newTab ? "_blank" : undefined });
      return true;
    },
    removeLink: () => {
      editor.tf.focus();
      unwrapLink(editor);
    },
    insert,
    uploadImage,
    insertImage: async (source, alt) => {
      const uploaded = source instanceof File ? await uploadImage(source) : source;
      placeBlock(
        editor,
        {
          id: newId(),
          type: "img",
          url: uploaded.src,
          alt: alt ?? uploaded.alt ?? "",
          children: [{ text: "" }],
        },
        true,
      );
    },
    insertVideo: (url) => {
      if (!parseVideo(url)) return false;
      placeBlock(
        editor,
        { id: newId(), type: "media_embed", url: url.trim(), children: [{ text: "" }] },
        true,
      );
      return true;
    },
    insertFile: async (source) => {
      const uploaded =
        source instanceof File
          ? await (onUploadFile ?? (() => Promise.reject(new Error("onUploadFile is required"))))(
              source,
            )
          : source;
      placeBlock(
        editor,
        {
          id: newId(),
          type: "file",
          src: uploaded.src,
          name: uploaded.name,
          ...(uploaded.size ? { size: uploaded.size } : {}),
          children: [{ text: "" }],
        },
        true,
      );
    },
    insertTemplate: (id) => {
      const def = templateDefs.find((candidate) => candidate.id === id);
      if (!def || !templates.some((item) => item.id === id)) return false;
      placeBlock(editor, def.build(t), true);
      return true;
    },
    addRow: () => insertTableRow(editor),
    addColumn: () => insertTableColumn(editor),
    deleteRow: () => deleteRow(editor),
    deleteColumn: () => deleteColumn(editor),
    deleteTable: () => deleteTable(editor),
    undo: () => editor.undo(),
    redo: () => editor.redo(),
    focus: () => editor.tf.focus(),
  };
};

export const useMarkActive = (mark: EditorMark): boolean =>
  useEditorSelector((ed) => Boolean(ed.selection && ed.api.hasMark(mark)), [mark]);

export const useBlockActive = (type: string): boolean =>
  useEditorSelector((ed) => Boolean(ed.selection && ed.api.some({ match: { type } })), [type]);

export const useListActive = (style: "disc" | "decimal"): boolean =>
  useEditorSelector((ed) => Boolean(ed.selection && someList(ed, style)), [style]);

export const useInTable = (): boolean => useBlockActive("table");

export const useLinkUrl = (): string | null =>
  useEditorSelector((ed) => {
    const link = ed.selection ? ed.api.above({ match: { type: "a" } }) : undefined;
    return link ? String((link[0] as { url?: string }).url ?? "") : null;
  }, []);
