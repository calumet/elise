import { Button } from "@calumet/elise-ui/button";
import { Checkbox } from "@calumet/elise-ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxLoading,
  ComboboxTrigger,
  ComboboxValue,
} from "@calumet/elise-ui/combobox";
import { Field } from "@calumet/elise-ui/field";
import { Input } from "@calumet/elise-ui/input";
import { SegmentedControl, SegmentedControlItem } from "@calumet/elise-ui/segmented-control";
import { BlockStack, InlineStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";
import { useEditorSelector } from "platejs/react";
import * as React from "react";

import { useLabels } from "../labels";
import { safeHref } from "../urls";
import { useEditorCommands, useLinkUrl } from "./commands";
import { useServices } from "./context";

type Page = { label: string; href: string };

const normalizeAddress = (raw: string): string | undefined => {
  const value = raw.trim();
  if (!value || /\s/.test(value)) return undefined;
  const candidate =
    /^[a-z][a-z0-9+.-]*:/i.test(value) || /^[/#?]/.test(value)
      ? value
      : /^[^@]+@[^@]+\.[^@]+$/.test(value)
        ? `mailto:${value}`
        : `https://${value}`;
  if (/^https?:/i.test(candidate)) {
    try {
      if (!new URL(candidate).hostname.includes(".")) return undefined;
    } catch {
      return undefined;
    }
  }
  return safeHref(candidate);
};

const usePages = (query: string, enabled: boolean): { pages: Page[]; loading: boolean } => {
  const { searchLinks } = useServices();
  const [result, setResult] = React.useState<{ query: string; pages: Page[] } | null>(null);
  React.useEffect(() => {
    if (!searchLinks || !enabled) return;
    let current = true;
    searchLinks(query)
      .then((pages) => current && setResult({ query, pages }))
      .catch(() => current && setResult({ query, pages: [] }));
    return () => {
      current = false;
    };
  }, [searchLinks, query, enabled]);
  return {
    pages: result?.pages ?? [],
    loading: Boolean(searchLinks) && enabled && result?.query !== query,
  };
};

export type LinkFormProps = { onClose: () => void };

export const LinkForm = ({ onClose }: LinkFormProps): React.JSX.Element => {
  const t = useLabels();
  const commands = useEditorCommands();
  const { searchLinks } = useServices();
  const current = useLinkUrl();
  const currentBlank = useEditorSelector((ed) => {
    const link = ed.selection ? ed.api.above({ match: { type: "a" } }) : undefined;
    return (link?.[0] as { target?: string } | undefined)?.target === "_blank";
  }, []);
  const needsText =
    useEditorSelector((ed) => !ed.selection || ed.api.isCollapsed(), []) && current === null;

  const [mode, setMode] = React.useState(searchLinks && !current ? "page" : "address");
  const [address, setAddress] = React.useState(current ?? "");
  const [text, setText] = React.useState("");
  const [newTab, setNewTab] = React.useState(currentBlank);
  const [error, setError] = React.useState<string | undefined>();
  const [page, setPage] = React.useState<Page | undefined>();
  const [query, setQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const { pages, loading } = usePages(query, mode === "page");
  const labelId = React.useId();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const href = mode === "page" ? page?.href : normalizeAddress(address);
    if (!href) {
      if (mode === "address") setError(t.invalidAddress);
      else setSearching(true);
      return;
    }
    const label = text.trim() || (mode === "page" ? page?.label : undefined);
    commands.setLink(href, needsText ? label : undefined, newTab);
    onClose();
  };

  return (
    <form noValidate onSubmit={submit}>
      <BlockStack gap={3}>
        {searchLinks ? (
          <BlockStack gap={2}>
            <Text id={labelId} size="sm" weight="medium">
              {t.linkTo}
            </Text>
            <SegmentedControl
              aria-labelledby={labelId}
              value={mode}
              onValueChange={(next) => {
                setMode(next);
                setError(undefined);
              }}
              className="w-full"
            >
              <SegmentedControlItem value="page" className="flex-1">
                {t.linkPage}
              </SegmentedControlItem>
              <SegmentedControlItem value="address" className="flex-1">
                {t.linkAddress}
              </SegmentedControlItem>
            </SegmentedControl>
          </BlockStack>
        ) : null}

        {mode === "page" ? (
          <Field label={t.page}>
            {(control) => (
              <Combobox
                value={page?.href ?? ""}
                onValueChange={(href) => setPage(pages.find((option) => option.href === href))}
                open={searching}
                onOpenChange={setSearching}
              >
                <ComboboxTrigger {...control}>
                  <ComboboxValue placeholder={t.choosePage}>{page?.label}</ComboboxValue>
                </ComboboxTrigger>
                <ComboboxContent shouldFilter={false}>
                  <ComboboxInput
                    value={query}
                    onValueChange={setQuery}
                    placeholder={t.searchPages}
                  />
                  <ComboboxList>
                    {loading ? (
                      <ComboboxLoading />
                    ) : (
                      <>
                        <ComboboxEmpty>{t.noPages}</ComboboxEmpty>
                        {pages.map((option) => (
                          <ComboboxItem key={option.href} value={option.href}>
                            <span className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                              <span className="truncate">{option.label}</span>
                              <span className="truncate text-xs text-muted-foreground">
                                {option.href}
                              </span>
                            </span>
                          </ComboboxItem>
                        ))}
                      </>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          </Field>
        ) : (
          <Field label={t.address} error={error}>
            {(control) => (
              <Input
                {...control}
                inputMode="url"
                autoComplete="url"
                placeholder="https://"
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value);
                  setError(undefined);
                }}
              />
            )}
          </Field>
        )}

        {needsText ? (
          <Field label={t.linkText}>
            {(control) => (
              <Input {...control} value={text} onChange={(event) => setText(event.target.value)} />
            )}
          </Field>
        ) : null}

        <Checkbox
          label={t.newTab}
          checked={newTab}
          onCheckedChange={(checked) => setNewTab(checked === true)}
        />

        <InlineStack gap={2} justify="end">
          {current !== null ? (
            <Button
              type="button"
              variant="ghost"
              tone="danger"
              size="sm"
              className="me-auto"
              onClick={() => {
                commands.removeLink();
                onClose();
              }}
            >
              {t.removeLink}
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button type="submit" size="sm">
            {t.applyLink}
          </Button>
        </InlineStack>
      </BlockStack>
    </form>
  );
};
