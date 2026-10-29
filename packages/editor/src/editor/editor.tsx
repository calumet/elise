import { Box } from "@calumet/elise-ui/box";
import { Separator } from "@calumet/elise-ui/separator";
import * as React from "react";

import { EditorBlockPanel, type EditorBlockPanelProps } from "./block-panel";
import { EditorCatalog, type EditorCatalogProps } from "./catalog";
import { EditorCode, EditorModeSwitch } from "./code";
import { EditorContentArea, type EditorContentAreaProps } from "./content";
import { EditorOutline, type EditorOutlineProps } from "./outline";
import { EditorPreviewButton, usePreviewing } from "./preview";
import { EditorRoot, type EditorRootProps } from "./root";
import {
  EditorToolbar,
  FormatRow as EditorFormatRow,
  type EditorFormatRowProps,
  type EditorToolbarProps,
} from "./toolbar";
import { EditorTranslations, EditorTranslationsButton } from "./translations";

export type EditorProps = Omit<EditorRootProps, "children"> &
  Omit<EditorContentAreaProps, "className" | "renderSlashMenu" | "onSlashPick">;

const COMPOSER =
  "flex w-full flex-col rounded-md border border-input bg-card text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out hover:border-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background";

type EditingOnly<P> = (props: P) => React.JSX.Element | null;

const whileEditing = <P extends object>(
  Component: (props: P) => React.JSX.Element,
): EditingOnly<P> => {
  const Editing = (props: P): React.JSX.Element | null =>
    usePreviewing() ? null : <Component {...props} />;
  return Editing;
};

const Toolbar: EditingOnly<EditorToolbarProps> = whileEditing(EditorToolbar);
const FormatRow: EditingOnly<EditorFormatRowProps> = whileEditing(EditorFormatRow);
const Outline: EditingOnly<EditorOutlineProps> = whileEditing(EditorOutline);
const BlockPanel: EditingOnly<EditorBlockPanelProps> = whileEditing(EditorBlockPanel);
const Catalog: EditingOnly<EditorCatalogProps> = whileEditing(EditorCatalog);

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
        <Toolbar />
        <EditorContentArea {...content} className="min-h-40" />
      </Box>
    </EditorRoot>
  );
};

export const Editor: ((props: EditorProps) => React.JSX.Element) & {
  Root: typeof EditorRoot;
  Content: typeof EditorContentArea;
  Toolbar: typeof Toolbar;
  FormatRow: typeof FormatRow;
  Outline: typeof Outline;
  BlockPanel: typeof BlockPanel;
  Catalog: typeof Catalog;
  PreviewButton: typeof EditorPreviewButton;
  ModeSwitch: typeof EditorModeSwitch;
  Code: typeof EditorCode;
  TranslationsButton: typeof EditorTranslationsButton;
  Translations: typeof EditorTranslations;
} = Object.assign(EditorComposed, {
  ModeSwitch: EditorModeSwitch,
  Code: EditorCode,
  TranslationsButton: EditorTranslationsButton,
  Translations: EditorTranslations,
  Root: EditorRoot,
  Content: EditorContentArea,
  Toolbar,
  FormatRow,
  Outline,
  BlockPanel,
  Catalog,
  PreviewButton: EditorPreviewButton,
});
