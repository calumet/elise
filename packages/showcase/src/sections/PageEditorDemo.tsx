import {
  Editor,
  pageSchema,
  useBlockCommands,
  useEditorCommands,
  useEditorMode,
  useEditorPreview,
  useSelectedBlock,
  type EditorDocument,
  type EditorNode,
} from "@calumet/elise-editor";
import { useTranslation } from "@calumet/elise-i18n";
import {
  ListTree,
  Lock,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
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
import { useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";

type View = ReturnType<typeof useEditorPreview>["device"];
type Side = "settings" | "catalog";
type Sheeted = "outline" | Side | null;
type Dataset = "demo" | "worst" | "empty" | "many" | "columns";

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

const lines = (id: string, ...children: EditorNode[]): EditorNode => ({
  id,
  type: "text",
  children,
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
    lines("intro", {
      id: "intro-p",
      type: "p",
      children: [
        { text: "La escuela recibe aspirantes " },
        { text: "dos veces al año", bold: true },
        {
          text: ". Aquí están las fechas, los requisitos y a quién escribir si tienes dudas.",
        },
      ],
    }),
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
            text("req-h", "h3", "Requisitos"),
            lines(
              "req",
              text("r1", "p", "Resultado de la prueba Saber 11", {
                listStyleType: "disc",
                indent: 1,
              }),
              text("r2", "p", "Documento de identidad", { listStyleType: "disc", indent: 1 }),
              text("r3", "p", "Formulario de inscripción diligenciado", {
                listStyleType: "disc",
                indent: 1,
              }),
            ),
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
    lines(
      "calendario-t",
      text(
        "calendario-p",
        "p",
        "Las fechas pueden cambiar. Revisa esta página antes de inscribirte.",
      ),
    ),
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
        {
          id: "aviso-p",
          type: "p",
          children: [
            { text: "¿Dudas sobre el proceso? Escribe a " },
            {
              id: "aviso-a",
              type: "a",
              url: "mailto:admisiones@calumet.edu.co",
              children: [{ text: "admisiones@calumet.edu.co" }],
            },
            { text: "." },
          ],
        },
      ],
    },
    solid("guia", "file", {
      src: "/archivos/guia.pdf",
      name: "Guía del aspirante.pdf",
      size: 204800,
    }),
  ],
  translations: {
    "en-US": {
      "intro-p": [
        { text: "The school admits applicants " },
        { text: "twice a year", bold: true },
        {
          text: ". Here are the dates, the requirements and who to write to if you have questions.",
        },
      ],
      "foto#alt": "Students in the lab",
      "req-h": "Requirements",
      r1: "Saber 11 test results",
      r2: "ID document",
      "inscribirse#label": "Apply",
      "calendario-p": "Dates may change.",
    },
  },
  translatedFrom: { "en-US": { "calendario-p": "outdated" } },
});

const LOCALES = ["es-CO", "en-US", "pt-BR"];

const column = (id: string, ...children: EditorNode[]): EditorNode => ({
  id,
  type: "column",
  children,
});

const createWorstPage = (): EditorDocument => ({
  version: 1,
  locale: "es-CO",
  content: [
    lines(
      "w-intro",
      text(
        "w-intro-p",
        "p",
        "Aleksandra Wiśniewska-Kowalczyk, coordinadora de admisiones internacionales, responde las solicitudes de transferencia externa en un plazo máximo de quince días hábiles contados desde la radicación completa de los documentos.",
      ),
    ),
    text(
      "w-h2",
      "h2",
      "Calendario de admisiones para el segundo semestre académico de 2027 y convocatorias extraordinarias",
    ),
    {
      id: "w-four",
      type: "columns",
      ratio: "equal",
      gap: "small",
      align: "top",
      background: "card",
      stack: true,
      children: [
        column("w-c1", text("w-c1h", "h3", "Requisitos para aspirantes internacionales")),
        column(
          "w-c2",
          lines(
            "w-c2t",
            text(
              "w-c2p",
              "p",
              "https://admisiones.universidad-industrial-de-santander.edu.co/convocatorias/2027/segundo-semestre/requisitos-aspirantes-internacionales.pdf",
            ),
          ),
        ),
        column(
          "w-c3",
          solid("w-c3b", "button", {
            label: "Descargar el formulario de inscripción para transferencia externa",
            href: "/formularios/transferencia",
            variant: "secondary",
          }),
        ),
        column(
          "w-c4",
          solid("w-c4f", "file", {
            src: "/archivos/formulario.pdf",
            name: "Formulario-de-inscripción-transferencia-externa-2027-segundo-semestre-v12-final.pdf",
            size: 48_734_208,
          }),
        ),
      ],
    },
    {
      id: "w-empty",
      type: "columns",
      ratio: "equal",
      gap: "medium",
      align: "top",
      background: "none",
      stack: true,
      children: [
        column("w-e1", lines("w-e1t", text("w-e1p", "p", ""))),
        column("w-e2", lines("w-e2t", text("w-e2p", "p", ""))),
        column("w-e3", lines("w-e3t", text("w-e3p", "p", ""))),
      ],
    },
    solid("w-button", "button", { label: "", href: "", variant: "primary" }),
    solid("w-gallery", "gallery", { images: [] }),
    {
      id: "w-callout",
      type: "callout",
      tone: "warning",
      children: [
        text(
          "w-callout-p",
          "p",
          "Escribe a aleksandra.wisniewska-kowalczyk@northwind-industries-holdings.example.com si tu documento fue expedido fuera de Colombia.",
        ),
      ],
    },
    {
      id: "w-table",
      type: "table",
      children: [
        row("w-t0", "th", [
          "Etapa",
          "Pregrado",
          "Posgrado",
          "Educación continua",
          "Fecha",
          "Lugar",
        ]),
        row("w-t1", "td", [
          "Inscripciones",
          "Sí",
          "Sí",
          "No aplica",
          "2 de febrero de 2027",
          "Edificio Camilo Torres, oficina 201",
        ]),
      ],
    },
    solid("w-spacer", "spacer", { size: "large" }),
  ],
  translations: {
    "en-US": {
      "w-intro-p":
        "Aleksandra Wiśniewska-Kowalczyk, international admissions coordinator, answers external transfer requests within fifteen business days of the complete filing of the documents.",
      "w-c2p":
        "https://admissions.universidad-industrial-de-santander.edu.co/calls/2027/second-semester/international-applicant-requirements.pdf",
    },
    "ar-EG": { "w-h2": "جدول القبول للفصل الدراسي الثاني من العام الأكاديمي 2027" },
    "zh-Hant-TW": { "w-c1h": "國際申請者的要求" },
  },
});

const WORST_LOCALES = [
  "es-CO",
  "en-US",
  "pt-BR",
  "fr-CA",
  "de-CH",
  "zh-Hant-TW",
  "sr-Latn-RS",
  "ar-EG",
  "x-klingon",
];

const createColumnsPage = (): EditorDocument => {
  const image = photo();
  const firsts: EditorNode[] = [
    lines("k-text", text("k-text-p", "p", "Texto al inicio de la columna")),
    text("k-h2", "h2", "Título al inicio"),
    text("k-h3", "h3", "Subtítulo al inicio"),
    text("k-quote", "blockquote", "Una cita al inicio de la columna"),
    solid("k-img", "img", { url: image, alt: "Imagen al inicio", caption: "" }),
    solid("k-gallery", "gallery", {
      images: [
        { src: image, alt: "Uno" },
        { src: image, alt: "Dos" },
      ],
    }),
    solid("k-video", "media_embed", { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }),
    solid("k-file", "file", { src: "/archivos/guia.pdf", name: "Guía.pdf", size: 204800 }),
    solid("k-button", "button", {
      label: "Inscribirse",
      href: "/inscripciones",
      variant: "primary",
    }),
    solid("k-spacer", "spacer", { size: "small" }),
    solid("k-hr", "hr", {}),
    {
      id: "k-table",
      type: "table",
      children: [row("k-table-0", "th", ["Etapa", "Fecha"]), row("k-table-1", "td", ["A", "B"])],
    },
    {
      id: "k-callout",
      type: "callout",
      tone: "info",
      children: [text("k-callout-p", "p", "Aviso")],
    },
  ];
  return {
    version: 1,
    locale: "es-CO",
    content: firsts.map((first) => ({
      id: `${first.id}-cols`,
      type: "columns",
      ratio: "equal",
      gap: "medium",
      align: "top",
      background: "none",
      stack: true,
      children: [
        column(`${first.id}-c1`, first),
        column(
          `${first.id}-c2`,
          lines(
            `${first.id}-t`,
            text(`${first.id}-p`, "p", "Al lado, en la otra columna."),
            text(`${first.id}-q`, "p", "Un segundo párrafo."),
            text(`${first.id}-r`, "p", "Y un tercero."),
          ),
        ),
      ],
    })),
  };
};

const createEmptyPage = (): EditorDocument => ({
  version: 1,
  locale: "es-CO",
  content: [lines("e-t", text("e-p", "p", ""))],
});

const createLongPage = (): EditorDocument => ({
  version: 1,
  locale: "es-CO",
  content: Array.from({ length: 40 }, (_, index) => [
    text(`m-${index}-h`, "h2", `Sección ${index + 1}`),
    lines(
      `m-${index}`,
      ...Array.from({ length: 4 }, (_, line) =>
        text(`m-${index}-${line}`, "p", `Párrafo ${line + 1} de la sección ${index + 1}.`),
      ),
    ),
  ]).flat(),
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
  title,
  view,
  onView,
  side,
  catalogShown,
  onSide,
  onOutline,
  outlineDocked,
  treeShown,
  sideDocked,
}: {
  title: string;
  view: View;
  onView: (view: View) => void;
  side: Side;
  catalogShown: boolean;
  onSide: (side: Side) => void;
  onOutline: () => void;
  outlineDocked: boolean;
  treeShown: boolean;
  sideDocked: boolean;
}) => {
  const { t } = useTranslation("pageEditor");
  const commands = useEditorCommands();
  const { previewing } = useEditorPreview();
  const coding = useEditorMode().mode === "code";
  const editing = !previewing && !coding;
  return (
    <div className="flex min-h-14 shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-card px-4 py-2">
      {outlineDocked && editing ? (
        <IconButton
          label={t("structure", { fallback: "Page structure" })}
          pressed={treeShown}
          className="-me-2"
          onClick={onOutline}
        >
          {treeShown ? <PanelLeftClose aria-hidden="true" /> : <PanelLeftOpen aria-hidden="true" />}
        </IconButton>
      ) : null}
      <div className="flex min-w-40 flex-1 flex-col max-sm:basis-full">
        <div className="flex min-w-0 items-center gap-2">
          <Text as="p" size="base" weight="semibold" truncate title={title}>
            {title}
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
        className={coding ? "hidden" : "max-md:hidden"}
      >
        <SegmentedControlItem value="desktop" aria-label={t("desktop", { fallback: "Desktop" })}>
          <Monitor aria-hidden="true" className="size-icon-md" />
        </SegmentedControlItem>
        <SegmentedControlItem value="mobile" aria-label={t("mobile", { fallback: "Mobile" })}>
          <Smartphone aria-hidden="true" className="size-icon-md" />
        </SegmentedControlItem>
      </SegmentedControl>
      <div className={editing ? "flex items-center gap-1" : "hidden"}>
        {outlineDocked ? null : (
          <IconButton label={t("structure", { fallback: "Page structure" })} onClick={onOutline}>
            <ListTree aria-hidden="true" />
          </IconButton>
        )}
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-pressed={sideDocked ? catalogShown : undefined}
          className="ms-2 aria-pressed:bg-accent aria-pressed:text-accent-foreground max-sm:size-8 max-sm:px-0"
          onClick={() => onSide(sideDocked && side === "catalog" ? "settings" : "catalog")}
        >
          <Plus aria-hidden="true" />
          <span className="max-sm:sr-only">{t("addBlock", { fallback: "Add block" })}</span>
        </Button>
      </div>
      <Separator
        orientation="vertical"
        className={editing ? "data-[orientation=vertical]:h-6 max-sm:hidden" : "hidden"}
      />
      <div className="flex items-center gap-2">
        {previewing ? null : (
          <Editor.TranslationsButton className="max-xl:[&_[data-slot=label]]:sr-only" />
        )}
        <Editor.PreviewButton className={previewing ? undefined : "max-sm:hidden"} />
        <Button type="button" size="sm">
          {t("publish", { fallback: "Publish" })}
        </Button>
        <Editor.ModeSwitch className="ms-2" />
      </div>
    </div>
  );
};

const DATASETS: Record<
  Dataset,
  { create: () => EditorDocument; title?: string; locales?: string[] }
> = {
  demo: { create: createPage },
  worst: {
    create: createWorstPage,
    locales: WORST_LOCALES,
    title:
      "Admisiones de pregrado, posgrado y educación continua para aspirantes nacionales e internacionales",
  },
  empty: { create: createEmptyPage },
  many: { create: createLongPage },
  columns: { create: createColumnsPage },
};

const datasetFromUrl = (): Dataset => {
  const value = new URLSearchParams(window.location.search).get("data");
  return value && Object.keys(DATASETS).includes(value) ? (value as Dataset) : "demo";
};

const DataToggle = ({ value }: { value: Dataset }) => (
  <div className="fixed bottom-4 left-1/2 z-overlay -translate-x-1/2 rounded-md bg-card shadow-lg">
    <SegmentedControl
      aria-label="Data"
      value={value}
      onValueChange={(next) => {
        const url = new URL(window.location.href);
        url.searchParams.set("data", next);
        window.location.assign(url);
      }}
    >
      <SegmentedControlItem value="demo">Demo</SegmentedControlItem>
      <SegmentedControlItem value="worst">Worst case</SegmentedControlItem>
      <SegmentedControlItem value="empty">Empty</SegmentedControlItem>
      <SegmentedControlItem value="many">Many</SegmentedControlItem>
      <SegmentedControlItem value="columns">Columns</SegmentedControlItem>
    </SegmentedControl>
  </div>
);

type Panels = {
  side: Side;
  setSide: (side: Side) => void;
  sheet: Sheeted;
  setSheet: (sheet: Sheeted) => void;
};

const Workspace = ({ title, side, setSide, sheet, setSheet }: Panels & { title: string }) => {
  const { t } = useTranslation("pageEditor");
  const selected = useSelectedBlock();
  const blocks = useBlockCommands();
  const { previewing, device: view, setDevice: setView } = useEditorPreview();
  const { mode } = useEditorMode();
  const outlineDocked = useMinWidth("(min-width: 48rem)");
  const sideDocked = useMinWidth("(min-width: 64rem)");
  const [treeShown, setTreeShown] = useState(true);
  const [catalogFor, setCatalogFor] = useState<string | null>(null);
  const catalogShown = !selected || (side === "catalog" && catalogFor === selected.id);

  const switchView = (next: View) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !document.startViewTransition) {
      setView(next);
      return;
    }
    document.startViewTransition(() => flushSync(() => setView(next)));
  };

  const openSide = (next: Side, forId: string | null = selected?.id ?? null) => {
    setSide(next);
    setCatalogFor(forId);
    if (!sideDocked) setSheet(next);
  };

  if (mode === "translations") return <Editor.Translations title={title} />;

  return (
    <>
      <PageBar
        title={title}
        view={view}
        onView={switchView}
        side={side}
        catalogShown={catalogShown}
        onSide={openSide}
        onOutline={() => (outlineDocked ? setTreeShown(!treeShown) : setSheet("outline"))}
        outlineDocked={outlineDocked}
        treeShown={treeShown}
        sideDocked={sideDocked}
      />
      {mode === "code" ? <Editor.Code title={title} /> : null}
      <div className={mode === "code" ? "hidden" : "flex min-h-0 flex-1"}>
        {outlineDocked && !previewing ? (
          <aside
            aria-label={t("structure", { fallback: "Page structure" })}
            data-hidden={treeShown ? undefined : ""}
            inert={!treeShown}
            data-motion="essential"
            className="w-62 shrink-0 overflow-hidden border-e border-border bg-card transition-[width,opacity] duration-(--duration-base) ease-out data-hidden:w-0 data-hidden:border-e-0 data-hidden:opacity-0 motion-reduce:transition-opacity motion-reduce:data-hidden:[transition:opacity_var(--duration-base)_var(--ease-out),width_0s_linear_var(--duration-base),border-width_0s_linear_var(--duration-base)]"
          >
            <div className="h-full w-62 overflow-y-auto p-3">
              <Editor.Outline className="min-h-full" />
            </div>
          </aside>
        ) : null}
        <div
          className="@container/pane min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8"
          onPointerDown={(event) => {
            const target = event.target as Element;
            if (!event.currentTarget.contains(target)) return;
            if (target.closest("[data-slot=page-add]")) return;
            if (!target.closest("[data-slate-editor], [data-slot=editor-float]")) blocks.deselect();
            setSide("settings");
          }}
        >
          <Container
            size={view === "mobile" ? "xs" : "md"}
            gutter={false}
            style={
              view === "mobile" ? ({ "--editor-gutter": "1.25rem" } as CSSProperties) : undefined
            }
          >
            <Box
              background="card"
              border
              radius="xl"
              paddingX={4}
              paddingY={6}
              className={
                view === "mobile" ? undefined : "@sm/pane:px-8 @2xl/pane:px-12 @2xl/pane:py-10"
              }
              style={{ viewTransitionName: "editor-page" }}
            >
              <div className="mb-6 flex flex-col gap-1">
                <div className="flex items-start gap-2">
                  <Heading level={1} className="min-w-0 break-words">
                    {title}
                  </Heading>
                  {previewing ? null : (
                    <Lock
                      role="img"
                      aria-label={t("titleLocked", { fallback: "Fixed title" })}
                      className="mt-3 size-icon-sm shrink-0 text-muted-foreground"
                    />
                  )}
                </div>
                {previewing ? null : (
                  <Text size="xs" tone="muted">
                    {t("titleHint", { fallback: "The title is the one of the menu entry." })}
                  </Text>
                )}
              </div>
              <Editor.Toolbar />
              <Editor.Content
                aria-label={t("content", { fallback: "Page content" })}
                className="min-h-40"
              />
              <Button
                type="button"
                variant="ghost"
                fullWidth
                hidden={previewing}
                data-slot="page-add"
                className="mt-8 border border-dashed border-border-strong text-muted-foreground"
                onClick={() => {
                  blocks.deselect();
                  openSide("catalog", null);
                }}
              >
                <Plus aria-hidden="true" />
                {t("addAtEnd", { fallback: "Add a block at the end" })}
              </Button>
            </Box>
          </Container>
        </div>
        {sideDocked && !previewing ? (
          <aside
            aria-label={
              catalogShown
                ? t("addBlock", { fallback: "Add block" })
                : t("blockSettings", { fallback: "Block settings" })
            }
            className="w-75 shrink-0 overflow-y-auto border-s border-border bg-card p-4"
          >
            {catalogShown ? (
              <Editor.Catalog onClose={selected ? () => setSide("settings") : undefined} />
            ) : (
              <Editor.BlockPanel className="min-h-full" />
            )}
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
              <Editor.BlockPanel />
            )}
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
};

const PageEditorDemo = () => {
  const { t } = useTranslation("pageEditor");
  const dataset = datasetFromUrl();
  const [page, setPage] = useState(DATASETS[dataset].create);
  const [side, setSide] = useState<Side>("settings");
  const [sheet, setSheet] = useState<Sheeted>(null);
  const title = DATASETS[dataset].title ?? t("pageName", { fallback: "Admissions" });

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
            setSide("settings");
            if (sheet === "catalog") setSheet(null);
          }}
          locales={DATASETS[dataset].locales ?? LOCALES}
          onUploadImage={uploadImage}
          onUploadFile={uploadFile}
          className="flex min-h-0 flex-1 flex-col"
        >
          <Workspace
            title={title}
            side={side}
            setSide={setSide}
            sheet={sheet}
            setSheet={setSheet}
          />
        </Editor.Root>
      </AppShellMain>
      {import.meta.env.DEV ? <DataToggle value={dataset} /> : null}
    </AppShell>
  );
};

export default PageEditorDemo;
