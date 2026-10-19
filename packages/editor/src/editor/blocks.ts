import { ElementApi, NodeApi, type Descendant, type TElement } from "platejs";
import { useEditorRef, useEditorSelector } from "platejs/react";

import { typeLabel, useLabels, type Labels } from "../labels";
import {
  settingDefs,
  resolveSettings,
  type SettingDef,
  type SettingKey,
  type SettingValue,
} from "../settings";
import { deselectBlock, selectBlockById, selectedId, useSelectedId } from "./selection";
import {
  applySettings,
  blockEntry,
  canMoveBlock,
  duplicateBlock,
  lastIndex,
  isMovable,
  moveBlock,
  removeBlock,
  siblingTarget,
  type DropPosition,
} from "./structure";

export type OutlineNode = {
  id: string;
  type: string;
  label: string;
  depth: number;
  children: OutlineNode[];
};

export type BlockSettingField = {
  key: SettingKey;
  kind: SettingDef["kind"];
  label: string;
  value: SettingValue;
  default: SettingValue;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
};

export type SelectedBlock = {
  id: string;
  type: string;
  label: string;
  parentId: string | null;
  settings: BlockSettingField[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  movable: boolean;
};

export type BlockCommands = {
  select: (id: string) => boolean;
  selectParent: () => boolean;
  update: (id: string, patch: Record<string, SettingValue>) => boolean;
  duplicate: (id: string) => boolean;
  remove: (id: string) => boolean;
  move: (id: string, direction: "up" | "down") => boolean;
  moveTo: (id: string, targetId: string, position: DropPosition) => boolean;
  canMoveTo: (id: string, targetId: string, position: DropPosition) => boolean;
  deselect: () => void;
};

const MAX_LABEL = 48;

export const nodeLabel = (t: Labels, node: TElement, index: number): string => {
  const type = String(node.type);
  if (type === "column") return `${t.column} ${index + 1}`;
  const own =
    type === "button" || type === "file"
      ? String(node[type === "button" ? "label" : "name"] ?? "")
      : type === "img"
        ? String(node.alt ?? "")
        : ["p", "h2", "h3", "blockquote", "callout"].includes(type)
          ? NodeApi.string(node)
          : "";
  const text = own.replace(/\s+/g, " ").trim();
  if (!text) return typeLabel(t, type);
  return text.length > MAX_LABEL ? `${text.slice(0, MAX_LABEL - 1)}…` : text;
};

const OPTION_LABELS: Record<string, keyof Labels> = {
  equal: "optionEqual",
  "wide-first": "optionWideFirst",
  "wide-second": "optionWideSecond",
  small: "optionSmall",
  medium: "optionMedium",
  large: "optionLarge",
  top: "optionTop",
  center: "optionCenter",
  bottom: "optionBottom",
  none: "optionNone",
  card: "optionCard",
  featured: "optionFeatured",
  primary: "optionPrimary",
  secondary: "optionSecondary",
  info: "optionInfo",
  success: "optionSuccess",
  warning: "optionWarning",
  danger: "optionDanger",
};

const SETTING_LABELS: Record<SettingKey, keyof Labels> = {
  count: "settingCount",
  ratio: "settingRatio",
  gap: "settingGap",
  align: "settingAlign",
  background: "settingBackground",
  stack: "settingStack",
  size: "settingSize",
  label: "settingLabel",
  href: "settingHref",
  variant: "settingVariant",
  images: "settingImages",
  name: "settingName",
  tone: "settingTone",
  alt: "settingAlt",
  caption: "settingCaption",
  url: "settingUrl",
};

const outlineOf = (nodes: Descendant[], depth: number, t: Labels): OutlineNode[] =>
  nodes.flatMap((node, index) => {
    if (!ElementApi.isElement(node) || !node.id) return [];
    const nested = node.type === "columns" || node.type === "column";
    return [
      {
        id: String(node.id),
        type: String(node.type),
        label: nodeLabel(t, node, index),
        depth,
        children: nested ? outlineOf(node.children, depth + 1, t) : [],
      },
    ];
  });

export const useOutline = (): OutlineNode[] => {
  const t = useLabels();
  const children = useEditorSelector((editor) => editor.children, []);
  return outlineOf(children, 0, t);
};

export const useSelectedBlock = (): SelectedBlock | null => {
  const editor = useEditorRef();
  const t = useLabels();
  const id = useSelectedId();
  useEditorSelector((ed) => ed.children, []);
  const entry = id ? blockEntry(editor, id) : undefined;
  if (!id || !entry) return null;
  const [node, path] = entry;
  const type = String(node.type);
  const values = resolveSettings(node as never);
  const parent =
    path.length > 1 ? (editor.api.parent(path)?.[0] as TElement | undefined) : undefined;
  return {
    id,
    type,
    label: nodeLabel(t, node, lastIndex(path)),
    parentId: parent?.id ? String(parent.id) : null,
    movable: isMovable(node),
    canMoveUp: Boolean(siblingTarget(editor, id, "up")),
    canMoveDown: Boolean(siblingTarget(editor, id, "down")),
    settings: settingDefs(type).map((def) => ({
      key: def.key,
      kind: def.kind,
      label: t[SETTING_LABELS[def.key]],
      value: values[def.key] ?? def.default,
      default: def.default,
      ...(def.kind === "select"
        ? {
            options: def.options.map((value) => ({
              value,
              label: t[OPTION_LABELS[value] ?? "optionNone"],
            })),
          }
        : {}),
      ...(def.kind === "number" ? { min: def.min, max: def.max } : {}),
    })),
  };
};

export const useBlockCommands = (): BlockCommands => {
  const editor = useEditorRef();

  return {
    select: (id) => selectBlockById(editor, id),
    selectParent: () => {
      const id = selectedId(editor);
      const entry = id ? blockEntry(editor, id) : undefined;
      const parent =
        entry && entry[1].length > 1 ? editor.api.parent(entry[1].slice(0, -1)) : undefined;
      const columns = parent?.[0];
      return columns?.id ? selectBlockById(editor, String(columns.id)) : false;
    },
    update: (id, patch) => applySettings(editor, id, patch),
    duplicate: (id) => {
      const copy = duplicateBlock(editor, id);
      return copy ? selectBlockById(editor, copy) : false;
    },
    remove: (id) => removeBlock(editor, id),
    move: (id, direction) => {
      const target = siblingTarget(editor, id, direction);
      return target ? moveBlock(editor, id, target.id, target.position) : false;
    },
    moveTo: (id, targetId, position) => moveBlock(editor, id, targetId, position),
    canMoveTo: (id, targetId, position) => canMoveBlock(editor, id, targetId, position),
    deselect: () => deselectBlock(editor),
  };
};
