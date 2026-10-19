import { Box } from "@calumet/elise-ui/box";
import { Popover, PopoverAnchor, PopoverContent } from "@calumet/elise-ui/popover";
import { Separator } from "@calumet/elise-ui/separator";
import { Toolbar, ToolbarSeparator } from "@calumet/elise-ui/toolbar";
import { useEditorRef } from "platejs/react";
import * as React from "react";

import { useLabels } from "../labels";
import { EditorContentArea, type EditorContentAreaProps } from "./content";
import { useServices } from "./context";
import { LinkForm } from "./link-form";
import { EditorRoot, type EditorRootProps } from "./root";
import { BAR, EditorToolbar, LinkButton, ListButton, MarkButton } from "./toolbar";

export type EditorProps = Omit<EditorRootProps, "children"> &
  Omit<EditorContentAreaProps, "className" | "renderSlashMenu" | "onSlashPick">;

const COMPOSER =
  "flex w-full flex-col rounded-md border border-input bg-card text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out hover:border-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background";

const ComposerBar = (): React.JSX.Element => {
  const t = useLabels();
  const editor = useEditorRef();
  const { schema } = useServices();
  const [linking, setLinking] = React.useState(false);

  return (
    <Toolbar aria-label={t.formatting} className={`${BAR} p-1`}>
      {schema.marks.map((mark) => (
        <MarkButton key={mark} mark={mark} />
      ))}
      {schema.links ? (
        <Popover open={linking} onOpenChange={setLinking}>
          <PopoverAnchor asChild>
            <LinkButton expanded={linking} onClick={() => setLinking(true)} />
          </PopoverAnchor>
          <PopoverContent
            side="top"
            align="start"
            collisionPadding={16}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              editor.tf.focus();
            }}
          >
            <LinkForm onClose={() => setLinking(false)} />
          </PopoverContent>
        </Popover>
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
        <ComposerBar />
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
} = Object.assign(EditorComposed, {
  Root: EditorRoot,
  Content: EditorContentArea,
  Toolbar: EditorToolbar,
});
