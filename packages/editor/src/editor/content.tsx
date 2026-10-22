import { PlateContent } from "platejs/react";
import * as React from "react";

import { useLabels } from "../labels";
import { contentClassName } from "../views";
import { useServices } from "./context";
import { InsertButton, InsertMenu } from "./insert-menu";
import type { InsertItem } from "./items";
import { ImageDialog, VideoDialog } from "./media-dialogs";
import { useSlashMenu, type SlashMenuState } from "./slash-menu";

export type EditorContentAreaProps = {
  placeholder?: string;
  className?: string;
  renderSlashMenu?: (menu: SlashMenuState) => React.ReactNode;
  onSlashPick?: (item: InsertItem) => void;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
};

export const EditorContentArea = ({
  placeholder,
  className,
  renderSlashMenu,
  onSlashPick,
  ...aria
}: EditorContentAreaProps): React.JSX.Element => {
  const t = useLabels();
  const { schema } = useServices();
  const container = React.useRef<HTMLDivElement>(null);
  const [dialog, setDialog] = React.useState<"image" | "video" | null>(null);
  const menu = useSlashMenu(
    onSlashPick ??
      ((item) => {
        if (item.id === "image" || item.id === "video") setDialog(item.id);
      }),
  );
  const longForm = schema.blocks.length > 2;
  const hint = placeholder ?? (longForm ? t.placeholderDocument : t.placeholderMessage);
  const base = `${contentClassName(schema)} outline-none`;

  return (
    <div ref={container} className="relative">
      <PlateContent
        {...aria}
        placeholder={hint}
        renderPlaceholder={({ attributes, children }) => (
          <span
            {...attributes}
            style={{ ...attributes.style, opacity: 1 }}
            className="text-muted-foreground"
          >
            {children}
          </span>
        )}
        aria-controls={menu.open ? menu.id : undefined}
        aria-activedescendant={
          menu.open && menu.matches.length ? menu.optionId(menu.active) : undefined
        }
        onKeyDown={menu.onKeyDown}
        className={className ? `${base} ${className}` : base}
      />
      {renderSlashMenu ? renderSlashMenu(menu) : <InsertMenu menu={menu} />}
      {longForm && !renderSlashMenu ? <InsertButton container={container} /> : null}
      <ImageDialog open={dialog === "image"} onOpenChange={(open) => !open && setDialog(null)} />
      <VideoDialog open={dialog === "video"} onOpenChange={(open) => !open && setDialog(null)} />
    </div>
  );
};
