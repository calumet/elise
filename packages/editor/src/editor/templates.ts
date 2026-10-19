import { KEYS, type TElement } from "platejs";

import { newId } from "../ids";
import { useLabels, type Labels } from "../labels";
import type { EditorSchema } from "../types";
import { buildButton, buildColumns } from "./items";
import { buildColumn } from "./structure";

export type TemplateId = "text-image" | "team" | "faq" | "call-to-action";

export type TemplateItem = {
  id: TemplateId;
  label: string;
  description: string;
  keywords: string;
};

type TemplateDef = {
  id: TemplateId;
  label: keyof Labels;
  description: keyof Labels;
  keywords: string;
  requires: readonly string[];
  build: (t: Labels) => TElement[];
};

const text = (type: string, content: string): TElement => ({
  id: newId(),
  type,
  children: [{ text: content }],
});

const columnsOf = (count: number, fill: (index: number) => TElement[], extra = {}): TElement => ({
  ...buildColumns(count, extra),
  children: Array.from({ length: count }, (_, index) => buildColumn(fill(index))),
});

export const templateDefs: readonly TemplateDef[] = [
  {
    id: "text-image",
    label: "templateTextImage",
    description: "templateTextImageDescription",
    keywords: "text image picture columns story",
    requires: ["columns", "h2", "img"],
    build: (t) => [
      columnsOf(2, (index) =>
        index === 0
          ? [text("h2", t.templateTitle), text(KEYS.p, t.templateBody)]
          : [text(KEYS.p, t.templateImageHint)],
      ),
    ],
  },
  {
    id: "team",
    label: "templateTeam",
    description: "templateTeamDescription",
    keywords: "team people staff members columns",
    requires: ["columns", "h3"],
    build: (t) => [columnsOf(3, () => [text("h3", t.templateName), text(KEYS.p, t.templateRole)])],
  },
  {
    id: "faq",
    label: "templateFaq",
    description: "templateFaqDescription",
    keywords: "faq questions answers",
    requires: ["h2", "h3"],
    build: (t) => [
      text("h2", t.templateFaqTitle),
      ...[0, 1, 2].flatMap(() => [text("h3", t.templateQuestion), text(KEYS.p, t.templateAnswer)]),
    ],
  },
  {
    id: "call-to-action",
    label: "templateCallToAction",
    description: "templateCallToActionDescription",
    keywords: "call to action cta invitation button",
    requires: ["columns", "h2", "button"],
    build: (t) => [
      columnsOf(
        1,
        () => [
          text("h2", t.templateCtaTitle),
          text(KEYS.p, t.templateCtaBody),
          buildButton(t.templateCtaButton),
        ],
        { background: "featured" },
      ),
    ],
  },
];

export const useTemplates = (schema: EditorSchema): TemplateItem[] => {
  const t = useLabels();
  return templateDefs
    .filter((def) => def.requires.every((block) => schema.blocks.includes(block)))
    .map((def) => ({
      id: def.id,
      label: t[def.label],
      description: t[def.description],
      keywords: def.keywords,
    }));
};
