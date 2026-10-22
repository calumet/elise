import type { EditorSchema } from "./types";

export const messageSchema: EditorSchema = {
  name: "message",
  blocks: ["p", "list"],
  marks: ["bold", "italic", "code"],
  links: true,
};

export const documentSchema: EditorSchema = {
  name: "document",
  blocks: [
    ...messageSchema.blocks,
    "h2",
    "h3",
    "blockquote",
    "img",
    "table",
    "callout",
    "hr",
    "media_embed",
  ],
  marks: messageSchema.marks,
  links: true,
};
