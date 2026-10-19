import { GripHorizontal, GripVertical, Plus } from "@calumet/elise-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@calumet/elise-ui/dropdown-menu";
import { useEditorRef, type PlateElementProps } from "platejs/react";
import * as React from "react";

import { useLabels } from "../labels";
import type { EditorNode } from "../types";
import { views } from "../views";
import { addTableColumn, addTableRow, removeTableColumn, removeTableRow } from "./table";

type Box = { left: number; top: number; width: number; height: number };
type Hover = { table: Box; row: number; col: number; rowBox: Box; colBox: Box };

const EDGE =
  "pointer-events-auto absolute flex items-center justify-center rounded-sm bg-muted text-muted-foreground transition-[background-color,color,opacity] duration-(--duration-fast) ease-out select-none hover:bg-accent hover:text-accent-foreground starting:opacity-0";
const HANDLE =
  "pointer-events-auto absolute flex size-4 items-center justify-center rounded-xs border border-border-strong bg-card text-muted-foreground shadow-xs transition-[color,opacity] duration-(--duration-fast) ease-out select-none hover:text-foreground starting:opacity-0";

const relative = (rect: DOMRect, frame: DOMRect): Box => ({
  left: rect.left - frame.left,
  top: rect.top - frame.top,
  width: rect.width,
  height: rect.height,
});

const sameHover = (a: Hover | null, b: Hover | null): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

const measure = (frame: HTMLElement, target: EventTarget | null, last: Hover | null) => {
  const table = frame.querySelector("table");
  if (!table) return null;
  const box = frame.getBoundingClientRect();
  const cell = target instanceof Element ? target.closest("td, th") : null;
  const row = cell?.parentElement instanceof HTMLTableRowElement ? cell.parentElement : null;
  const tableBox = relative(table.getBoundingClientRect(), box);
  if (!cell || !row || !(cell instanceof HTMLTableCellElement)) {
    return last ? { ...last, table: tableBox } : null;
  }
  const head = table.rows[0]?.cells[cell.cellIndex] ?? cell;
  return {
    table: tableBox,
    row: row.rowIndex,
    col: cell.cellIndex,
    rowBox: relative(row.getBoundingClientRect(), box),
    colBox: relative(head.getBoundingClientRect(), box),
  };
};

const Chrome = ({ id }: { id: string }): React.JSX.Element => {
  const t = useLabels();
  const editor = useEditorRef();
  const ref = React.useRef<HTMLDivElement>(null);
  const [hover, setHover] = React.useState<Hover | null>(null);
  const open = React.useRef(false);

  React.useEffect(() => {
    const frame = ref.current?.parentElement;
    if (!frame) return;
    const move = (event: MouseEvent) =>
      setHover((last) => {
        const next = measure(frame, event.target, last);
        return sameHover(last, next) ? last : next;
      });
    const leave = () => {
      if (!open.current) setHover(null);
    };
    frame.addEventListener("mousemove", move);
    frame.addEventListener("mouseleave", leave);
    return () => {
      frame.removeEventListener("mousemove", move);
      frame.removeEventListener("mouseleave", leave);
    };
  }, []);

  const keep = (next: boolean) => {
    open.current = next;
    if (!next) setHover(null);
  };
  const hold = (event: React.MouseEvent) => event.preventDefault();

  return (
    <div
      ref={ref}
      contentEditable={false}
      className="pointer-events-none absolute inset-0 max-sm:hidden"
    >
      {hover ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label={t.addColumn}
            className={EDGE}
            style={{
              left: hover.table.left + hover.table.width + 12,
              top: hover.table.top,
              width: 16,
              height: hover.table.height,
            }}
            onMouseDown={hold}
            onClick={() => addTableColumn(editor, id)}
          >
            <Plus aria-hidden="true" className="size-icon-xs" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label={t.addRow}
            className={EDGE}
            style={{
              left: hover.table.left,
              top: hover.table.top + hover.table.height + 12,
              width: hover.table.width,
              height: 16,
            }}
            onMouseDown={hold}
            onClick={() => addTableRow(editor, id)}
          >
            <Plus aria-hidden="true" className="size-icon-xs" />
          </button>
          <DropdownMenu onOpenChange={keep}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                tabIndex={-1}
                aria-label={t.rowActions.replace("{n}", String(hover.row + 1))}
                className={HANDLE}
                style={{
                  left: hover.table.left - 8,
                  top: hover.rowBox.top + hover.rowBox.height / 2 - 8,
                }}
                onMouseDown={hold}
              >
                <GripVertical aria-hidden="true" className="size-icon-xs" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="left">
              <DropdownMenuLabel>
                {t.rowActions.replace("{n}", String(hover.row + 1))}
              </DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => addTableRow(editor, id, hover.row, true)}>
                {t.insertRowAbove}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addTableRow(editor, id, hover.row, false)}>
                {t.insertRowBelow}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                tone="danger"
                onSelect={() => removeTableRow(editor, id, hover.row)}
              >
                {t.deleteRow}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu onOpenChange={keep}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                tabIndex={-1}
                aria-label={t.columnActions.replace("{n}", String(hover.col + 1))}
                className={HANDLE}
                style={{
                  left: hover.colBox.left + hover.colBox.width / 2 - 8,
                  top: hover.table.top - 8,
                }}
                onMouseDown={hold}
              >
                <GripHorizontal aria-hidden="true" className="size-icon-xs" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>
                {t.columnActions.replace("{n}", String(hover.col + 1))}
              </DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => addTableColumn(editor, id, hover.col, true)}>
                {t.insertColumnLeft}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addTableColumn(editor, id, hover.col, false)}>
                {t.insertColumnRight}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                tone="danger"
                onSelect={() => removeTableColumn(editor, id, hover.col)}
              >
                {t.deleteColumn}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : null}
    </div>
  );
};

export const TableElement = ({
  attributes,
  children,
  element,
}: PlateElementProps): React.JSX.Element => {
  const View = views.table as (typeof views)[string];
  const { className: _plateClass, ...rest } = attributes as typeof attributes & {
    className?: string;
  };
  return (
    <div {...rest} className="relative">
      <View element={element as unknown as EditorNode} editing>
        {children}
      </View>
      <Chrome id={String(element.id)} />
    </div>
  );
};
