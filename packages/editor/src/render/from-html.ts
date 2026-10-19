import { newId } from "../ids";
import { isText } from "../types";
import type {
  EditorDocument,
  EditorInline,
  EditorMark,
  EditorNode,
  EditorSchema,
  EditorText,
} from "../types";
import { parseVideo, safeHref, safeSrc } from "../urls";

export type FromHtmlOptions = { schema: EditorSchema; locale?: string };

const SKIPPED = new Set([
  "script",
  "style",
  "head",
  "template",
  "noscript",
  "meta",
  "link",
  "title",
]);
const BLOCKS = new Set([
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
  "iframe",
  "img",
]);
const MARK_TAGS: Record<string, EditorMark> = {
  strong: "bold",
  b: "bold",
  em: "italic",
  i: "italic",
  code: "code",
  tt: "code",
  kbd: "code",
};

type Marks = Partial<Record<EditorMark, true>>;

const tagOf = (node: Node): string => (node instanceof Element ? node.tagName.toLowerCase() : "");

const sameMarks = (a: EditorText, b: EditorText): boolean =>
  a.bold === b.bold && a.italic === b.italic && a.code === b.code;

const normalizeInline = (children: EditorInline[]): EditorInline[] => {
  const merged: EditorInline[] = [];
  for (const child of children) {
    const previous = merged[merged.length - 1];
    if (
      isText(child) &&
      previous &&
      isText(previous) &&
      (child.text === "" || sameMarks(previous, child))
    ) {
      previous.text += child.text;
      continue;
    }
    if (!isText(child) && previous && !isText(previous)) merged.push({ text: "" });
    merged.push(child);
  }
  if (!merged[0] || !isText(merged[0])) merged.unshift({ text: "" });
  if (!isText(merged[merged.length - 1] as EditorInline)) merged.push({ text: "" });
  return merged;
};

const blockOf = (
  type: string,
  children: EditorNode["children"],
  id: string | null | undefined,
  extra: Record<string, unknown> = {},
): EditorNode => ({ id: id || newId(), type, ...extra, children });

export const fromHtml = (html: string, { schema, locale }: FromHtmlOptions): EditorDocument => {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const root = parsed.querySelector("[data-slot=editor-content]") ?? parsed.body;
  const allows = (type: string) => schema.blocks.includes(type);

  const inline = (nodes: Iterable<Node>, marks: Marks): EditorInline[] => {
    const out: EditorInline[] = [];
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.textContent ?? "").replace(/[ \t\r\n]+/g, " ");
        if (text) out.push({ text, ...marks });
        continue;
      }
      const tag = tagOf(node);
      if (!tag || SKIPPED.has(tag)) continue;
      if (tag === "br") {
        out.push({ text: "\n", ...marks });
        continue;
      }
      const element = node as Element;
      const mark = MARK_TAGS[tag];
      const next: Marks = mark && schema.marks.includes(mark) ? { ...marks, [mark]: true } : marks;
      const href = tag === "a" && schema.links ? safeHref(element.getAttribute("href")) : undefined;
      const children = inline(element.childNodes, next);
      out.push(
        ...(href ? [blockOf("a", normalizeInline(children), null, { url: href })] : children),
      );
    }
    return out;
  };

  const paragraph = (nodes: Iterable<Node>, id?: string | null, extra?: Record<string, unknown>) =>
    blockOf("p", normalizeInline(inline(nodes, {})), id, extra);

  const lists = (list: Element, depth: number): EditorNode[] => {
    const kind = tagOf(list) === "ol" ? "decimal" : "disc";
    const out: EditorNode[] = [];
    for (const item of Array.from(list.children).filter((child) => tagOf(child) === "li")) {
      const own = Array.from(item.childNodes).filter(
        (child) => !["ul", "ol"].includes(tagOf(child)),
      );
      out.push(
        allows("list")
          ? paragraph(own, item.getAttribute("data-id"), { listStyleType: kind, indent: depth })
          : paragraph(own, item.getAttribute("data-id")),
      );
      for (const nested of Array.from(item.children).filter((child) =>
        ["ul", "ol"].includes(tagOf(child)),
      )) {
        out.push(...lists(nested, depth + 1));
      }
    }
    return out;
  };

  const media = (element: Element, id: string | null): EditorNode[] => {
    const img = element.matches("img") ? element : element.querySelector("img");
    const frame = element.matches("iframe") ? element : element.querySelector("iframe");
    if (frame) {
      const url = element.getAttribute("data-url") ?? frame.getAttribute("src");
      return allows("media_embed") && parseVideo(url)
        ? [blockOf("media_embed", [{ text: "" }], id, { url })]
        : [];
    }
    const url = safeSrc(img?.getAttribute("src"));
    if (!allows("img") || !img || !url) return [];
    const caption = element.querySelector("figcaption")?.textContent?.trim();
    return [
      blockOf("img", [{ text: "" }], id, {
        url,
        alt: img.getAttribute("alt") ?? "",
        ...(caption ? { caption } : {}),
      }),
    ];
  };

  const table = (element: Element, id: string | null): EditorNode[] => {
    const rows = Array.from(element.querySelectorAll("tr")).filter(
      (tr) => tr.closest("table") === element,
    );
    if (!allows("table"))
      return rows.flatMap((row) =>
        Array.from(row.children).flatMap((cell) => blocks(cell.childNodes)),
      );
    return [
      blockOf(
        "table",
        rows.map((row) =>
          blockOf(
            "tr",
            Array.from(row.children)
              .filter((cell) => ["td", "th"].includes(tagOf(cell)))
              .map((cell) => {
                const content = blocks(cell.childNodes);
                return blockOf(
                  tagOf(cell),
                  content.length ? content : [paragraph([])],
                  cell.getAttribute("data-id"),
                );
              }),
            row.getAttribute("data-id"),
          ),
        ),
        id,
      ),
    ];
  };

  const blocks = (nodes: Iterable<Node>): EditorNode[] => {
    const out: EditorNode[] = [];
    let loose: Node[] = [];
    const flush = () => {
      if (loose.some((node) => node.nodeType === Node.ELEMENT_NODE || node.textContent?.trim())) {
        out.push(paragraph(loose));
      }
      loose = [];
    };

    for (const node of nodes) {
      const tag = tagOf(node);
      if (!tag || !BLOCKS.has(tag)) {
        if (!SKIPPED.has(tag)) loose.push(node);
        continue;
      }
      flush();
      const element = node as Element;
      const id = element.getAttribute("data-id");
      const holdsBlocks = Array.from(element.children).some((child) => BLOCKS.has(tagOf(child)));

      if (/^h[1-6]$/.test(tag)) {
        const type = tag === "h1" || tag === "h2" ? "h2" : "h3";
        out.push(
          blockOf(allows(type) ? type : "p", normalizeInline(inline(element.childNodes, {})), id),
        );
      } else if (tag === "ul" || tag === "ol") out.push(...lists(element, 1));
      else if (tag === "li") out.push(paragraph(element.childNodes, id));
      else if (tag === "hr") {
        if (allows("hr")) out.push(blockOf("hr", [{ text: "" }], id));
      } else if (
        tag === "img" ||
        tag === "iframe" ||
        (tag === "figure" && element.querySelector("img, iframe"))
      ) {
        out.push(...media(element, id));
      } else if (tag === "table") out.push(...table(element, id));
      else if (tag === "blockquote") {
        const inner = blocks(element.childNodes);
        if (allows("blockquote")) {
          out.push(blockOf("blockquote", inner.length ? inner : [paragraph([])], id));
        } else out.push(...inner);
      } else if (
        element.hasAttribute("data-callout") ||
        element.getAttribute("data-slot") === "alert"
      ) {
        const body = element.querySelector("[data-slot=alert-body]") ?? element;
        const inner = blocks(body.childNodes);
        if (allows("callout")) {
          const tone = element.getAttribute("data-callout");
          out.push(
            blockOf("callout", inner.length ? inner : [paragraph([])], id, tone ? { tone } : {}),
          );
        } else out.push(...inner);
      } else if (holdsBlocks) out.push(...blocks(element.childNodes));
      else out.push(paragraph(element.childNodes, tag === "p" ? id : null));
    }
    flush();
    return out;
  };

  const content = blocks(root.childNodes);
  return {
    version: 1,
    locale: root.getAttribute("lang") ?? locale ?? "en",
    content: content.length ? content : [paragraph([])],
  };
};
