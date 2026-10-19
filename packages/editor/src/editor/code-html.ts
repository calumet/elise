import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { EditorContent } from "../render/content";
import type { EditorDocument, EditorSchema } from "../types";

const VOID = new Set(["br", "hr", "img"]);

const ESCAPES: Record<string, string> = { "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" };
const escape = (value: string): string => value.replace(/[&"<>]/g, (char) => ESCAPES[char] ?? char);

const openTag = (element: Element): string =>
  `<${element.localName}${Array.from(element.attributes)
    .map((attr) => (attr.value === "" ? ` ${attr.name}` : ` ${attr.name}="${escape(attr.value)}"`))
    .join("")}>`;

const holdsInline = (element: Element): boolean =>
  Array.from(element.childNodes).some((child) =>
    child.nodeType === Node.TEXT_NODE
      ? (child.textContent ?? "").trim() !== ""
      : child instanceof Element &&
        !child.matches(
          "div, p, h2, h3, blockquote, aside, figure, ul, ol, li, table, tbody, tr, td, th, hr, iframe",
        ),
  );

const pretty = (element: Element, depth: number): string[] => {
  const pad = "  ".repeat(depth);
  if (VOID.has(element.localName)) return [`${pad}${openTag(element)}`];
  if (holdsInline(element) || element.children.length === 0) {
    return [`${pad}${element.outerHTML}`];
  }
  return [
    `${pad}${openTag(element)}`,
    ...Array.from(element.children).flatMap((child) => pretty(child, depth + 1)),
    `${pad}</${element.localName}>`,
  ];
};

export const codeHtml = (doc: EditorDocument, schema: EditorSchema): string => {
  const markup = renderToStaticMarkup(React.createElement(EditorContent, { value: doc, schema }));
  const root = new DOMParser()
    .parseFromString(markup, "text/html")
    .querySelector("[data-slot=editor-content]");
  if (!root) return "";
  root
    .querySelectorAll("[data-slot=alert-icon], span:has(> svg:only-child), svg")
    .forEach((node) => node.remove());
  root.querySelectorAll("[class]").forEach((node) => node.removeAttribute("class"));
  return Array.from(root.children)
    .flatMap((child) => pretty(child, 0))
    .join("\n");
};

const KNOWN = new Set([
  "p",
  "div",
  "section",
  "article",
  "main",
  "header",
  "footer",
  "aside",
  "nav",
  "figure",
  "figcaption",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "ul",
  "ol",
  "li",
  "hr",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
  "iframe",
  "img",
  "a",
  "strong",
  "b",
  "em",
  "i",
  "code",
  "tt",
  "kbd",
  "br",
  "span",
]);

const ATTRIBUTES = new Set([
  "href",
  "src",
  "alt",
  "target",
  "rel",
  "scope",
  "lang",
  "download",
  "title",
  "loading",
  "allow",
  "referrerpolicy",
  "allowfullscreen",
  "aria-hidden",
]);

const NEEDS: Record<string, string> = {
  table: "table",
  img: "img",
  iframe: "media_embed",
  hr: "hr",
  blockquote: "blockquote",
  ul: "list",
  ol: "list",
};

const MARKS: Record<string, string> = {
  strong: "bold",
  b: "bold",
  em: "italic",
  i: "italic",
  code: "code",
  tt: "code",
  kbd: "code",
};

export type DroppedItem = { kind: "element" | "attribute"; name: string; line: number; at: number };

const TAG = /<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ATTRIBUTE = /([^\s=/"']+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/g;

export const droppedIn = (source: string, schema: EditorSchema): DroppedItem[] => {
  const blocks = new Set(schema.blocks);
  const supported = (tag: string): boolean =>
    KNOWN.has(tag) &&
    (!NEEDS[tag] || blocks.has(NEEDS[tag])) &&
    (!MARKS[tag] || schema.marks.includes(MARKS[tag] as never)) &&
    (tag !== "a" || schema.links);
  const dropped: DroppedItem[] = [];
  for (const match of source.matchAll(TAG)) {
    const line = source.slice(0, match.index).split("\n").length;
    const tag = (match[1] ?? "").toLowerCase();
    if (!supported(tag)) dropped.push({ kind: "element", name: tag, line, at: match.index });
    for (const attr of (match[2] ?? "").matchAll(ATTRIBUTE)) {
      const name = (attr[1] ?? "").toLowerCase();
      if (!name.startsWith("data-") && !ATTRIBUTES.has(name)) {
        dropped.push({
          kind: "attribute",
          name,
          line,
          at: match.index + (match[1]?.length ?? 0) + 1 + (attr.index ?? 0),
        });
      }
    }
  }
  return dropped;
};
