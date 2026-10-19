import { GripHorizontal, GripVertical } from "@calumet/elise-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@calumet/elise-ui/dropdown-menu";
import { PathApi } from "platejs";
import { useEditorRef, useEditorSelector, type PlateElementProps } from "platejs/react";
import * as React from "react";

import { useLabels } from "../labels";
import type { EditorNode } from "../types";
import { views } from "../views";
import { blockEntry } from "./structure";
import { addTableColumn, addTableRow, removeTableColumn, removeTableRow } from "./table";

type Spot = { row: number; col: number; rowX: number; rowY: number; colX: number; colY: number };

const HANDLE =
  "pointer-events-auto absolute flex size-4 items-center justify-center rounded-xs border border-border-strong bg-card text-muted-foreground shadow-xs transition-[color,opacity] duration-(--duration-fast) ease-out select-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none starting:opacity-0";
const SIZE = 16;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), Math.max(min, max));

const spotOf = (frame: HTMLElement, cell: Element | null | undefined): Spot | null => {
  const table = frame.querySelector("table");
  const scroller = table?.parentElement;
  const row = cell?.parentElement;
  if (!table || !scroller || !(cell instanceof HTMLTableCellElement)) return null;
  if (!(row instanceof HTMLTableRowElement)) return null;
  const box = frame.getBoundingClientRect();
  const area = scroller.getBoundingClientRect();
  const head = (table.rows[0]?.cells[cell.cellIndex] ?? cell).getBoundingClientRect();
  const line = row.getBoundingClientRect();
  return {
    row: row.rowIndex,
    col: cell.cellIndex,
    rowX: area.left - box.left - SIZE / 2,
    rowY: line.top - box.top + line.height / 2 - SIZE / 2,
    colX: clamp(head.left + head.width / 2 - SIZE / 2, area.left, area.right - SIZE) - box.left,
    colY: area.top - box.top - SIZE / 2,
  };
};

const same = (a: Spot | null, b: Spot | null): boolean => JSON.stringify(a) === JSON.stringify(b);

const Chrome = ({ id }: { id: string }): React.JSX.Element => {
  const t = useLabels();
  const editor = useEditorRef();
  const ref = React.useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = React.useState<Spot | null>(null);
  const [caretSpot, setCaretSpot] = React.useState<Spot | null>(null);
  const open = React.useRef(false);

  const caret = useEditorSelector(
    (ed) => {
      const anchor = ed.selection?.anchor.path;
      const at = blockEntry(ed, id)?.[1];
      if (!anchor || !at || !PathApi.isAncestor(at, anchor)) return null;
      return `${anchor[at.length]}:${anchor[at.length + 1]}`;
    },
    [id],
  );

  React.useLayoutEffect(() => {
    const frame = ref.current?.parentElement;
    if (!frame) return;
    const [row, col] = caret ? caret.split(":").map(Number) : [];
    const cell =
      row === undefined || col === undefined
        ? null
        : frame.querySelector("table")?.rows[row]?.cells[col];
    const next = spotOf(frame, cell);
    setCaretSpot((last) => (same(last, next) ? last : next));
  }, [caret]);

  React.useEffect(() => {
    const frame = ref.current?.parentElement;
    if (!frame) return;
    const move = (event: MouseEvent) => {
      const cell = event.target instanceof Element ? event.target.closest("td, th") : null;
      if (!cell) return;
      const next = spotOf(frame, cell);
      setPointer((last) => (same(last, next) ? last : next));
    };
    const leave = () => {
      if (!open.current) setPointer(null);
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
    if (!next) setPointer(null);
  };
  const hold = (event: React.MouseEvent) => event.preventDefault();
  const back = (event: Event) => {
    event.preventDefault();
    editor.tf.focus();
  };
  const spot = pointer ?? caretSpot;
  const rowName = spot ? t.rowActions.replace("{n}", String(spot.row + 1)) : "";
  const columnName = spot ? t.columnActions.replace("{n}", String(spot.col + 1)) : "";

  return (
    <div ref={ref} contentEditable={false} className="pointer-events-none absolute inset-0">
      {spot ? (
        <>
          <DropdownMenu onOpenChange={keep}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                tabIndex={-1}
                aria-label={rowName}
                className={HANDLE}
                style={{ left: spot.rowX, top: spot.rowY }}
                onMouseDown={hold}
              >
                <GripVertical aria-hidden="true" className="size-icon-xs" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="left" onCloseAutoFocus={back}>
              <DropdownMenuLabel>{rowName}</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => addTableRow(editor, id, spot.row, true)}>
                {t.insertRowAbove}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addTableRow(editor, id, spot.row, false)}>
                {t.insertRowBelow}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem tone="danger" onSelect={() => removeTableRow(editor, id, spot.row)}>
                {t.deleteRow}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu onOpenChange={keep}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                tabIndex={-1}
                aria-label={columnName}
                className={HANDLE}
                style={{ left: spot.colX, top: spot.colY }}
                onMouseDown={hold}
              >
                <GripHorizontal aria-hidden="true" className="size-icon-xs" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" onCloseAutoFocus={back}>
              <DropdownMenuLabel>{columnName}</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => addTableColumn(editor, id, spot.col, true)}>
                {t.insertColumnLeft}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addTableColumn(editor, id, spot.col, false)}>
                {t.insertColumnRight}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                tone="danger"
                onSelect={() => removeTableColumn(editor, id, spot.col)}
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
