import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Copy,
  Columns2,
  Ellipsis,
  MousePointerClick,
  Plus,
  Trash2,
  X,
} from "@calumet/elise-icons";
import { Box } from "@calumet/elise-ui/box";
import { Button } from "@calumet/elise-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@calumet/elise-ui/dropdown-menu";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@calumet/elise-ui/empty-state";
import { Field } from "@calumet/elise-ui/field";
import { FileUpload } from "@calumet/elise-ui/file-upload";
import { InlineError } from "@calumet/elise-ui/inline-error";
import { Input } from "@calumet/elise-ui/input";
import { NumberField } from "@calumet/elise-ui/number-field";
import { SegmentedControl, SegmentedControlItem } from "@calumet/elise-ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@calumet/elise-ui/select";
import { BlockStack, InlineStack } from "@calumet/elise-ui/stack";
import { Switch } from "@calumet/elise-ui/switch";
import { Text } from "@calumet/elise-ui/text";
import { useEditorRef } from "platejs/react";
import * as React from "react";

import { typeLabel, useLabels, type Labels } from "../labels";
import type { GalleryImage, SettingValue } from "../settings";
import {
  useBlockCommands,
  useOutline,
  useSelectedBlock,
  type BlockSettingField,
  type OutlineNode,
  type SelectedBlock,
} from "./blocks";
import { useEditorCommands } from "./commands";
import { addTableColumn, addTableRow } from "./table";

type ControlProps = {
  field: BlockSettingField;
  set: (value: SettingValue) => boolean;
};

const SEGMENTS = 4;

const RATIO_GLYPHS: Record<string, [string, string]> = {
  equal: ["flex-1", "flex-1"],
  "wide-first": ["flex-2", "flex-1"],
  "wide-second": ["flex-1", "flex-2"],
};

const Choice = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; glyph?: [string, string] }[];
  onChange: (value: string) => void;
}): React.JSX.Element => {
  const id = React.useId();
  return (
    <div className="flex flex-col gap-1.5">
      <span id={id} className="text-sm text-foreground">
        {label}
      </span>
      <SegmentedControl
        aria-labelledby={id}
        value={value}
        onValueChange={onChange}
        className="w-full"
      >
        {options.map((option) => (
          <SegmentedControlItem
            key={option.value}
            value={option.value}
            aria-label={option.glyph ? option.label : undefined}
            className="flex-1"
          >
            {option.glyph ? (
              <span aria-hidden="true" className="flex w-8 gap-0.5">
                <span className={`h-3 rounded-xs bg-current ${option.glyph[0]}`} />
                <span className={`h-3 rounded-xs bg-current ${option.glyph[1]}`} />
              </span>
            ) : (
              option.label
            )}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  );
};

const SelectControl = ({ field, set }: ControlProps): React.JSX.Element => {
  const options = field.options ?? [];
  if (field.key === "ratio") {
    return (
      <Choice
        label={field.label}
        value={String(field.value)}
        options={options.map((option) => ({ ...option, glyph: RATIO_GLYPHS[option.value] }))}
        onChange={set}
      />
    );
  }
  if (options.length <= SEGMENTS) {
    return (
      <Choice label={field.label} value={String(field.value)} options={options} onChange={set} />
    );
  }
  return (
    <Field label={field.label}>
      {(control) => (
        <Select value={String(field.value)} onValueChange={set}>
          <SelectTrigger {...control}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  );
};

const NumberControl = ({ field, set }: ControlProps): React.JSX.Element => {
  const min = field.min ?? 0;
  const max = field.max ?? min;
  if (max - min < SEGMENTS) {
    const options = Array.from({ length: max - min + 1 }, (_, index) => String(min + index));
    return (
      <Choice
        label={field.label}
        value={String(field.value)}
        options={options.map((value) => ({ value, label: value }))}
        onChange={(value) => set(Number(value))}
      />
    );
  }
  return (
    <NumberField
      label={field.label}
      min={min}
      max={max}
      value={String(field.value)}
      onValueChange={(value) => {
        if (value.trim() !== "") set(Number(value));
      }}
    />
  );
};

const AddressControl = ({ field, set }: ControlProps): React.JSX.Element => {
  const t = useLabels();
  const [draft, setDraft] = React.useState(String(field.value));
  const [invalid, setInvalid] = React.useState(false);
  const commit = () => {
    if (draft !== field.value) setInvalid(!set(draft));
  };
  return (
    <Field
      label={field.label}
      error={invalid ? (field.kind === "video" ? t.invalidVideo : t.invalidAddress) : undefined}
    >
      {(control) => (
        <Input
          {...control}
          inputMode="url"
          autoComplete="url"
          placeholder="https://"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setInvalid(false);
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
          }}
        />
      )}
    </Field>
  );
};

const ImagesControl = ({ field, set }: ControlProps): React.JSX.Element => {
  const t = useLabels();
  const commands = useEditorCommands();
  const images = field.value as GalleryImage[];
  const [failed, setFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const add = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    setFailed(false);
    try {
      const uploaded = await Promise.all(files.map((file) => commands.uploadImage(file)));
      set([...images, ...uploaded.map((image) => ({ src: image.src, alt: image.alt ?? "" }))]);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const change = (index: number, next: GalleryImage | null) =>
    set(images.flatMap((image, at) => (at !== index ? [image] : next ? [next] : [])));

  const seen = new Map<string, number>();
  const keys = images.map((image) => {
    const nth = (seen.get(image.src) ?? 0) + 1;
    seen.set(image.src, nth);
    return `${image.src}#${nth}`;
  });

  return (
    <BlockStack gap={2}>
      <Text as="span" size="sm">
        {field.label}
      </Text>
      {images.length ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {images.map((image, index) => (
            <li key={keys[index]} className="flex items-center gap-2">
              <img
                src={image.src}
                alt=""
                className="size-8 shrink-0 rounded-sm border border-border object-cover"
              />
              <Input
                size="sm"
                aria-label={`${t.altText} ${index + 1}`}
                placeholder={t.altText}
                value={image.alt}
                onChange={(event) => change(index, { ...image, alt: event.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`${t.removeImage} ${index + 1}`}
                className="shrink-0 text-muted-foreground"
                onClick={() => change(index, null)}
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      <FileUpload
        multiple
        accept="image/*"
        label={t.addImages}
        hint={t.imagesHint}
        invalid={failed}
        disabled={busy}
        onFiles={(accepted) => void add(accepted)}
      />
      {failed ? <InlineError>{t.uploadFailed}</InlineError> : null}
    </BlockStack>
  );
};

const ALIGN_ICONS: Record<string, typeof AlignLeft> = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
};

const AlignmentsControl = ({ field, set }: ControlProps): React.JSX.Element => {
  const t = useLabels();
  const id = React.useId();
  const values = field.value as string[];
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-2">
      <span id={id} className="text-sm text-foreground">
        {field.label}
      </span>
      {values.map((value, index) => {
        const name = t.columnNumber.replace("{n}", String(index + 1));
        return (
          <div key={name} className="flex items-center justify-between gap-3">
            <Text as="span" size="sm" tone="muted" truncate>
              {name}
            </Text>
            <SegmentedControl
              aria-label={name}
              value={value}
              onValueChange={(next) =>
                set(values.map((current, at) => (at === index ? next : current)))
              }
            >
              {(field.options ?? []).map((option) => {
                const Icon = ALIGN_ICONS[option.value] ?? AlignLeft;
                return (
                  <SegmentedControlItem
                    key={option.value}
                    value={option.value}
                    aria-label={option.label}
                  >
                    <Icon aria-hidden="true" className="size-icon-md" />
                  </SegmentedControlItem>
                );
              })}
            </SegmentedControl>
          </div>
        );
      })}
    </div>
  );
};

const TableActions = ({ id }: { id: string }): React.JSX.Element => {
  const t = useLabels();
  const editor = useEditorRef();
  return (
    <InlineStack gap={2}>
      <Button type="button" variant="outline" size="sm" onClick={() => addTableRow(editor, id)}>
        <Plus aria-hidden="true" />
        {t.addRow}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => addTableColumn(editor, id)}>
        <Plus aria-hidden="true" />
        {t.addColumn}
      </Button>
    </InlineStack>
  );
};

const SettingControl = ({ field, set }: ControlProps): React.JSX.Element => {
  switch (field.kind) {
    case "alignments":
      return <AlignmentsControl field={field} set={set} />;
    case "select":
      return <SelectControl field={field} set={set} />;
    case "number":
      return <NumberControl field={field} set={set} />;
    case "toggle":
      return <Switch label={field.label} checked={Boolean(field.value)} onCheckedChange={set} />;
    case "url":
    case "video":
      return <AddressControl field={field} set={set} />;
    case "images":
      return <ImagesControl field={field} set={set} />;
    case "text":
      return (
        <Field label={field.label}>
          {(control) => (
            <Input
              {...control}
              value={String(field.value)}
              onChange={(event) => set(event.target.value)}
            />
          )}
        </Field>
      );
  }
};

type Destination = { key: string; label: string; target: string; position: "inside" | "after" };

const destinations = (
  t: Labels,
  outline: OutlineNode[],
  selected: SelectedBlock,
): Destination[] => {
  const holder = outline.find((node) =>
    node.children.some((column) => column.children.some((child) => child.id === selected.id)),
  );
  const out: Destination[] = holder
    ? [{ key: "out", label: t.moveOut, target: holder.id, position: "after" }]
    : [];
  const columns = outline
    .filter((node) => node.type === "columns" && node.id !== selected.id)
    .flatMap((node) =>
      node.children
        .filter((column) => column.id !== selected.parentId)
        .map((column) => ({
          key: column.id,
          label: `${node.label} › ${column.label}`,
          target: column.id,
          position: "inside" as const,
        })),
    );
  return [...out, ...columns];
};

const MoveMenu = ({ selected }: { selected: SelectedBlock }): React.JSX.Element | null => {
  const t = useLabels();
  const outline = useOutline();
  const blocks = useBlockCommands();
  const options = destinations(t, outline, selected).filter((option) =>
    blocks.canMoveTo(selected.id, option.target, option.position),
  );
  if (!options.length) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t.moveTo}
          className="text-muted-foreground"
        >
          <Ellipsis aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t.moveTo}</DropdownMenuLabel>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.key}
            onSelect={() => blocks.moveTo(selected.id, option.target, option.position)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export type EditorSettingsProps = { className?: string };

export const EditorSettings = ({ className }: EditorSettingsProps): React.JSX.Element => {
  const t = useLabels();
  const selected = useSelectedBlock();
  const blocks = useBlockCommands();
  const classes = `flex min-h-0 flex-col gap-5 ${className ?? ""}`.trim();

  if (!selected) {
    return (
      <div data-slot="editor-settings" className={classes}>
        <EmptyState size="sm">
          <EmptyStateMedia>
            <MousePointerClick />
          </EmptyStateMedia>
          <EmptyStateTitle>{t.noSelection}</EmptyStateTitle>
          <EmptyStateDescription>{t.noSelectionHint}</EmptyStateDescription>
        </EmptyState>
      </div>
    );
  }

  const count = selected.settings.find((field) => field.key === "count")?.value;
  const fields = selected.settings.filter((field) => field.key !== "ratio" || count === 2);
  const inColumns = selected.type === "column" || selected.parentId !== null;

  return (
    <div data-slot="editor-settings" className={classes}>
      <div className="flex items-center justify-between gap-2">
        <Text as="h2" size="lg" weight="semibold" truncate>
          {typeLabel(t, selected.type)}
        </Text>
        <InlineStack gap={1} wrap={false} className="-me-1.5">
          {selected.movable ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t.moveUp}
                disabled={!selected.canMoveUp}
                className="text-muted-foreground"
                onClick={() => blocks.move(selected.id, "up")}
              >
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t.moveDown}
                disabled={!selected.canMoveDown}
                className="text-muted-foreground"
                onClick={() => blocks.move(selected.id, "down")}
              >
                <ArrowDown aria-hidden="true" />
              </Button>
              <MoveMenu selected={selected} />
            </>
          ) : null}
        </InlineStack>
      </div>

      {inColumns ? (
        <Box background="muted" radius="md" padding={3} className="flex flex-col gap-2">
          <Text size="xs" tone="muted">
            {t.selectParentHint}
          </Text>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() =>
              selected.type === "column" && selected.parentId
                ? blocks.select(selected.parentId)
                : blocks.selectParent()
            }
          >
            <Columns2 aria-hidden="true" />
            {t.selectParent}
          </Button>
        </Box>
      ) : null}

      {fields.map((field) => (
        <SettingControl
          key={`${selected.id}-${field.key}${field.kind === "url" || field.kind === "video" ? `-${String(field.value)}` : ""}`}
          field={field}
          set={(value) => blocks.update(selected.id, { [field.key]: value })}
        />
      ))}

      {selected.type === "table" ? <TableActions id={selected.id} /> : null}

      {selected.movable ? (
        <InlineStack gap={2} wrap={false} className="mt-auto pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => blocks.duplicate(selected.id)}
          >
            <Copy aria-hidden="true" />
            {t.duplicateBlock}
          </Button>
          <Button
            type="button"
            variant="outline"
            tone="danger"
            className="flex-1"
            onClick={() => blocks.remove(selected.id)}
          >
            <Trash2 aria-hidden="true" />
            {t.deleteBlock}
          </Button>
        </InlineStack>
      ) : null}
    </div>
  );
};
