import * as React from "react";

import type { EditorNode } from "./types";
import { parseVideo, safeHref, safeSrc } from "./urls";

export type ViewProps = {
  element: EditorNode;
  children?: React.ReactNode;
  attributes?: object;
  editing?: boolean;
};

const frozen = (editing: boolean | undefined) => (editing ? { contentEditable: false } : {});

const Paragraph = ({ element, attributes, children, editing }: ViewProps): React.JSX.Element => {
  const Tag = editing && element.listStyleType ? "div" : "p";
  return <Tag {...attributes}>{children}</Tag>;
};

const Heading2 = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <h2 {...attributes}>{children}</h2>
);

const Heading3 = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <h3 {...attributes}>{children}</h3>
);

const Blockquote = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <blockquote {...attributes}>{children}</blockquote>
);

const Callout = ({ element, attributes, children }: ViewProps): React.JSX.Element => (
  <aside data-callout={String(element.tone ?? "info")} {...attributes}>
    {children}
  </aside>
);

const Divider = ({ attributes, children, editing }: ViewProps): React.JSX.Element =>
  editing ? (
    <div {...attributes}>
      <div {...frozen(editing)}>
        <hr />
      </div>
      {children}
    </div>
  ) : (
    <hr {...attributes} />
  );

const Figure = ({ element, attributes, children, editing }: ViewProps): React.JSX.Element => {
  const src = safeSrc(String(element.url ?? ""));
  const caption = typeof element.caption === "string" ? element.caption : "";
  return (
    <figure {...attributes}>
      <div {...frozen(editing)}>
        {src ? <img src={src} alt={String(element.alt ?? "")} /> : null}
        {caption ? <figcaption>{caption}</figcaption> : null}
      </div>
      {children}
    </figure>
  );
};

const Video = ({ element, attributes, children, editing }: ViewProps): React.JSX.Element => {
  const url = String(element.url ?? "");
  const source = parseVideo(url);
  return (
    <figure data-url={url} {...attributes}>
      <div {...frozen(editing)}>
        {source ? (
          <iframe src={source.embed} title={source.provider} loading="lazy" allowFullScreen />
        ) : null}
      </div>
      {children}
    </figure>
  );
};

const Table = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <table {...attributes}>
    <tbody>{children}</tbody>
  </table>
);

const Row = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <tr {...attributes}>{children}</tr>
);

const Cell = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <td {...attributes}>{children}</td>
);

const HeaderCell = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <th scope="col" {...attributes}>
    {children}
  </th>
);

export const AnchorView = ({ element, attributes, children }: ViewProps): React.JSX.Element => (
  <a href={safeHref(String(element.url ?? ""))} {...attributes}>
    {children}
  </a>
);

export const views: Record<string, (props: ViewProps) => React.JSX.Element> = {
  p: Paragraph,
  h2: Heading2,
  h3: Heading3,
  blockquote: Blockquote,
  callout: Callout,
  hr: Divider,
  img: Figure,
  media_embed: Video,
  table: Table,
  tr: Row,
  td: Cell,
  th: HeaderCell,
  a: AnchorView,
};

export const markView = (
  mark: "bold" | "italic" | "code",
  children: React.ReactNode,
  attributes?: object,
): React.JSX.Element => {
  if (mark === "bold") return <strong {...attributes}>{children}</strong>;
  if (mark === "italic") return <em {...attributes}>{children}</em>;
  return <code {...attributes}>{children}</code>;
};
