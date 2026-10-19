import {
  Editor,
  pageSchema,
  useEditorCommands,
  type EditorDocument,
  type EditorNode,
} from "@calumet/elise-editor";
import { useTranslation } from "@calumet/elise-i18n";
import {
  ListTree,
  Lock,
  Monitor,
  Moon,
  Plus,
  Redo2,
  SlidersHorizontal,
  Smartphone,
  Sun,
  Undo2,
} from "@calumet/elise-icons";
import { useTheme } from "@calumet/elise-themes";
import {
  AppShell,
  AppShellHeader,
  AppShellHeaderAction,
  AppShellHeaderActions,
  AppShellHeaderBrand,
  AppShellMain,
} from "@calumet/elise-ui/app-shell";
import { Badge } from "@calumet/elise-ui/badge";
import { Box } from "@calumet/elise-ui/box";
import { Button } from "@calumet/elise-ui/button";
import { Container } from "@calumet/elise-ui/container";
import { Heading } from "@calumet/elise-ui/heading";
import { SegmentedControl, SegmentedControlItem } from "@calumet/elise-ui/segmented-control";
import { Separator } from "@calumet/elise-ui/separator";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from "@calumet/elise-ui/sheet";
import { Text } from "@calumet/elise-ui/text";
import { useState, useSyncExternalStore, type ReactNode } from "react";

type View = "desktop" | "mobile";
type Side = "settings" | "catalog";

const useMinWidth = (query: string): boolean =>
  useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
  );

const text = (id: string, type: string, content: string, extra = {}): EditorNode => ({
  id,
  type,
  ...extra,
  children: [{ text: content }],
});

const solid = (id: string, type: string, extra: Record<string, unknown>): EditorNode => ({
  id,
  type,
  ...extra,
  children: [{ text: "" }],
});

const row = (id: string, kind: "th" | "td", cells: string[]): EditorNode => ({
  id,
  type: "tr",
  children: cells.map((cell, index) => ({
    id: `${id}-${index}`,
    type: kind,
    children: [text(`${id}-${index}-p`, "p", cell)],
  })),
});

const photo = (): string => {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 420;
  const brush = canvas.getContext("2d");
  if (brush) {
    brush.fillStyle = "#0f766e";
    brush.fillRect(0, 0, 640, 420);
    brush.fillStyle = "#ffffff";
    brush.font = "28px sans-serif";
    brush.textAlign = "center";
    brush.fillText("Laboratorio", 320, 220);
  }
  return canvas.toDataURL("image/png");
};

const createPage = (): EditorDocument => ({
  version: 1,
  locale: "es-CO",
  content: [
    text(
      "intro",
      "p",
      "La escuela recibe aspirantes dos veces al año. Aquí están las fechas, los requisitos y a quién escribir si tienes dudas.",
    ),
    {
      id: "cols",
      type: "columns",
      ratio: "equal",
      gap: "medium",
      align: "top",
      background: "none",
      stack: true,
      children: [
        {
          id: "c1",
          type: "column",
          children: [
            solid("foto", "img", {
              url: photo(),
              alt: "Estudiantes en el laboratorio",
              caption: "El laboratorio abre los sábados.",
            }),
          ],
        },
        {
          id: "c2",
          type: "column",
          children: [
            text("req", "h3", "Requisitos"),
            text("r1", "p", "Resultado de la prueba Saber 11", {
              listStyleType: "disc",
              indent: 1,
            }),
            text("r2", "p", "Documento de identidad", { listStyleType: "disc", indent: 1 }),
            text("r3", "p", "Formulario de inscripción diligenciado", {
              listStyleType: "disc",
              indent: 1,
            }),
            solid("inscribirse", "button", {
              label: "Inscribirse",
              href: "/inscripciones",
              variant: "primary",
            }),
          ],
        },
      ],
    },
    text("calendario", "h2", "Calendario"),
    {
      id: "fechas",
      type: "table",
      children: [
        row("fechas-0", "th", ["Etapa", "Fecha"]),
        row("fechas-1", "td", ["Inscripciones", "2 de febrero"]),
        row("fechas-2", "td", ["Lista de admitidos", "16 de marzo"]),
        row("fechas-3", "td", ["Matrícula", "6 de abril"]),
      ],
    },
    solid("espacio", "spacer", { size: "medium" }),
    {
      id: "aviso",
      type: "callout",
      tone: "info",
      children: [
        text("aviso-p", "p", "¿Dudas sobre el proceso? Escribe a admisiones@calumet.edu.co."),
      ],
    },
    solid("guia", "file", {
      src: "/archivos/guia.pdf",
      name: "Guía del aspirante.pdf",
      size: 204800,
    }),
  ],
});

const uploadImage = (file: File): Promise<{ src: string; alt?: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ src: String(reader.result) });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const uploadFile = (file: File): Promise<{ src: string; name: string; size?: number }> =>
  Promise.resolve({
    src: `/archivos/${encodeURIComponent(file.name)}`,
    name: file.name,
    size: file.size,
  });

const ThemeAction = () => {
  const { t } = useTranslation("pageEditor");
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <AppShellHeaderAction
      label={
        dark
          ? t("lightTheme", { fallback: "Light theme" })
          : t("darkTheme", { fallback: "Dark theme" })
      }
      icon={dark ? <Sun /> : <Moon />}
      onClick={() => setTheme(dark ? "light" : "dark")}
    />
  );
};

const IconButton = ({
  label,
  onClick,
  pressed,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  className?: string;
  children: ReactNode;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    aria-label={label}
    aria-pressed={pressed}
    className={`text-muted-foreground aria-pressed:bg-accent aria-pressed:text-accent-foreground ${className ?? ""}`}
    onClick={onClick}
  >
    {children}
  </Button>
);

const PageBar = ({
  view,
  onView,
  side,
  onSide,
  onOutline,
  outlineDocked,
  sideDocked,
}: {
  view: View;
  onView: (view: View) => void;
  side: Side;
  onSide: (side: Side) => void;
  onOutline: () => void;
  outlineDocked: boolean;
  sideDocked: boolean;
}) => {
  const { t } = useTranslation("pageEditor");
  const commands = useEditorCommands();
  return (
    <div className="flex min-h-14 shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-card px-4 py-2">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 items-center gap-2">
          <Text as="p" size="base" weight="semibold" truncate>
            {t("pageName", { fallback: "Admissions" })}
          </Text>
          <Badge tone="warning" size="sm">
            {t("draft", { fallback: "Draft" })}
          </Badge>
        </div>
        <Text size="xs" tone="muted" truncate>
          {t("saved", { fallback: "Saved just now" })}
        </Text>
      </div>
      <SegmentedControl
        aria-label={t("view", { fallback: "View" })}
        value={view}
        onValueChange={(next) => onView(next as View)}
        className="max-md:hidden"
      >
        <SegmentedControlItem value="desktop" aria-label={t("desktop", { fallback: "Desktop" })}>
          <Monitor aria-hidden="true" className="size-icon-md" />
        </SegmentedControlItem>
        <SegmentedControlItem value="mobile" aria-label={t("mobile", { fallback: "Mobile" })}>
          <Smartphone aria-hidden="true" className="size-icon-md" />
        </SegmentedControlItem>
      </SegmentedControl>
      <div className="flex items-center gap-1">
        {outlineDocked ? null : (
          <IconButton label={t("structure", { fallback: "Page structure" })} onClick={onOutline}>
            <ListTree aria-hidden="true" />
          </IconButton>
        )}
        <IconButton
          label={t("addBlock", { fallback: "Add block" })}
          pressed={sideDocked ? side === "catalog" : undefined}
          onClick={() => onSide(sideDocked && side === "catalog" ? "settings" : "catalog")}
        >
          <Plus aria-hidden="true" />
        </IconButton>
        {sideDocked ? null : (
          <IconButton
            label={t("blockSettings", { fallback: "Block settings" })}
            onClick={() => onSide("settings")}
          >
            <SlidersHorizontal aria-hidden="true" />
          </IconButton>
        )}
        <IconButton
          label={t("undo", { fallback: "Undo" })}
          className="max-sm:hidden"
          onClick={commands.undo}
        >
          <Undo2 aria-hidden="true" />
        </IconButton>
        <IconButton
          label={t("redo", { fallback: "Redo" })}
          className="max-sm:hidden"
          onClick={commands.redo}
        >
          <Redo2 aria-hidden="true" />
        </IconButton>
      </div>
      <Separator orientation="vertical" className="h-6 max-sm:hidden" />
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" className="max-sm:hidden">
          {t("preview", { fallback: "Preview" })}
        </Button>
        <Button type="button" size="sm">
          {t("publish", { fallback: "Publish" })}
        </Button>
      </div>
    </div>
  );
};

const PageEditorDemo = () => {
  const { t } = useTranslation("pageEditor");
  const [page, setPage] = useState(createPage);
  const [view, setView] = useState<View>("desktop");
  const [side, setSide] = useState<Side>("settings");
  const [sheet, setSheet] = useState<"outline" | Side | null>(null);
  const outlineDocked = useMinWidth("(min-width: 80rem)");
  const sideDocked = useMinWidth("(min-width: 64rem)");

  const sidePanel =
    side === "catalog" ? (
      <Editor.Catalog onClose={sideDocked ? () => setSide("settings") : undefined} />
    ) : (
      <Editor.Settings className="min-h-full" />
    );

  return (
    <AppShell>
      <AppShellHeader>
        <AppShellHeaderBrand>
          <Text size="lg" weight="bold">
            Calumet
          </Text>
          <Text size="sm" tone="muted">
            {t("pages", { fallback: "Pages" })}
          </Text>
        </AppShellHeaderBrand>
        <AppShellHeaderActions className="ms-auto">
          <ThemeAction />
        </AppShellHeaderActions>
      </AppShellHeader>
      <AppShellMain fill>
        <Editor.Root
          schema={pageSchema}
          value={page}
          onChange={(next) => {
            setPage(next);
            if (sheet === "catalog") setSheet(null);
          }}
          onUploadImage={uploadImage}
          onUploadFile={uploadFile}
          className="flex min-h-0 flex-1 flex-col"
        >
          <PageBar
            view={view}
            onView={setView}
            side={side}
            onSide={(next) => {
              setSide(next);
              if (!sideDocked) setSheet(next);
            }}
            onOutline={() => setSheet("outline")}
            outlineDocked={outlineDocked}
            sideDocked={sideDocked}
          />
          <div className="flex min-h-0 flex-1">
            {outlineDocked ? (
              <aside
                aria-label={t("structure", { fallback: "Page structure" })}
                className="w-60 shrink-0 overflow-y-auto border-e border-border bg-card p-3"
              >
                <Editor.Outline className="min-h-full" />
              </aside>
            ) : null}
            <div className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
              <Container size={view === "mobile" ? "xs" : "sm"} gutter={false}>
                <Box
                  background="card"
                  border
                  radius="xl"
                  paddingX={4}
                  paddingY={6}
                  className={view === "mobile" ? undefined : "sm:px-12 sm:py-10"}
                >
                  <div className="mb-6 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Heading level={1}>{t("pageName", { fallback: "Admissions" })}</Heading>
                      <Lock
                        role="img"
                        aria-label={t("titleLocked", { fallback: "Fixed title" })}
                        className="size-icon-sm shrink-0 text-muted-foreground"
                      />
                    </div>
                    <Text size="xs" tone="muted">
                      {t("titleHint", { fallback: "The title is the one of the menu entry." })}
                    </Text>
                  </div>
                  <Editor.Content
                    aria-label={t("content", { fallback: "Page content" })}
                    className="min-h-40"
                  />
                </Box>
              </Container>
            </div>
            {sideDocked ? (
              <aside
                aria-label={
                  side === "catalog"
                    ? t("addBlock", { fallback: "Add block" })
                    : t("blockSettings", { fallback: "Block settings" })
                }
                className="w-80 shrink-0 overflow-y-auto border-s border-border bg-card p-4"
              >
                {sidePanel}
              </aside>
            ) : null}
          </div>
          <Sheet open={sheet !== null} onOpenChange={(open) => !open && setSheet(null)}>
            <SheetContent side={sheet === "outline" ? "left" : "right"}>
              <SheetHeader>
                <SheetTitle>
                  {sheet === "outline"
                    ? t("structure", { fallback: "Page structure" })
                    : sheet === "catalog"
                      ? t("addBlock", { fallback: "Add block" })
                      : t("blockSettings", { fallback: "Block settings" })}
                </SheetTitle>
              </SheetHeader>
              <SheetBody className="[&_[data-slot=editor-panel-heading]]:sr-only">
                {sheet === "outline" ? (
                  <Editor.Outline />
                ) : sheet === "catalog" ? (
                  <Editor.Catalog />
                ) : (
                  <Editor.Settings />
                )}
              </SheetBody>
            </SheetContent>
          </Sheet>
        </Editor.Root>
      </AppShellMain>
    </AppShell>
  );
};

export default PageEditorDemo;
