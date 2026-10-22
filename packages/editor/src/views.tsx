import { AlertTriangle, CheckCircle2, Info, XCircle } from "@calumet/elise-icons";
import * as React from "react";

import type { EditorNode, EditorSchema } from "./types";
import { parseVideo, safeHref, safeSrc } from "./urls";

export type ViewProps = {
  element: EditorNode;
  children?: React.ReactNode;
  attributes?: object;
  editing?: boolean;
  selected?: boolean;
};

const RHYTHM = {
  document:
    "text-lg [&>*+*]:mt-4 [&>*+h2]:mt-8 [&>*+h3]:mt-6 [&>h2+*]:mt-2 [&>h3+*]:mt-2 [&>[data-list]+[data-list]]:mt-1",
  message: "text-base [&>*+*]:mt-2 [&>[data-list]+[data-list]]:mt-1",
};

export const contentClassName = (schema: EditorSchema): string =>
  `min-w-0 text-foreground break-words ${schema.blocks.length > 2 ? RHYTHM.document : RHYTHM.message}`;

export const LIST_CLASSES = {
  disc: "list-disc ps-6 [li>&]:mt-1",
  decimal: "list-decimal ps-6 [li>&]:mt-1",
  item: "mt-1 first:mt-0",
};

const VOID =
  "data-selected:ring-2 data-selected:ring-ring data-selected:ring-offset-2 data-selected:ring-offset-background";

const CALLOUT_TONES: Record<string, { surface: string; Icon: typeof Info }> = {
  info: { surface: "bg-info-subtle text-info-subtle-foreground", Icon: Info },
  success: { surface: "bg-success-subtle text-success-subtle-foreground", Icon: CheckCircle2 },
  warning: { surface: "bg-warning-subtle text-warning-subtle-foreground", Icon: AlertTriangle },
  danger: { surface: "bg-destructive-subtle text-destructive-subtle-foreground", Icon: XCircle },
};

const frozen = (editing: boolean | undefined) => (editing ? { contentEditable: false } : {});

const Paragraph = ({ element, attributes, children, editing }: ViewProps): React.JSX.Element =>
  editing && element.listStyleType ? (
    <div data-list="" {...attributes}>
      {children}
    </div>
  ) : (
    <p {...attributes}>{children}</p>
  );

const Heading2 = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <h2 className="font-display text-2xl font-semibold text-balance" {...attributes}>
    {children}
  </h2>
);

const Heading3 = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <h3 className="font-display text-xl font-semibold text-balance" {...attributes}>
    {children}
  </h3>
);

const Blockquote = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <blockquote
    className="border-s-2 border-border-strong ps-4 text-muted-foreground"
    {...attributes}
  >
    {children}
  </blockquote>
);

const Callout = ({ element, attributes, children, editing }: ViewProps): React.JSX.Element => {
  const tone = String(element.tone ?? "info");
  const { surface, Icon } = CALLOUT_TONES[tone] ?? CALLOUT_TONES.info!;
  return (
    <aside
      data-callout={tone}
      className={`flex items-start gap-3 rounded-xl px-4 py-3 text-base ${surface}`}
      {...attributes}
    >
      <span data-slot="alert-icon" className="mt-0.5 shrink-0" {...frozen(editing)}>
        <Icon aria-hidden="true" className="size-icon-md" />
      </span>
      <div data-slot="alert-body" className="min-w-0 flex-1 [&>*+*]:mt-2">
        {children}
      </div>
    </aside>
  );
};

const RULE = "box-content h-px border-0 bg-border bg-clip-content py-2";

const Divider = ({ attributes, children, editing, selected }: ViewProps): React.JSX.Element =>
  editing ? (
    <div data-selected={selected || undefined} className={VOID} {...attributes}>
      <hr className={RULE} {...frozen(editing)} />
      {children}
    </div>
  ) : (
    <hr className={RULE} {...attributes} />
  );

const Figure = ({
  element,
  attributes,
  children,
  editing,
  selected,
}: ViewProps): React.JSX.Element => {
  const src = safeSrc(String(element.url ?? ""));
  const caption = typeof element.caption === "string" ? element.caption : "";
  return (
    <figure {...attributes}>
      <div {...frozen(editing)}>
        {src ? (
          <img
            src={src}
            alt={String(element.alt ?? "")}
            data-selected={selected || undefined}
            className={`h-auto max-w-full rounded-lg ${VOID}`}
          />
        ) : null}
        {caption ? (
          <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
        ) : null}
      </div>
      {children}
    </figure>
  );
};

const Video = ({
  element,
  attributes,
  children,
  editing,
  selected,
}: ViewProps): React.JSX.Element => {
  const url = String(element.url ?? "");
  const source = parseVideo(url);
  return (
    <figure data-url={url} {...attributes}>
      <div {...frozen(editing)}>
        {source ? (
          <iframe
            src={source.embed}
            title={source.provider}
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            data-selected={selected || undefined}
            className={`aspect-video w-full rounded-lg border-0 bg-muted ${VOID}`}
          />
        ) : null}
      </div>
      {children}
    </figure>
  );
};

const Table = ({ attributes, children, editing }: ViewProps): React.JSX.Element => (
  <div className="overflow-x-auto rounded-xl border border-border" {...(editing ? attributes : {})}>
    <table className="w-full border-collapse text-sm" {...(editing ? {} : attributes)}>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const Row = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <tr className="border-t border-border-subtle first:border-t-0" {...attributes}>
    {children}
  </tr>
);

const Cell = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <td className="px-1.5 py-1.5 align-top text-foreground first:ps-3 last:pe-3" {...attributes}>
    {children}
  </td>
);

const HeaderCell = ({ attributes, children }: ViewProps): React.JSX.Element => (
  <th
    scope="col"
    className="bg-muted px-1.5 py-2 text-start align-top font-medium text-muted-foreground first:ps-3 last:pe-3"
    {...attributes}
  >
    {children}
  </th>
);

export const AnchorView = ({ element, attributes, children }: ViewProps): React.JSX.Element => {
  const blank = element.target === "_blank";
  return (
    <a
      href={safeHref(String(element.url ?? ""))}
      target={blank ? "_blank" : undefined}
      rel={blank ? "noreferrer noopener" : undefined}
      className="rounded-xs text-link underline underline-offset-2 transition-[color] duration-(--duration-fast) ease-out hover:text-link-hover active:text-link-active"
      {...attributes}
    >
      {children}
    </a>
  );
};

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
  return (
    <code
      className="rounded-sm border border-border-subtle bg-muted px-1 py-0.5 font-mono text-sm text-foreground"
      {...attributes}
    >
      {children}
    </code>
  );
};
