import { PlateContent, useEditorRef } from "platejs/react";
import * as React from "react";

import { useLabels } from "../labels";
import { contentClassName } from "../views";
import { useEditorCommands } from "./commands";
import { useServices } from "./context";
import { InsertButton, InsertMenu } from "./insert-menu";
import type { InsertItem } from "./items";
import { isMediaKind, MediaDialogs, type MediaKind } from "./media-dialogs";
import { PreviewArea, useDevice, usePreviewing } from "./preview";
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

const useImageFiles = (): ((
  event: React.ClipboardEvent | React.DragEvent,
  data: DataTransfer | null,
) => void) => {
  const editor = useEditorRef();
  const commands = useEditorCommands();
  const { schema, onUploadImage } = useServices();
  return (event, data) => {
    const images = Array.from(data?.files ?? []).filter((file) => file.type.startsWith("image/"));
    if (!images.length) return;
    event.preventDefault();
    if (!onUploadImage || !schema.blocks.includes("img")) return;
    if (event.type === "drop") {
      const range = editor.api.findEventRange(event);
      if (range) editor.tf.select(range);
    }
    void images
      .reduce((done, file) => done.then(() => commands.insertImage(file)), Promise.resolve())
      .catch(() => {});
  };
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
  const [dialog, setDialog] = React.useState<MediaKind | null>(null);
  const menu = useSlashMenu(
    onSlashPick ??
      ((item) => {
        if (isMediaKind(item.id)) setDialog(item.id);
      }),
  );
  const longForm = schema.blocks.length > 2;
  const hint = placeholder ?? (longForm ? t.placeholderDocument : t.placeholderMessage);
  const base = `${contentClassName(schema)} outline-none`;
  const page = schema.blocks.includes("columns");
  const previewing = usePreviewing();
  const device = useDevice();
  const takeImages = useImageFiles();

  return (
    <>
      {previewing ? <PreviewArea page={page} /> : null}
      <div
        ref={container}
        hidden={previewing}
        data-device={page ? device : undefined}
        className={page ? "@container/editor-page relative isolate" : "relative"}
      >
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
          onPaste={(event) => takeImages(event, event.clipboardData)}
          onDrop={(event) => takeImages(event, event.dataTransfer)}
          className={className ? `${base} ${className}` : base}
        />
        {renderSlashMenu ? renderSlashMenu(menu) : <InsertMenu menu={menu} />}
        {longForm && !page && !renderSlashMenu ? <InsertButton container={container} /> : null}
        <MediaDialogs open={dialog} onClose={() => setDialog(null)} />
      </div>
    </>
  );
};
