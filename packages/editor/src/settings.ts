import type { EditorNode, EditorSchema } from "./types";
import { parseVideo, safeHref, safeSrc } from "./urls";

export const COLUMN_LIMIT = 4;

export const OPTIONS = {
  ratio: ["equal", "wide-first", "wide-second"],
  gap: ["small", "medium", "large"],
  align: ["top", "center", "bottom"],
  background: ["none", "card", "featured"],
  size: ["small", "medium", "large"],
  variant: ["primary", "secondary"],
  tone: ["info", "success", "warning", "danger"],
  textAlign: ["left", "center", "right"],
} as const;

export type GalleryImage = { src: string; alt: string };

export type SettingKey =
  | "count"
  | "ratio"
  | "gap"
  | "align"
  | "background"
  | "stack"
  | "size"
  | "label"
  | "href"
  | "variant"
  | "images"
  | "name"
  | "tone"
  | "alt"
  | "caption"
  | "url"
  | "headerRow"
  | "headerColumn"
  | "columnAlign";

type Base = { key: SettingKey };

export type SettingDef =
  | (Base & { kind: "select"; options: readonly string[]; default: string })
  | (Base & { kind: "toggle"; default: boolean })
  | (Base & { kind: "number"; min: number; max: number; default: number })
  | (Base & { kind: "text"; default: string })
  | (Base & { kind: "url"; default: string })
  | (Base & { kind: "video"; default: string })
  | (Base & { kind: "images"; default: GalleryImage[] })
  | (Base & { kind: "image"; default: string })
  | (Base & { kind: "alignments"; options: readonly string[]; default: string[] });

export type SettingValue = string | number | boolean | GalleryImage[] | string[];
export type SettingValues = Record<string, SettingValue>;

const select = (
  key: Exclude<keyof typeof OPTIONS, "textAlign">,
  fallback: string,
  as: SettingKey = key,
): SettingDef => ({
  key: as,
  kind: "select",
  options: OPTIONS[key],
  default: fallback,
});

export const blockSettings: Record<string, readonly SettingDef[]> = {
  columns: [
    { key: "count", kind: "number", min: 1, max: COLUMN_LIMIT, default: 2 },
    select("ratio", "equal"),
    select("gap", "medium"),
    select("align", "top"),
    select("background", "none"),
    { key: "stack", kind: "toggle", default: true },
  ],
  spacer: [select("size", "medium")],
  button: [
    { key: "label", kind: "text", default: "" },
    { key: "href", kind: "url", default: "" },
    select("variant", "primary"),
  ],
  gallery: [{ key: "images", kind: "images", default: [] }],
  file: [{ key: "name", kind: "text", default: "" }],
  callout: [select("tone", "info")],
  img: [
    { key: "url", kind: "image", default: "" },
    { key: "alt", kind: "text", default: "" },
    { key: "caption", kind: "text", default: "" },
  ],
  media_embed: [{ key: "url", kind: "video", default: "" }],
  table: [
    { key: "headerRow", kind: "toggle", default: true },
    { key: "headerColumn", kind: "toggle", default: false },
    { key: "columnAlign", kind: "alignments", options: OPTIONS.textAlign, default: [] },
  ],
};

const childrenOf = (node: EditorNode): EditorNode[] =>
  node.children.filter((child): child is EditorNode => "type" in child);

export const tableWidth = (table: EditorNode): number =>
  Math.max(0, ...childrenOf(table).map((row) => childrenOf(row).length));

export const tableShape = (
  table: EditorNode,
): { headerRow: boolean; headerColumn: boolean; columnAlign: string[] } => {
  const firstRow = childrenOf(table)[0];
  const firstCells = firstRow ? childrenOf(firstRow) : [];
  const align = Array.isArray(table.columnAlign) ? (table.columnAlign as unknown[]) : [];
  return {
    headerRow:
      typeof table.headerRow === "boolean"
        ? table.headerRow
        : firstCells.length > 0 && firstCells.every((cell) => cell.type === "th"),
    headerColumn: table.headerColumn === true,
    columnAlign: Array.from({ length: tableWidth(table) }, (_, index) => {
      const value = align[index];
      return typeof value === "string" && OPTIONS.textAlign.includes(value as "left")
        ? value
        : "left";
    }),
  };
};

export const settingDefs = (type: string): readonly SettingDef[] => blockSettings[type] ?? [];

const isImage = (value: unknown): value is GalleryImage =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as GalleryImage).src === "string" &&
  safeSrc((value as GalleryImage).src) !== undefined;

export const coerceSetting = (def: SettingDef, value: unknown): SettingValue | undefined => {
  switch (def.kind) {
    case "select":
      return typeof value === "string" && def.options.includes(value) ? value : undefined;
    case "toggle":
      return typeof value === "boolean" ? value : undefined;
    case "number":
      return typeof value === "number" && Number.isInteger(value)
        ? Math.min(Math.max(value, def.min), def.max)
        : undefined;
    case "text":
      return typeof value === "string" ? value : undefined;
    case "url": {
      if (typeof value !== "string") return undefined;
      return value.trim() === "" ? "" : safeHref(value);
    }
    case "video":
      return typeof value === "string" && parseVideo(value) ? value.trim() : undefined;
    case "images":
      return Array.isArray(value) && value.every(isImage)
        ? value.map((image) => ({
            src: image.src,
            alt: typeof image.alt === "string" ? image.alt : "",
          }))
        : undefined;
    case "image":
      return typeof value === "string" ? safeSrc(value) : undefined;
    case "alignments": {
      const allowed = new Set(def.options);
      return Array.isArray(value) &&
        value.every((item) => typeof item === "string" && allowed.has(item))
        ? [...(value as string[])]
        : undefined;
    }
  }
};

export const resolveSettings = (node: EditorNode): SettingValues => {
  if (node.type === "table") return tableShape(node);
  const values: SettingValues = {};
  for (const def of settingDefs(node.type)) {
    values[def.key] =
      def.key === "count" && node.type === "columns"
        ? Math.min(Math.max(node.children.length, 1), COLUMN_LIMIT)
        : (coerceSetting(def, node[def.key]) ?? def.default);
  }
  return values;
};

export type ColumnsSettings = {
  count: number;
  ratio: (typeof OPTIONS.ratio)[number];
  gap: (typeof OPTIONS.gap)[number];
  align: (typeof OPTIONS.align)[number];
  background: (typeof OPTIONS.background)[number];
  stack: boolean;
};

export const columnsSettings = (node: EditorNode): ColumnsSettings =>
  resolveSettings(node) as unknown as ColumnsSettings;

const TABLE_PARTS = new Set(["tr", "td", "th"]);

export const isAllowedType = (schema: EditorSchema, type: string): boolean =>
  schema.blocks.includes(type) ||
  TABLE_PARTS.has(type) ||
  (type === "column" && schema.blocks.includes("columns"));
