import { Alert } from "@calumet/elise-ui/alert";
import { PlateContent, useEditorRef, usePluginOption } from "platejs/react";
import * as React from "react";

import { fill, useLabels } from "../labels";
import { contentClassName } from "../views";
import { useEditorCommands } from "./commands";
import { useServices } from "./context";
import { InsertButton, InsertMenu } from "./insert-menu";
import type { InsertItem } from "./items";
import { isMediaKind, MediaDialogs, type MediaKind } from "./media-dialogs";
import { PasteNoticePlugin } from "./plugins";
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

const PasteNotice = (): React.JSX.Element | null => {
  const t = useLabels();
  const editor = useEditorRef();
  const missing = usePluginOption(PasteNoticePlugin, "missing");
  if (!missing) return null;
  return (
    <Alert
      tone="warning"
      data-slot="editor-paste-notice"
      className="sticky top-2 z-sticky mb-4"
      onDismiss={() => editor.setOption(PasteNoticePlugin, "missing", 0)}
    >
      {missing === 1 ? t.pastedWithoutFileOne : fill(t.pastedWithoutFile, { count: missing })}
    </Alert>
  );
};

const renderPlaceholder: React.ComponentProps<typeof PlateContent>["renderPlaceholder"] = ({
  attributes,
  children,
}) => (
  <span
    {...attributes}
    style={{ ...attributes.style, opacity: 1 }}
    className="text-muted-foreground"
  >
    {children}
  </span>
);

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
      {previewing ? <PreviewArea page={page} /> : <PasteNotice />}
      <div
        ref={container}
        hidden={previewing}
        data-device={page ? device : undefined}
        className={page ? "@container/editor-page relative isolate" : "relative"}
      >
        <PlateContent
          {...aria}
          placeholder={hint}
          renderPlaceholder={renderPlaceholder}
          style={{ minHeight: undefined }}
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
