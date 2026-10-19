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
  | "url";

type Base = { key: SettingKey };

export type SettingDef =
  | (Base & { kind: "select"; options: readonly string[]; default: string })
  | (Base & { kind: "toggle"; default: boolean })
  | (Base & { kind: "number"; min: number; max: number; default: number })
  | (Base & { kind: "text"; default: string })
  | (Base & { kind: "url"; default: string })
  | (Base & { kind: "video"; default: string })
  | (Base & { kind: "images"; default: GalleryImage[] });

export type SettingValue = string | number | boolean | GalleryImage[];
export type SettingValues = Record<string, SettingValue>;

const select = (key: keyof typeof OPTIONS, fallback: string, as: SettingKey = key): SettingDef => ({
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
    { key: "alt", kind: "text", default: "" },
    { key: "caption", kind: "text", default: "" },
  ],
  media_embed: [{ key: "url", kind: "video", default: "" }],
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
  }
};

export const resolveSettings = (node: EditorNode): SettingValues => {
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
