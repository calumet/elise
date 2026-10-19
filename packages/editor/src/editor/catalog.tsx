import { Columns2, Megaphone, MessageCircleQuestion, Search, Users, X } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import { Clickable } from "@calumet/elise-ui/clickable";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@calumet/elise-ui/empty-state";
import { SearchField } from "@calumet/elise-ui/search-field";
import { BlockStack } from "@calumet/elise-ui/stack";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@calumet/elise-ui/tabs";
import { Text } from "@calumet/elise-ui/text";
import { useEditorRef } from "platejs/react";
import * as React from "react";

import { useLabels, type Labels } from "../labels";
import { useEditorCommands } from "./commands";
import { ITEMS } from "./insert-menu";
import { openLine, type InsertItem, type InsertItemId } from "./items";
import { isMediaKind, MediaDialogs, type MediaKind } from "./media-dialogs";
import type { TemplateId } from "./templates";

const GROUPS: { label: keyof Labels; ids: InsertItemId[] }[] = [
  { label: "catalogText", ids: ["h2", "h3", "bulleted", "numbered", "quote", "callout"] },
  { label: "catalogLayout", ids: ["columns", "spacer", "divider"] },
  { label: "catalogMedia", ids: ["image", "gallery", "video", "file"] },
  { label: "catalogActions", ids: ["table", "button"] },
];

const RETYPE = new Set<InsertItemId>(["h2", "h3", "bulleted", "numbered", "quote"]);

const TEMPLATE_ICONS: Record<TemplateId, typeof Columns2> = {
  "text-image": Columns2,
  team: Users,
  faq: MessageCircleQuestion,
  "call-to-action": Megaphone,
};

const matches = (query: string, ...parts: string[]): boolean =>
  parts.join(" ").toLowerCase().includes(query.trim().toLowerCase());

const Entry = ({
  Icon,
  label,
  description,
  onPick,
}: {
  Icon: typeof Columns2;
  label: string;
  description: string;
  onPick: () => void;
}): React.JSX.Element => (
  <li>
    <Clickable radius="sm" paddingX={2} paddingY={1} onClick={onPick}>
      <span className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground">
          <Icon aria-hidden="true" className="size-icon-md" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-base font-medium text-foreground">{label}</span>
          <span className="truncate text-xs text-muted-foreground">{description}</span>
        </span>
      </span>
    </Clickable>
  </li>
);

const Empty = ({ query }: { query: string }): React.JSX.Element => {
  const t = useLabels();
  return (
    <EmptyState size="sm">
      <EmptyStateMedia>
        <Search />
      </EmptyStateMedia>
      <EmptyStateTitle>{t.catalogEmpty.replace("{query}", query.trim())}</EmptyStateTitle>
      <EmptyStateDescription>{t.noBlocks}</EmptyStateDescription>
    </EmptyState>
  );
};

export type EditorCatalogProps = {
  className?: string;
  onClose?: () => void;
};

export const EditorCatalog = ({ className, onClose }: EditorCatalogProps): React.JSX.Element => {
  const t = useLabels();
  const editor = useEditorRef();
  const commands = useEditorCommands();
  const headingId = React.useId();
  const [query, setQuery] = React.useState("");
  const [dialog, setDialog] = React.useState<MediaKind | null>(null);

  const pick = (item: InsertItem) => {
    if (isMediaKind(item.id)) {
      openLine(editor);
      setDialog(item.id);
      return;
    }
    if (RETYPE.has(item.id)) openLine(editor);
    commands.insert(item.id, { replace: true });
  };

  const groups = GROUPS.map((group) => ({
    label: t[group.label],
    items: commands.items.filter(
      (item) =>
        group.ids.includes(item.id) &&
        matches(query, item.label, item.keywords, t[ITEMS[item.id].description]),
    ),
  })).filter((group) => group.items.length > 0);
  const templates = commands.templates.filter((template) =>
    matches(query, template.label, template.keywords, template.description),
  );

  return (
    <section
      data-slot="editor-catalog"
      aria-labelledby={headingId}
      className={`flex min-h-0 flex-col gap-3 ${className ?? ""}`.trim()}
    >
      <div className="flex items-center justify-between gap-2">
        <Text as="h2" id={headingId} data-slot="editor-panel-heading" size="lg" weight="semibold">
          {t.addBlock}
        </Text>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t.closePanel}
            className="-me-1.5 text-muted-foreground"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      <SearchField
        label={t.searchCatalog}
        labelHidden
        placeholder={t.searchCatalog}
        value={query}
        onValueChange={setQuery}
      />
      <Tabs defaultValue="blocks" className="flex min-h-0 flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="blocks" className="flex-1">
            {t.catalogBlocks}
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-1">
            {t.templates}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="blocks" className="mt-3 p-0">
          {groups.length ? (
            <BlockStack gap={4}>
              {groups.map((group) => (
                <BlockStack key={group.label} gap={1}>
                  <Text as="h3" size="xs" weight="medium" tone="muted" className="px-2">
                    {group.label}
                  </Text>
                  <ul className="m-0 flex list-none flex-col p-0">
                    {group.items.map((item) => (
                      <Entry
                        key={item.id}
                        Icon={ITEMS[item.id].Icon}
                        label={item.label}
                        description={t[ITEMS[item.id].description]}
                        onPick={() => pick(item)}
                      />
                    ))}
                  </ul>
                </BlockStack>
              ))}
            </BlockStack>
          ) : (
            <Empty query={query} />
          )}
        </TabsContent>
        <TabsContent value="templates" className="mt-3 p-0">
          {templates.length ? (
            <ul className="m-0 flex list-none flex-col p-0">
              {templates.map((template) => (
                <Entry
                  key={template.id}
                  Icon={TEMPLATE_ICONS[template.id]}
                  label={template.label}
                  description={template.description}
                  onPick={() => commands.insertTemplate(template.id)}
                />
              ))}
            </ul>
          ) : (
            <Empty query={query} />
          )}
        </TabsContent>
      </Tabs>
      <MediaDialogs open={dialog} onClose={() => setDialog(null)} />
    </section>
  );
};
