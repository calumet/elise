import {
  Bold,
  ChevronDown,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Table,
} from "@calumet/elise-icons";
import { INVERSE_SURFACE } from "@calumet/elise-ui/box";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@calumet/elise-ui/dropdown-menu";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@calumet/elise-ui/toolbar";
import { useEditorRef, useEditorSelector } from "platejs/react";
import * as React from "react";

import { useLabels, type Labels } from "../labels";
import type { EditorMark } from "../types";
import { blockAnchor, rangeAnchor } from "./anchor";
import {
  useBlockActive,
  useEditorCommands,
  useLinkUrl,
  useListActive,
  useMarkActive,
} from "./commands";
import { useServices } from "./context";
import { Float, useDismiss } from "./float";
import { useEditorFocused } from "./focus";
import { LinkForm } from "./link-form";

export const BAR = "flex-nowrap gap-0.5 rounded-none border-0 bg-transparent p-0";
export const BAR_BUTTON = "size-8 shrink-0 bg-transparent p-0 [&_svg]:size-icon-md";
const FLOATING = `w-auto rounded-xl p-1 shadow-lg ${INVERSE_SURFACE}`;
const PANEL = "w-72 rounded-xl border border-border bg-popover p-4 text-foreground shadow-lg";

export const keepFocus = (event: React.MouseEvent): void => event.preventDefault();

const MARKS: Record<EditorMark, { Icon: typeof Bold; label: keyof Labels }> = {
  bold: { Icon: Bold, label: "bold" },
  italic: { Icon: Italic, label: "italic" },
  code: { Icon: Code, label: "code" },
};

export const MarkButton = ({ mark }: { mark: EditorMark }): React.JSX.Element => {
  const t = useLabels();
  const commands = useEditorCommands();
  const active = useMarkActive(mark);
  const { Icon, label } = MARKS[mark];
  return (
    <ToolbarButton
      aria-label={t[label]}
      aria-pressed={active}
      data-state={active ? "on" : "off"}
      className={BAR_BUTTON}
      onMouseDown={keepFocus}
      onClick={() => commands.toggleMark(mark)}
    >
      <Icon aria-hidden="true" />
    </ToolbarButton>
  );
};

export const ListButton = ({ style }: { style: "disc" | "decimal" }): React.JSX.Element => {
  const t = useLabels();
  const commands = useEditorCommands();
  const active = useListActive(style);
  const Icon = style === "disc" ? List : ListOrdered;
  return (
    <ToolbarButton
      aria-label={style === "disc" ? t.bulletedList : t.numberedList}
      aria-pressed={active}
      data-state={active ? "on" : "off"}
      className={BAR_BUTTON}
      onMouseDown={keepFocus}
      onClick={() => commands.toggleList(style)}
    >
      <Icon aria-hidden="true" />
    </ToolbarButton>
  );
};

export const LinkButton = ({
  expanded,
  onClick,
  ...props
}: React.ComponentProps<typeof ToolbarButton> & { expanded: boolean }): React.JSX.Element => {
  const t = useLabels();
  const active = useLinkUrl() !== null;
  return (
    <ToolbarButton
      aria-label={t.link}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      data-state={active ? "on" : "off"}
      className={BAR_BUTTON}
      onMouseDown={keepFocus}
      onClick={onClick}
      {...props}
    >
      <Link aria-hidden="true" />
    </ToolbarButton>
  );
};

export const FormatRow = ({ className }: { className?: string }): React.JSX.Element => {
  const t = useLabels();
  const editor = useEditorRef();
  const { schema } = useServices();
  const [linking, setLinking] = React.useState(false);
  const button = React.useRef<HTMLButtonElement>(null);
  const floatRef = React.useRef<HTMLDivElement>(null);
  const anchor = React.useMemo(
    () => ({
      getBoundingClientRect: () => button.current?.getBoundingClientRect() ?? new DOMRect(),
    }),
    [],
  );
  const close = () => {
    setLinking(false);
    editor.tf.focus();
  };
  useDismiss(floatRef, linking, () => setLinking(false));

  return (
    <Toolbar aria-label={t.formatting} className={className ? `${BAR} ${className}` : BAR}>
      {schema.marks.map((mark) => (
        <MarkButton key={mark} mark={mark} />
      ))}
      {schema.links ? (
        <>
          <LinkButton ref={button} expanded={linking} onClick={() => setLinking(true)} />
          {linking ? (
            <Float
              anchor={anchor}
              side="top"
              floatRef={floatRef}
              focusOnOpen
              className={PANEL}
              onKeyDown={(event) => {
                if (event.key !== "Escape") return;
                event.preventDefault();
                close();
              }}
            >
              <LinkForm onClose={close} />
            </Float>
          ) : null}
        </>
      ) : null}
      {schema.blocks.includes("list") ? (
        <>
          <ToolbarSeparator />
          <ListButton style="disc" />
          <ListButton style="decimal" />
        </>
      ) : null}
    </Toolbar>
  );
};

type BlockKind = "p" | "h2" | "h3" | "blockquote" | "disc" | "decimal";

const BLOCKS: { kind: BlockKind; needs: string; label: keyof Labels; Icon: typeof Bold }[] = [
  { kind: "p", needs: "p", label: "paragraph", Icon: Pilcrow },
  { kind: "h2", needs: "h2", label: "heading2", Icon: Heading2 },
  { kind: "h3", needs: "h3", label: "heading3", Icon: Heading3 },
  { kind: "blockquote", needs: "blockquote", label: "quote", Icon: Quote },
  { kind: "disc", needs: "list", label: "bulletedList", Icon: List },
  { kind: "decimal", needs: "list", label: "numberedList", Icon: ListOrdered },
];

const useCurrentBlock = (): BlockKind => {
  const states: [BlockKind, boolean][] = [
    ["disc", useListActive("disc")],
    ["decimal", useListActive("decimal")],
    ["h2", useBlockActive("h2")],
    ["h3", useBlockActive("h3")],
    ["blockquote", useBlockActive("blockquote")],
  ];
  return states.find(([, active]) => active)?.[0] ?? "p";
};

const BlockTypeMenu = (): React.JSX.Element => {
  const t = useLabels();
  const commands = useEditorCommands();
  const { schema } = useServices();
  const current = useCurrentBlock();
  const chosen = React.useRef(false);
  const options = BLOCKS.filter((option) => schema.blocks.includes(option.needs));
  const label = t[BLOCKS.find((option) => option.kind === current)?.label ?? "paragraph"];

  const apply = (kind: BlockKind) => {
    chosen.current = true;
    if (kind === current) return;
    if (current === "disc" || current === "decimal") commands.toggleList(current);
    else if (current !== "p") commands.toggleBlock(current);
    if (kind === "disc" || kind === "decimal") commands.toggleList(kind);
    else if (kind !== "p") commands.toggleBlock(kind);
  };

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) chosen.current = false;
      }}
    >
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          aria-label={`${t.textStyle}: ${label}`}
          className="h-8 shrink-0 gap-1 bg-transparent px-2 py-0 text-sm font-medium [&_svg]:size-icon-sm"
          onMouseDown={keepFocus}
        >
          {label}
          <ChevronDown aria-hidden="true" />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onCloseAutoFocus={(event) => {
          if (chosen.current) event.preventDefault();
        }}
      >
        {options.map(({ kind, label: key, Icon }) => (
          <DropdownMenuItem key={kind} onSelect={() => apply(kind)}>
            <Icon aria-hidden="true" />
            {t[key]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TableMenu = (): React.JSX.Element => {
  const t = useLabels();
  const editor = useEditorRef();
  const commands = useEditorCommands();
  const chosen = React.useRef(false);
  const run = (action: () => void) => () => {
    chosen.current = true;
    action();
  };

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) chosen.current = false;
      }}
    >
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          className="h-8 shrink-0 gap-1 bg-transparent px-2 py-0 text-sm font-medium [&_svg]:size-icon-sm"
          onMouseDown={keepFocus}
        >
          <Table aria-hidden="true" className="size-icon-md" />
          {t.tableActions}
          <ChevronDown aria-hidden="true" />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(event) => {
          if (!chosen.current) return;
          event.preventDefault();
          editor.tf.focus();
        }}
      >
        <DropdownMenuItem onSelect={run(commands.addRow)}>{t.addRow}</DropdownMenuItem>
        <DropdownMenuItem onSelect={run(commands.addColumn)}>{t.addColumn}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={run(commands.deleteRow)}>{t.deleteRow}</DropdownMenuItem>
        <DropdownMenuItem onSelect={run(commands.deleteColumn)}>{t.deleteColumn}</DropdownMenuItem>
        <DropdownMenuItem tone="danger" onSelect={run(commands.deleteTable)}>
          {t.deleteTable}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const usePointerDown = (): boolean => {
  const [down, setDown] = React.useState(false);
  React.useEffect(() => {
    const press = () => setDown(true);
    const release = () => setDown(false);
    document.addEventListener("pointerdown", press);
    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", release);
    return () => {
      document.removeEventListener("pointerdown", press);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", release);
    };
  }, []);
  return down;
};

const useLatched = (
  ready: string | null,
): [string | null, React.Dispatch<React.SetStateAction<string | null>>] => {
  const [shown, setShown] = React.useState<string | null>(null);
  const [last, setLast] = React.useState(ready);
  if (ready !== last) {
    setLast(ready);
    if (ready) setShown(ready);
  }
  return [shown, setShown];
};

const FormatBar = ({
  barRef,
  onLink,
}: {
  barRef: React.RefObject<HTMLDivElement | null>;
  onLink: () => void;
}): React.JSX.Element => {
  const t = useLabels();
  const { schema } = useServices();
  const textBlocks = BLOCKS.filter((option) => schema.blocks.includes(option.needs)).length;
  return (
    <Toolbar ref={barRef} aria-label={t.formatting} className={BAR}>
      {textBlocks > 1 ? (
        <>
          <BlockTypeMenu />
          <ToolbarSeparator />
        </>
      ) : null}
      {schema.marks.map((mark) => (
        <MarkButton key={mark} mark={mark} />
      ))}
      {schema.links ? (
        <>
          <ToolbarSeparator />
          <LinkButton expanded={false} onClick={onLink} />
        </>
      ) : null}
    </Toolbar>
  );
};

const SelectionBar = ({ className }: { className?: string }): React.JSX.Element | null => {
  const editor = useEditorRef();
  const { schema } = useServices();
  const focused = useEditorFocused();
  const pressing = usePointerDown();
  const barRef = React.useRef<HTMLDivElement>(null);
  const selection = useEditorSelector(
    (ed) =>
      ed.selection && !ed.api.isCollapsed() && ed.api.string(ed.selection).trim() !== ""
        ? JSON.stringify(ed.selection)
        : null,
    [],
  );
  const inText = useEditorSelector(
    (ed) => Boolean(ed.selection && ed.api.above({ at: ed.selection, match: { type: "text" } })),
    [],
  );
  const [shownFor, setShownFor] = useLatched(focused && !pressing ? selection : null);
  const [linking, setLinking] = React.useState(false);

  React.useEffect(() => {
    const root = editor.api.toDOMNode(editor);
    if (!root) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "F10") {
        const bar = barRef.current ?? root.querySelector("[data-slot=text-toolbar]");
        const first = bar?.querySelector<HTMLElement>("button:not([disabled])");
        if (first) {
          event.preventDefault();
          first.focus();
        }
      } else if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        schema.links &&
        selection
      ) {
        event.preventDefault();
        setShownFor(selection);
        setLinking(true);
      } else if (event.key === "Escape" && selection && shownFor === selection) {
        setShownFor(null);
      }
    };
    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [editor, schema.links, selection, shownFor, setShownFor]);

  const anchor = React.useMemo(
    () => (selection ? rangeAnchor(editor, JSON.parse(selection)) : undefined),
    [editor, selection],
  );
  const open = selection !== null && shownFor === selection && (linking || !inText);
  const formatting = open && !linking;

  React.useEffect(() => {
    const root = editor.api.toDOMNode(editor);
    if (!root || !formatting) return;
    root.dataset.formatting = "";
    return () => {
      delete root.dataset.formatting;
    };
  }, [editor, formatting]);
  const closeLink = () => {
    setLinking(false);
    editor.tf.focus();
  };
  const floatRef = React.useRef<HTMLDivElement>(null);
  useDismiss(floatRef, open, () => {
    setShownFor(null);
    setLinking(false);
  });

  if (!open) return null;
  return linking ? (
    <Float
      key="link"
      anchor={anchor}
      side="bottom"
      refresh={selection}
      floatRef={floatRef}
      focusOnOpen
      className={PANEL}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        closeLink();
      }}
    >
      <LinkForm onClose={closeLink} />
    </Float>
  ) : (
    <Float
      key="bar"
      anchor={anchor}
      side="top"
      refresh={selection}
      floatRef={floatRef}
      className={className ? `${FLOATING} ${className}` : FLOATING}
      onKeyDown={(event) => {
        if (event.key === "Escape") editor.tf.focus();
      }}
    >
      <FormatBar barRef={barRef} onLink={() => setLinking(true)} />
    </Float>
  );
};

const TableBar = (): React.JSX.Element | null => {
  const t = useLabels();
  const editor = useEditorRef();
  const focused = useEditorFocused();
  const table = useEditorSelector((ed) => {
    if (!ed.selection || !ed.api.isCollapsed()) return null;
    const entry = ed.api.above({ match: { type: "table" } });
    return entry ? entry[1].join(".") : null;
  }, []);
  const [tableFor, setTableFor] = useLatched(focused ? table : null);
  const anchor = React.useMemo(
    () => (table ? blockAnchor(editor, table.split(".").map(Number)) : undefined),
    [editor, table],
  );
  const open = table !== null && tableFor === table;
  const floatRef = React.useRef<HTMLDivElement>(null);
  useDismiss(floatRef, open, () => setTableFor(null));

  if (!open) return null;
  return (
    <Float
      anchor={anchor}
      side="top"
      align="end"
      offset={4}
      refresh={table}
      floatRef={floatRef}
      className={FLOATING}
    >
      <Toolbar aria-label={t.tableActions} className={BAR}>
        <TableMenu />
      </Toolbar>
    </Float>
  );
};

export type EditorToolbarProps = { className?: string };

export const EditorToolbar = ({ className }: EditorToolbarProps): React.JSX.Element => {
  const { schema } = useServices();
  return (
    <>
      <SelectionBar className={className} />
      {schema.blocks.includes("table") ? <TableBar /> : null}
    </>
  );
};
