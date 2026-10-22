import { renderToStaticMarkup } from "react-dom/server";

import type { EditorDocument, EditorSchema } from "../types";
import { EditorContent } from "./content";

export type ToHtmlOptions = { schema: EditorSchema; locale?: string };

export const toHtml = (doc: EditorDocument, { schema, locale }: ToHtmlOptions): string =>
  renderToStaticMarkup(<EditorContent value={doc} schema={schema} locale={locale} />);
