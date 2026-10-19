import { EditorContentArea } from "./editor/content";
import { EditorRoot } from "./editor/root";

export const Editor: { Root: typeof EditorRoot; Content: typeof EditorContentArea } = {
  Root: EditorRoot,
  Content: EditorContentArea,
};

export {
  useBlockActive,
  useEditorCommands,
  useInTable,
  useLinkUrl,
  useListActive,
  useMarkActive,
  type EditorCommands,
} from "./editor/commands";
export type { EditorContentAreaProps } from "./editor/content";
export type { InsertItem, InsertItemId } from "./editor/items";
export { createDocument, type EditorRootProps } from "./editor/root";
export type { SlashMenuState } from "./editor/slash-menu";
export { documentSchema, messageSchema } from "./schema";
export type {
  EditorDocument,
  EditorInline,
  EditorMark,
  EditorNode,
  EditorSchema,
  EditorText,
  Translation,
} from "./types";
