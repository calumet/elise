import { useElTranslate } from "./i18n";

const DEFAULTS = {
  bulletedList: "Bulleted list",
  numberedList: "Numbered list",
  heading2: "Heading 2",
  heading3: "Heading 3",
  quote: "Quote",
  image: "Image",
  table: "Table",
  callout: "Callout",
  divider: "Divider",
  video: "Video",
  placeholderMessage: "Write a message",
  placeholderDocument: "Write something, or type / for blocks",
};

export type Labels = Record<keyof typeof DEFAULTS, string>;

export const useLabels = (): Labels => {
  const translate = useElTranslate("editor");
  return Object.fromEntries(
    Object.entries(DEFAULTS).map(([key, fallback]) => [key, translate(key, fallback)]),
  ) as Labels;
};
