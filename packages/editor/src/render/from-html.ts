import { newId } from "../ids";
import { COLUMN_LIMIT, coerceSetting, settingDefs, type SettingValue } from "../settings";
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
  const allowedBlocks = new Set(schema.blocks);
  const allowedMarks = new Set(schema.marks);
  const allows = (type: string) => allowedBlocks.has(type);

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
      const next: Marks = mark && allowedMarks.has(mark) ? { ...marks, [mark]: true } : marks;
      const href = tag === "a" && schema.links ? safeHref(element.getAttribute("href")) : undefined;
      const children = inline(element.childNodes, next);
      const target = element.getAttribute("target") === "_blank" ? { target: "_blank" } : {};
      out.push(
        ...(href
          ? [blockOf("a", normalizeInline(children), null, { url: href, ...target })]
          : children),
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
    if (!allows("img") || (!img && !element.hasAttribute("data-empty"))) return [];
    const caption = element.querySelector("figcaption")?.textContent?.trim();
    return [
      blockOf("img", [{ text: "" }], id, {
        url: safeSrc(img?.getAttribute("src")) ?? "",
        alt: img?.getAttribute("alt") ?? element.getAttribute("data-alt") ?? "",
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
    const grid = rows.map((row) =>
      Array.from(row.children).filter((cell) => ["td", "th"].includes(tagOf(cell))),
    );
    const alignOf = (cell: Element | undefined): string => {
      const value = cell?.getAttribute("data-align");
      return value === "center" || value === "right" ? value : "left";
    };
    const headerRow =
      (grid[0] ?? []).length > 0 && (grid[0] ?? []).every((cell) => tagOf(cell) === "th");
    const body = headerRow ? grid.slice(1) : grid;
    const headerColumn =
      body.length > 0 && body.every((cells) => cells[0] && tagOf(cells[0]) === "th");
    const width = Math.max(0, ...grid.map((cells) => cells.length));
    const columnAlign = Array.from({ length: width }, (_, index) =>
      alignOf(grid.find((cells) => cells[index])?.[index]),
    );
    return [
      blockOf(
        "table",
        grid.map((cells, rowIndex) =>
          blockOf(
            "tr",
            cells.map((cell) => {
              const content = blocks(cell.childNodes);
              const tag = tagOf(cell);
              const align = alignOf(cell);
              return blockOf(
                tag,
                content.length ? content : [paragraph([])],
                cell.getAttribute("data-id"),
                {
                  ...(tag === "th"
                    ? { scope: cell.getAttribute("scope") === "row" ? "row" : "col" }
                    : {}),
                  ...(align !== "left" ? { align } : {}),
                },
              );
            }),
            rows[rowIndex]?.getAttribute("data-id") ?? null,
          ),
        ),
        id,
        { headerRow, headerColumn, columnAlign },
      ),
    ];
  };

  const dataSettings = (type: string, element: Element): Record<string, SettingValue> => {
    const found: Record<string, SettingValue> = {};
    for (const def of settingDefs(type)) {
      const raw = element.getAttribute(`data-${def.key}`);
      if (raw === null || def.kind === "number") continue;
      const value = coerceSetting(def, def.kind === "toggle" ? raw === "true" : raw);
      if (value !== undefined) found[def.key] = value;
    }
    return found;
  };

  const unnest = (content: EditorNode[]): EditorNode[] =>
    content.flatMap((node) =>
      node.type === "columns"
        ? node.children.flatMap((column) =>
            isText(column)
              ? []
              : unnest(column.children.filter((n): n is EditorNode => !isText(n))),
          )
        : [node],
    );

  const columnsBlock = (element: Element, id: string | null): EditorNode => {
    const groups = Array.from(element.children)
      .filter((child) => child.getAttribute("data-slot") === "column")
      .map((column) => ({
        id: column.getAttribute("data-id"),
        content: unnest(blocks(column.childNodes)),
      }));
    const kept = groups.slice(0, COLUMN_LIMIT);
    const last = kept[kept.length - 1];
    if (last) last.content = groups.slice(kept.length - 1).flatMap((group) => group.content);
    const columns = (kept.length ? kept : [{ id: null, content: [] as EditorNode[] }]).map(
      (group) =>
        blockOf("column", group.content.length ? group.content : [paragraph([])], group.id),
    );
    return blockOf("columns", columns, id, dataSettings("columns", element));
  };

  const pageBlock = (
    slot: string,
    element: Element,
    id: string | null,
  ): EditorNode[] | undefined => {
    if (slot === "text") {
      const inner = blocks(element.childNodes);
      return allows("text") ? [blockOf("text", inner.length ? inner : [paragraph([])], id)] : inner;
    }
    if (!allows(slot) || !["columns", "spacer", "button", "gallery", "file"].includes(slot)) {
      return undefined;
    }
    const voidBlock = (extra: Record<string, unknown>) => [
      blockOf(slot, [{ text: "" }], id, extra),
    ];
    const link = element.querySelector("a");
    if (slot === "columns") return [columnsBlock(element, id)];
    if (slot === "spacer") return voidBlock(dataSettings("spacer", element));
    if (slot === "button") {
      return voidBlock({
        label: link?.textContent?.trim() ?? "",
        href: safeHref(link?.getAttribute("href")) ?? "",
        ...(link ? dataSettings("button", link) : {}),
      });
    }
    if (slot === "gallery") {
      const images = Array.from(element.querySelectorAll("img")).flatMap((img) => {
        const src = safeSrc(img.getAttribute("src"));
        return src ? [{ src, alt: img.getAttribute("alt") ?? "" }] : [];
      });
      return voidBlock({ images });
    }
    const src = safeHref(link?.getAttribute("href"));
    const size = Number(element.getAttribute("data-size"));
    return src
      ? voidBlock({ src, name: link?.textContent?.trim() ?? "", ...(size > 0 ? { size } : {}) })
      : [];
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
      out.push(...block(node as Element, tag));
    }
    flush();
    return out;
  };

  const container = (
    type: string,
    body: Element,
    id: string | null,
    extra: Record<string, unknown> = {},
  ): EditorNode[] => {
    const inner = blocks(body.childNodes);
    if (!allows(type)) return inner;
    return [blockOf(type, inner.length ? inner : [paragraph([])], id, extra)];
  };

  const heading = (element: Element, id: string | null): EditorNode[] => {
    const type = ["h1", "h2"].includes(tagOf(element)) ? "h2" : "h3";
    return [
      blockOf(allows(type) ? type : "p", normalizeInline(inline(element.childNodes, {})), id),
    ];
  };

  const byTag: Record<string, (element: Element, id: string | null) => EditorNode[]> = {
    ...Object.fromEntries(["h1", "h2", "h3", "h4", "h5", "h6"].map((tag) => [tag, heading])),
    ul: (element) => lists(element, 1),
    ol: (element) => lists(element, 1),
    li: (element, id) => [paragraph(element.childNodes, id)],
    hr: (_, id) => (allows("hr") ? [blockOf("hr", [{ text: "" }], id)] : []),
    img: media,
    iframe: media,
    table,
    blockquote: (element, id) => container("blockquote", element, id),
  };

  const callout = (element: Element, id: string | null): EditorNode[] => {
    const tone = element.getAttribute("data-callout");
    const body = element.querySelector("[data-slot=alert-body]") ?? element;
    return container("callout", body, id, tone ? { tone } : {});
  };

  const block = (element: Element, tag: string): EditorNode[] => {
    const id = element.getAttribute("data-id");
    const slot = element.getAttribute("data-slot");
    const page = slot ? pageBlock(slot, element, id) : undefined;
    if (page) return page;
    const handler = byTag[tag];
    if (handler) return handler(element, id);
    if (
      tag === "figure" &&
      (element.querySelector("img, iframe") || element.hasAttribute("data-empty"))
    )
      return media(element, id);
    if (element.hasAttribute("data-callout") || element.getAttribute("data-slot") === "alert") {
      return callout(element, id);
    }
    if (Array.from(element.children).some((child) => BLOCKS.has(tagOf(child)))) {
      return blocks(element.childNodes);
    }
    return [paragraph(element.childNodes, tag === "p" ? id : null)];
  };

  const content = blocks(root.childNodes);
  return {
    version: 1,
    locale: root.getAttribute("lang") ?? locale ?? "en",
    content: content.length ? content : [paragraph([])],
  };
};
