import { formatDate, formatPercent, useTranslation } from "@calumet/elise-i18n";
import {
  ArrowRight,
  Bell,
  Briefcase,
  GraduationCap,
  Home,
  MonitorPlay,
  Settings,
  Star,
  Users,
} from "@calumet/elise-icons";
import { DataTable, type ColumnDef } from "@calumet/elise-tables";
import { toast } from "@calumet/elise-toasts";
import {
  AppShell,
  AppShellHeader,
  AppShellHeaderAction,
  AppShellHeaderActions,
  AppShellHeaderBrand,
  AppShellHeaderSearch,
  AppShellMain,
  AppShellNav,
  AppShellNavFooter,
  AppShellNavGroup,
  AppShellNavItem,
  AppShellNavSection,
  AppShellNavSubItem,
  AppShellNavSubList,
  AppShellNavToggle,
  AppShellUserMenu,
} from "@calumet/elise-ui/app-shell";
import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import { DropdownMenuItem } from "@calumet/elise-ui/dropdown-menu";
import * as React from "react";

import { LocaleSelect } from "../components/LocaleSelect";
import { RichText } from "../components/RichText";
import { DOCS_URL } from "../config";

type Job = {
  student: string;
  director: string;
  filing: Date;
  progress: number;
  state: "inProgress" | "review" | "approved" | "draft";
};

/* Fechas y cifras son datos, no texto: se guardan crudos y los formatea Intl
   con el locale activo. Es lo que hace verdadera la nota de al lado. */
const JOBS: Job[] = [
  {
    student: "Valentina Ardila",
    director: "Dr. Hernán Cadena",
    filing: new Date(2026, 2, 9),
    progress: 0.82,
    state: "inProgress",
  },
  {
    student: "Sebastián Peñaloza",
    director: "Dra. Marta Rueda",
    filing: new Date(2026, 1, 24),
    progress: 1,
    state: "approved",
  },
  {
    student: "Laura Bohórquez",
    director: "Dr. Iván Quintero",
    filing: new Date(2026, 3, 2),
    progress: 0.65,
    state: "review",
  },
  {
    student: "Andrés Villamizar",
    director: "Dra. Marta Rueda",
    filing: new Date(2026, 4, 15),
    progress: 0.18,
    state: "draft",
  },
  {
    student: "Daniela Serrano",
    director: "Dr. Hernán Cadena",
    filing: new Date(2026, 0, 30),
    progress: 0.94,
    state: "review",
  },
  {
    student: "Camilo Fuentes",
    director: "Dr. Óscar Prada",
    filing: new Date(2026, 3, 21),
    progress: 0.47,
    state: "inProgress",
  },
  {
    student: "Mariana Cáceres",
    director: "Dr. Iván Quintero",
    filing: new Date(2026, 2, 17),
    progress: 1,
    state: "approved",
  },
];

const TONES = {
  inProgress: "info",
  review: "warning",
  approved: "success",
  draft: "neutral",
} as const;

const NOTES = [
  { pkg: "elise-ui", key: "note.ui" },
  { pkg: "elise-tables", key: "note.tables" },
  { pkg: "elise-i18n", key: "note.i18n" },
  { pkg: "elise-toasts", key: "note.toasts" },
  { pkg: "elise-forms + elise-alerts", key: "note.forms" },
  { pkg: "elise-icons + elise-linter", key: "note.icons" },
];

const SHORT_DATE = { day: "numeric", month: "short", year: "numeric" } as const;

export function AppPreview() {
  const { t, locale } = useTranslation("preview");

  /* Arranca en una hija y no en el padre: es donde se ve la guía bajar desde el
     icono de «Trabajos de grado» y terminar en codo sobre la entrada elegida. */
  const [route, setRoute] = React.useState("/en-desarrollo");

  const go = (target: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setRoute(target);
  };

  const columns = React.useMemo<ColumnDef<Job>[]>(() => {
    const date = (value: Date) => formatDate(value, { locale, ...SHORT_DATE });

    return [
      {
        accessorKey: "student",
        header: t("app.col.student"),
        meta: { filterVariant: "text" },
      },
      {
        accessorKey: "director",
        header: t("app.col.advisor"),
        meta: { filterVariant: "select" },
      },
      {
        accessorKey: "filing",
        header: t("app.col.filed"),
        cell: ({ getValue }) => (
          <span className="font-mono text-muted-foreground">{date(getValue<Date>())}</span>
        ),
      },
      {
        accessorKey: "progress",
        header: t("app.col.progress"),
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums">
            {formatPercent(getValue<number>(), { locale })}
          </span>
        ),
      },
      {
        accessorKey: "state",
        header: t("app.col.status"),
        meta: { filterVariant: "select" },
        cell: ({ getValue }) => {
          const state = getValue<Job["state"]>();
          return (
            <Badge tone={TONES[state]} variant="subtle">
              {t(`app.status.${state}`)}
            </Badge>
          );
        },
      },
    ];
  }, [t, locale]);

  return (
    <section id="pantalla" className="mx-auto w-full max-w-300 px-6 pt-20 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h2 className="text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.12] font-semibold tracking-[-0.035em]">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h2>
          <p className="mt-3 max-w-150 text-lg text-pretty text-muted-foreground">{t("lede")}</p>
        </div>
        <a
          href={DOCS_URL}
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          {t("catalogLink")}
          <ArrowRight className="size-4" />
        </a>
      </div>

      <div className="mt-8 h-160 overflow-hidden rounded-xl border border-border shadow-lg">
        <AppShell className="h-full">
          <AppShellHeader>
            <AppShellNavToggle />
            <AppShellHeaderBrand>
              <span className="font-semibold">{t("app.name")}</span>
              <span className="truncate text-muted-foreground">{t("app.org")}</span>
            </AppShellHeaderBrand>
            <AppShellHeaderSearch shortcut={["⌘", "K"]} onClick={() => {}}>
              {t("app.search")}
            </AppShellHeaderSearch>
            <AppShellHeaderActions>
              {/* El selector cambia el idioma de la página entera, no solo el de
                  la maqueta: es la demostración de que la tabla se reformatea. */}
              <LocaleSelect />
              <AppShellHeaderAction
                label={t("app.notifications")}
                icon={<Bell />}
                onClick={() =>
                  toast({ title: t("app.bell"), description: t("app.bellBody"), variant: "info" })
                }
              />
              <AppShellUserMenu name="Ana Ruiz" detail={t("app.org")}>
                <DropdownMenuItem onSelect={() => setRoute("/ajustes")}>
                  <Settings aria-hidden="true" />
                  {t("app.nav.settings")}
                </DropdownMenuItem>
              </AppShellUserMenu>
            </AppShellHeaderActions>
          </AppShellHeader>

          <AppShellNav label={t("app.name")}>
            <ul className="list-none p-0">
              <AppShellNavItem
                href="/inicio"
                icon={<Home />}
                activeIcon={<Home strokeWidth={2.5} />}
                active={route === "/inicio"}
                onClick={go("/inicio")}
              >
                {t("app.nav.home")}
              </AppShellNavItem>

              <AppShellNavGroup defaultOpen>
                <AppShellNavItem
                  href="/trabajos"
                  icon={<GraduationCap />}
                  activeIcon={<GraduationCap strokeWidth={2.5} />}
                  count={48}
                  childActive={["/en-desarrollo", "/sustentados"].includes(route)}
                  active={route === "/trabajos"}
                  onClick={go("/trabajos")}
                >
                  {t("app.nav.works")}
                </AppShellNavItem>
                <AppShellNavSubList>
                  <AppShellNavSubItem
                    href="/en-desarrollo"
                    active={route === "/en-desarrollo"}
                    onClick={go("/en-desarrollo")}
                  >
                    {t("app.nav.inProgress")}
                  </AppShellNavSubItem>
                  <AppShellNavSubItem
                    href="/sustentados"
                    active={route === "/sustentados"}
                    onClick={go("/sustentados")}
                  >
                    {t("app.nav.defended")}
                  </AppShellNavSubItem>
                </AppShellNavSubList>
              </AppShellNavGroup>

              <AppShellNavItem
                href="/grupos"
                icon={<Users />}
                count={12}
                active={route === "/grupos"}
                onClick={go("/grupos")}
              >
                {t("app.nav.groups")}
              </AppShellNavItem>

              <AppShellNavItem
                href="/empleo"
                icon={<Briefcase />}
                active={route === "/empleo"}
                onClick={go("/empleo")}
              >
                {t("app.nav.jobs")}
              </AppShellNavItem>

              <AppShellNavSection title={t("app.nav.section")}>
                <AppShellNavItem
                  href="/aula"
                  icon={<MonitorPlay />}
                  active={route === "/aula"}
                  onClick={go("/aula")}
                >
                  {t("app.nav.classroom")}
                </AppShellNavItem>
                <AppShellNavItem
                  href="/evaluacion"
                  icon={<Star />}
                  active={route === "/evaluacion"}
                  onClick={go("/evaluacion")}
                >
                  {t("app.nav.evaluation")}
                </AppShellNavItem>
              </AppShellNavSection>
            </ul>

            <AppShellNavFooter>
              <AppShellNavItem
                href="/ajustes"
                icon={<Settings />}
                active={route === "/ajustes"}
                onClick={go("/ajustes")}
              >
                {t("app.nav.settings")}
              </AppShellNavItem>
            </AppShellNavFooter>
          </AppShellNav>

          <AppShellMain>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">{t("app.title")}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t("app.subtitle")}</div>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  toast({
                    title: t("app.toast"),
                    description: t("app.toastBody"),
                    variant: "info",
                  })
                }
              >
                {t("app.new")}
              </Button>
            </div>

            <div className="mt-4">
              <DataTable columns={columns} data={JOBS} exportTo initialPageSize={5} />
            </div>
          </AppShellMain>
        </AppShell>
      </div>

      <div className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {NOTES.map((note) => (
          <div key={note.pkg} className="border-l-2 border-border-strong pl-3">
            <div className="font-mono text-xs font-medium text-primary">{note.pkg}</div>
            <p className="mt-1.5 text-sm text-pretty text-muted-foreground">
              <RichText>{t(note.key)}</RichText>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
