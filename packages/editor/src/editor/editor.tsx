import { Box } from "@calumet/elise-ui/box";
import { Separator } from "@calumet/elise-ui/separator";
import type * as React from "react";

import { EditorSettings } from "./block-settings";
import { EditorCatalog } from "./catalog";
import { EditorContentArea, type EditorContentAreaProps } from "./content";
import { EditorOutline } from "./outline";
import { EditorRoot, type EditorRootProps } from "./root";
import { EditorToolbar, FormatRow } from "./toolbar";

export type EditorProps = Omit<EditorRootProps, "children"> &
  Omit<EditorContentAreaProps, "className" | "renderSlashMenu" | "onSlashPick">;

const COMPOSER =
  "flex w-full flex-col rounded-md border border-input bg-card text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out hover:border-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background";

const EditorComposed = ({
  schema,
  value,
  onChange,
  locales,
  onUploadImage,
  onUploadFile,
  searchLinks,
  className,
  ...content
}: EditorProps): React.JSX.Element => {
  const root = { schema, value, onChange, locales, onUploadImage, onUploadFile, searchLinks };

  if (schema.blocks.length <= 2) {
    return (
      <EditorRoot {...root} className={className ? `${COMPOSER} ${className}` : COMPOSER}>
        <EditorContentArea {...content} className="max-h-60 min-h-10 overflow-y-auto px-3 py-2" />
        <Separator />
        <FormatRow className="p-1" />
      </EditorRoot>
    );
  }

  return (
    <EditorRoot {...root} className={className}>
      <Box
        background="card"
        border
        radius="xl"
        paddingX={4}
        paddingY={6}
        className="sm:px-12 sm:py-10"
      >
        <EditorToolbar />
        <EditorContentArea {...content} className="min-h-40" />
      </Box>
    </EditorRoot>
  );
};

export const Editor: ((props: EditorProps) => React.JSX.Element) & {
  Root: typeof EditorRoot;
  Content: typeof EditorContentArea;
  Toolbar: typeof EditorToolbar;
  Outline: typeof EditorOutline;
  Settings: typeof EditorSettings;
  Catalog: typeof EditorCatalog;
} = Object.assign(EditorComposed, {
  Root: EditorRoot,
  Content: EditorContentArea,
  Toolbar: EditorToolbar,
  Outline: EditorOutline,
  Settings: EditorSettings,
  Catalog: EditorCatalog,
});
