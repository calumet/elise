import {
  Heading2,
  Heading3,
  Image,
  Info,
  List,
  ListOrdered,
  Minus,
  Plus,
  Quote,
  SquarePlay,
  Table,
} from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@calumet/elise-ui/popover";
import { Separator } from "@calumet/elise-ui/separator";
import { KEYS, NodeApi } from "platejs";
import { useEditorRef, useEditorSelector } from "platejs/react";
import * as React from "react";

import { useLabels, type Labels } from "../labels";
import { blockAnchor } from "./anchor";
import { useEditorFocused } from "./focus";
import type { InsertItemId } from "./items";
import type { SlashMenuState } from "./slash-menu";

const ITEMS: Record<InsertItemId, { Icon: typeof Plus; description: keyof Labels }> = {
  h2: { Icon: Heading2, description: "heading2Description" },
  h3: { Icon: Heading3, description: "heading3Description" },
  bulleted: { Icon: List, description: "bulletedListDescription" },
  numbered: { Icon: ListOrdered, description: "numberedListDescription" },
  quote: { Icon: Quote, description: "quoteDescription" },
  image: { Icon: Image, description: "imageDescription" },
  table: { Icon: Table, description: "tableDescription" },
  callout: { Icon: Info, description: "calloutDescription" },
  divider: { Icon: Minus, description: "dividerDescription" },
  video: { Icon: SquarePlay, description: "videoDescription" },
};

const preventFocus = (event: Event): void => event.preventDefault();

export const InsertMenu = ({ menu }: { menu: SlashMenuState }): React.JSX.Element => {
  const t = useLabels();
  const editor = useEditorRef();
  const block = useEditorSelector((ed) => ed.selection?.anchor.path[0] ?? null, []);
  const anchor = React.useMemo(
    () => (block === null ? undefined : blockAnchor(editor, [block])),
    [editor, block],
  );
  const activeId = menu.open ? menu.optionId(menu.active) : null;

  React.useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  return (
    <Popover open={menu.open}>
      <PopoverAnchor virtualRef={anchor ? { current: anchor } : undefined} />
      <PopoverContent
        side="bottom"
        align="start"
        collisionPadding={16}
        className="p-1"
        onOpenAutoFocus={preventFocus}
        onCloseAutoFocus={preventFocus}
      >
        <div
          id={menu.id}
          role="listbox"
          aria-label={t.insertBlock}
          className="max-h-80 overflow-y-auto"
        >
          {menu.matches.length === 0 ? (
            <p className="px-3 py-6 text-center text-base text-muted-foreground">{t.noBlocks}</p>
          ) : (
            menu.matches.map((item, index) => {
              const { Icon, description } = ITEMS[item.id];
              const active = index === menu.active;
              return (
                <div
                  key={item.id}
                  id={menu.optionId(index)}
                  role="option"
                  tabIndex={-1}
                  aria-selected={active}
                  data-selected={active || undefined}
                  className="flex cursor-pointer items-center gap-3 rounded-sm px-3 py-1.5 select-none data-selected:bg-state-hover"
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => {
                    if (!active) menu.setActive(index);
                  }}
                  onClick={() => menu.pick(index)}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground">
                    <Icon aria-hidden="true" className="size-icon-md" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-base font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{t[description]}</span>
                  </span>
                </div>
              );
            })
          )}
        </div>
        <div aria-hidden="true" className="pointer-coarse:hidden">
          <Separator className="my-1" />
          <p className="px-3 py-1.5 text-xs text-muted-foreground">{t.menuHint}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const InsertButton = ({
  container,
}: {
  container: React.RefObject<HTMLDivElement | null>;
}): React.JSX.Element | null => {
  const t = useLabels();
  const editor = useEditorRef();
  const focused = useEditorFocused();
  const block = useEditorSelector((ed) => {
    if (!ed.selection || !ed.api.isCollapsed()) return null;
    const entry = ed.api.block();
    if (!entry || entry[1].length !== 1 || entry[0].type !== KEYS.p) return null;
    return entry[0].listStyleType || NodeApi.string(entry[0]) !== "" ? null : entry[1][0];
  }, []);
  const place = React.useCallback(
    (button: HTMLButtonElement | null) => {
      const entry = button && block !== null ? editor.api.node([block]) : undefined;
      const element = entry ? editor.api.toDOMNode(entry[0]) : undefined;
      const frame = container.current?.getBoundingClientRect();
      if (!button || !element || !frame) return;
      const box = element.getBoundingClientRect();
      const line = Number.parseFloat(getComputedStyle(element).lineHeight) || box.height;
      button.style.top = `${box.top - frame.top + line / 2}px`;
      button.style.left = `${box.left - frame.left}px`;
    },
    [block, container, editor],
  );

  if (!focused || block === null) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={t.insertBlock}
      tabIndex={-1}
      className="absolute -ms-2 -translate-x-full -translate-y-1/2 text-muted-foreground max-sm:hidden"
      ref={place}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        editor.tf.select(editor.api.start([block]) ?? undefined);
        editor.tf.insertText("/");
        editor.tf.focus();
      }}
    >
      <Plus aria-hidden="true" />
    </Button>
  );
};
