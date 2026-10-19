import { isText } from "./types";
import type { EditorDocument, EditorInline, EditorNode, Translation } from "./types";

export type TranslationUnit = {
  key: string;
  type: string;
  trail: string[];
  base: Translation;
  text: string;
  formatted: boolean;
};

const ATTRIBUTES: Record<string, string[]> = {
  img: ["alt", "caption"],
  button: ["label"],
  file: ["name"],
};

const CONTAINERS = new Set(["columns", "callout", "blockquote", "table"]);
const CELLS = new Set(["td", "th"]);

export const isInlineHolder = (node: EditorNode): boolean =>
  node.children.every((child) => isText(child) || child.type === "a");

export const inlineText = (children: EditorInline[]): string =>
  children.map((child) => (isText(child) ? child.text : inlineText(child.children))).join("");

const formattedInline = (children: EditorInline[]): boolean =>
  children.some((child) =>
    isText(child) ? Boolean(child.bold || child.italic || child.code) : true,
  );

export const translationText = (value: Translation | undefined): string =>
  value === undefined ? "" : typeof value === "string" ? value : inlineText(value);

export const isTranslated = (value: Translation | undefined): boolean =>
  translationText(value).trim() !== "";

export const fingerprint = (text: string): string => {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33) ^ text.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
};

const elements = (node: EditorNode): EditorNode[] =>
  node.children.filter((child): child is EditorNode => !isText(child));

export const translationUnits = (content: EditorNode[]): TranslationUnit[] => {
  const units: TranslationUnit[] = [];
  const visit = (node: EditorNode, trail: string[], parent: string | null) => {
    for (const attr of ATTRIBUTES[node.type] ?? []) {
      const value = node[attr];
      if (typeof value === "string" && value.trim()) {
        units.push({
          key: `${node.id}#${attr}`,
          type: `${node.type}#${attr}`,
          trail,
          base: value,
          text: value,
          formatted: false,
        });
      }
    }
    if (isInlineHolder(node)) {
      const text = inlineText(node.children);
      if (!text.trim()) return;
      units.push({
        key: node.id,
        type: parent && CELLS.has(parent) ? parent : node.listStyleType ? "list" : node.type,
        trail,
        base: node.children,
        text,
        formatted: formattedInline(node.children),
      });
      return;
    }
    const next = CONTAINERS.has(node.type) ? [...trail, node.type] : trail;
    for (const child of elements(node)) visit(child, next, node.type);
  };
  for (const node of content) visit(node, [], null);
  return units;
};

const collectIds = (nodes: EditorNode[], into = new Set<string>()): Set<string> => {
  for (const node of nodes) {
    into.add(node.id);
    collectIds(elements(node), into);
  }
  return into;
};

type Tables = Record<string, Record<string, unknown>>;
const FIELDS = ["translations", "translatedFrom"] as const;

export type Graveyard = Map<
  string,
  { field: (typeof FIELDS)[number]; locale: string; key: string; value: unknown }
>;

export const reconcileTranslations = (
  doc: EditorDocument,
  content: EditorNode[],
  graveyard: Graveyard,
): EditorDocument => {
  if (!doc.translations && graveyard.size === 0) return { ...doc, content };
  const ids = collectIds(content);
  const next: EditorDocument = { ...doc, content };
  for (const field of FIELDS) {
    const tables = (doc[field] ?? {}) as Tables;
    let changed = false;
    const result: Tables = {};
    for (const [locale, table] of Object.entries(tables)) {
      const kept: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(table)) {
        if (ids.has(key.split("#")[0] ?? key)) kept[key] = value;
        else {
          graveyard.set(`${field}\n${locale}\n${key}`, { field, locale, key, value });
          changed = true;
        }
      }
      result[locale] = kept;
    }
    for (const [entry, { field: kind, locale, key, value }] of graveyard) {
      if (kind !== field || !ids.has(key.split("#")[0] ?? key)) continue;
      result[locale] = { ...result[locale], [key]: value };
      graveyard.delete(entry);
      changed = true;
    }
    if (changed) (next as Record<string, unknown>)[field] = result;
  }
  return next;
};
