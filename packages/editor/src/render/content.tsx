import * as React from "react";

import { isInlineHolder, isTranslated } from "../translations";
import { isText } from "../types";
import type {
  EditorDocument,
  EditorInline,
  EditorMark,
  EditorNode,
  EditorSchema,
  EditorText,
} from "../types";
import { contentClassName, LIST_CLASSES, markView, views } from "../views";

export type EditorContentProps = {
  value: EditorDocument;
  schema: EditorSchema;
  locale?: string;
  className?: string;
};

type ListItemNode = { node: EditorNode; nested: ListGroup[] };
type ListGroup = { style: string; items: ListItemNode[] };

const MARKS: EditorMark[] = ["code", "italic", "bold"];

const candidates = (locale: string): string[] => {
  const base = locale.split("-")[0] ?? locale;
  return base === locale ? [locale] : [locale, base];
};

const localize = (nodes: EditorNode[], doc: EditorDocument, locale: string): EditorNode[] => {
  const tables = candidates(locale).map((key) => doc.translations?.[key]);
  const pick = (key: string) => {
    for (const table of tables) if (table && isTranslated(table[key])) return table[key];
    return undefined;
  };

  const visit = (node: EditorNode): EditorNode => {
    let next = node;
    const translated = pick(node.id);
    if (translated !== undefined && isInlineHolder(node)) {
      next = {
        ...next,
        children: typeof translated === "string" ? [{ text: translated }] : translated,
      };
    }
    for (const key of Object.keys(node)) {
      const attribute = pick(`${node.id}#${key}`);
      if (typeof attribute === "string") next = { ...next, [key]: attribute };
    }
    if (!isInlineHolder(next)) {
      next = {
        ...next,
        children: next.children.map((child) => (isText(child) ? child : visit(child))),
      };
    }
    return next;
  };

  return nodes.map(visit);
};

const groupLists = (run: EditorNode[]): ListGroup[] => {
  const roots: ListGroup[] = [];
  const open: ListGroup[] = [];
  for (const node of run) {
    const style = String(node.listStyleType ?? "disc");
    const depth = Math.min(Math.max(Number(node.indent ?? 1), 1), open.length + 1);
    open.length = Math.min(open.length, depth);
    let group = open[depth - 1];
    if (!group || group.style !== style) {
      group = { style, items: [] };
      const above = open[depth - 2]?.items;
      const parent = depth === 1 ? roots : above?.[above.length - 1]?.nested;
      (parent ?? roots).push(group);
      open[depth - 1] = group;
      open.length = depth;
    }
    group.items.push({ node, nested: [] });
  }
  return roots;
};

export const renderInline = (children: EditorInline[], keyPrefix: string): React.ReactNode[] =>
  children.flatMap((child, index): React.ReactNode[] => {
    const key = `${keyPrefix}.${index}`;
    if (isText(child)) return child.text === "" ? [] : [renderLeaf(child, key)];
    const View = views[child.type];
    return View
      ? [
          <View key={child.id} element={child}>
            {renderInline(child.children, child.id)}
          </View>,
        ]
      : renderInline(child.children, key);
  });

const renderLeaf = (leaf: EditorText, key: string): React.ReactNode => (
  <React.Fragment key={key}>
    {MARKS.reduce<React.ReactNode>(
      (inner, mark) => (leaf[mark] ? markView(mark, inner) : inner),
      leaf.text.split("\n").flatMap((line, at) => (at === 0 ? [line] : [<br key={at} />, line])),
    )}
  </React.Fragment>
);

const ListTag = ({
  style,
  children,
}: {
  style: string;
  children: React.ReactNode;
}): React.JSX.Element =>
  style === "decimal" ? (
    <ol className={LIST_CLASSES.decimal}>{children}</ol>
  ) : (
    <ul className={LIST_CLASSES.disc}>{children}</ul>
  );

const renderGroup = (group: ListGroup, key: string): React.ReactNode => (
  <ListTag key={key} style={group.style}>
    {group.items.map((item, index) => (
      <li key={item.node.id} data-id={item.node.id} className={LIST_CLASSES.item}>
        {renderInline(item.node.children, `${key}.${index}`)}
        {item.nested.map((nested, at) => renderGroup(nested, `${key}.${index}.${at}`))}
      </li>
    ))}
  </ListTag>
);

const STRUCTURAL = new Set(["tr", "td", "th"]);

export const renderBlocks = (nodes: EditorNode[], schema: EditorSchema): React.ReactNode[] => {
  const allowed = new Set(schema.blocks);
  const output: React.ReactNode[] = [];
  let run: EditorNode[] = [];
  const flush = () => {
    if (run.length === 0) return;
    groupLists(run).forEach((group, index) =>
      output.push(renderGroup(group, `${run[0]?.id}.${index}`)),
    );
    run = [];
  };

  for (const node of nodes) {
    if (node.listStyleType && allowed.has("list")) {
      run.push(node);
      continue;
    }
    flush();
    if (node.type === "text" && !allowed.has("text")) {
      output.push(
        ...renderBlocks(
          node.children.filter((child): child is EditorNode => !isText(child)),
          schema,
        ),
      );
      continue;
    }
    const structural =
      STRUCTURAL.has(node.type) || (node.type === "column" && allowed.has("columns"));
    if (!allowed.has(node.type) && !structural) continue;
    const View = views[node.type];
    if (!View) continue;
    const attributes = { "data-id": node.id };
    output.push(
      <View key={node.id} element={node} attributes={attributes}>
        {isInlineHolder(node)
          ? renderInline(node.children, node.id)
          : renderBlocks(
              node.children.filter((child): child is EditorNode => !isText(child)),
              schema,
            )}
      </View>,
    );
  }
  flush();
  return output;
};

export const EditorContent = ({
  value,
  schema,
  locale,
  className,
}: EditorContentProps): React.JSX.Element => {
  const language = locale ?? value.locale;
  const content =
    language === value.locale ? value.content : localize(value.content, value, language);
  return (
    <div
      data-slot="editor-content"
      lang={language}
      className={className ? `${contentClassName(schema)} ${className}` : contentClassName(schema)}
    >
      {renderBlocks(content, schema)}
    </div>
  );
};
