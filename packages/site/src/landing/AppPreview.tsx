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

type Trabajo = {
  estudiante: string;
  director: string;
  radicado: Date;
  avance: number;
  estado: "inProgress" | "review" | "approved" | "draft";
};

/* Fechas y cifras son datos, no texto: se guardan crudos y los formatea Intl
   con el locale activo. Es lo que hace verdadera la nota de al lado. */
const TRABAJOS: Trabajo[] = [
  {
    estudiante: "Valentina Ardila",
    director: "Dr. Hernán Cadena",
    radicado: new Date(2026, 2, 9),
    avance: 0.82,
    estado: "inProgress",
  },
  {
    estudiante: "Sebastián Peñaloza",
    director: "Dra. Marta Rueda",
    radicado: new Date(2026, 1, 24),
    avance: 1,
    estado: "approved",
  },
  {
    estudiante: "Laura Bohórquez",
    director: "Dr. Iván Quintero",
    radicado: new Date(2026, 3, 2),
    avance: 0.65,
    estado: "review",
  },
  {
    estudiante: "Andrés Villamizar",
    director: "Dra. Marta Rueda",
    radicado: new Date(2026, 4, 15),
    avance: 0.18,
    estado: "draft",
  },
  {
    estudiante: "Daniela Serrano",
    director: "Dr. Hernán Cadena",
    radicado: new Date(2026, 0, 30),
    avance: 0.94,
    estado: "review",
  },
  {
    estudiante: "Camilo Fuentes",
    director: "Dr. Óscar Prada",
    radicado: new Date(2026, 3, 21),
    avance: 0.47,
    estado: "inProgress",
  },
  {
    estudiante: "Mariana Cáceres",
    director: "Dr. Iván Quintero",
    radicado: new Date(2026, 2, 17),
    avance: 1,
    estado: "approved",
  },
];

const TONOS = {
  inProgress: "info",
  review: "warning",
  approved: "success",
  draft: "neutral",
} as const;

const NOTAS = [
  { paquete: "elise-ui", key: "note.ui" },
  { paquete: "elise-tables", key: "note.tables" },
  { paquete: "elise-i18n", key: "note.i18n" },
  { paquete: "elise-toasts", key: "note.toasts" },
  { paquete: "elise-forms + elise-alerts", key: "note.forms" },
  { paquete: "elise-icons + elise-linter", key: "note.icons" },
];

const FECHA_CORTA = { day: "numeric", month: "short", year: "numeric" } as const;

export function AppPreview() {
  const { t, locale } = useTranslation("preview");

  /* Arranca en una hija y no en el padre: es donde se ve la guía bajar desde el
     icono de «Trabajos de grado» y terminar en codo sobre la entrada elegida. */
  const [ruta, setRuta] = React.useState("/en-desarrollo");

  const ir = (destino: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setRuta(destino);
  };

  const columnas = React.useMemo<ColumnDef<Trabajo>[]>(() => {
    const fecha = (valor: Date) => formatDate(valor, { locale, ...FECHA_CORTA });

    return [
      {
        accessorKey: "estudiante",
        header: t("app.col.student"),
        meta: { filterVariant: "text" },
      },
      {
        accessorKey: "director",
        header: t("app.col.advisor"),
        meta: { filterVariant: "select" },
      },
      {
        accessorKey: "radicado",
        header: t("app.col.filed"),
        cell: ({ getValue }) => (
          <span className="font-mono text-muted-foreground">{fecha(getValue<Date>())}</span>
        ),
      },
      {
        accessorKey: "avance",
        header: t("app.col.progress"),
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums">
            {formatPercent(getValue<number>(), { locale })}
          </span>
        ),
      },
      {
        accessorKey: "estado",
        header: t("app.col.status"),
        meta: { filterVariant: "select" },
        cell: ({ getValue }) => {
          const estado = getValue<Trabajo["estado"]>();
          return (
            <Badge tone={TONOS[estado]} variant="subtle">
              {t(`app.status.${estado}`)}
            </Badge>
          );
        },
      },
    ];
  }, [t, locale]);

  return (
    <section id="pantalla" className="mx-auto w-full max-w-[1200px] px-6 pt-20 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h2 className="text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.12] font-semibold tracking-[-0.035em]">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h2>
          <p className="mt-3 max-w-[600px] text-lg text-muted-foreground text-pretty">
            {t("lede")}
          </p>
        </div>
        <a
          href={DOCS_URL}
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          {t("catalogLink")}
          <ArrowRight className="size-4" />
        </a>
      </div>

      <div className="mt-8 h-[640px] overflow-hidden rounded-xl border border-border shadow-lg">
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
                onClick={() => toast({ title: t("app.toast"), variant: "info" })}
              />
              <AppShellUserMenu name="Ana Ruiz" detail={t("app.org")} initials="AR">
                <DropdownMenuItem onSelect={() => setRuta("/ajustes")}>
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
                active={ruta === "/inicio"}
                onClick={ir("/inicio")}
              >
                {t("app.nav.home")}
              </AppShellNavItem>

              <AppShellNavGroup defaultOpen>
                <AppShellNavItem
                  href="/trabajos"
                  icon={<GraduationCap />}
                  activeIcon={<GraduationCap strokeWidth={2.5} />}
                  count={48}
                  childActive={["/en-desarrollo", "/sustentados"].includes(ruta)}
                  active={ruta === "/trabajos"}
                  onClick={ir("/trabajos")}
                >
                  {t("app.nav.works")}
                </AppShellNavItem>
                <AppShellNavSubList>
                  <AppShellNavSubItem
                    href="/en-desarrollo"
                    active={ruta === "/en-desarrollo"}
                    onClick={ir("/en-desarrollo")}
                  >
                    {t("app.nav.inProgress")}
                  </AppShellNavSubItem>
                  <AppShellNavSubItem
                    href="/sustentados"
                    active={ruta === "/sustentados"}
                    onClick={ir("/sustentados")}
                  >
                    {t("app.nav.defended")}
                  </AppShellNavSubItem>
                </AppShellNavSubList>
              </AppShellNavGroup>

              <AppShellNavItem
                href="/grupos"
                icon={<Users />}
                count={12}
                active={ruta === "/grupos"}
                onClick={ir("/grupos")}
              >
                {t("app.nav.groups")}
              </AppShellNavItem>

              <AppShellNavItem
                href="/empleo"
                icon={<Briefcase />}
                active={ruta === "/empleo"}
                onClick={ir("/empleo")}
              >
                {t("app.nav.jobs")}
              </AppShellNavItem>

              <AppShellNavSection title={t("app.nav.section")}>
                <AppShellNavItem
                  href="/aula"
                  icon={<MonitorPlay />}
                  active={ruta === "/aula"}
                  onClick={ir("/aula")}
                >
                  {t("app.nav.classroom")}
                </AppShellNavItem>
                <AppShellNavItem
                  href="/evaluacion"
                  icon={<Star />}
                  active={ruta === "/evaluacion"}
                  onClick={ir("/evaluacion")}
                >
                  {t("app.nav.evaluation")}
                </AppShellNavItem>
              </AppShellNavSection>
            </ul>

            <AppShellNavFooter>
              <AppShellNavItem
                href="/ajustes"
                icon={<Settings />}
                active={ruta === "/ajustes"}
                onClick={ir("/ajustes")}
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
                    description: t("app.subtitle"),
                    variant: "info",
                  })
                }
              >
                {t("app.new")}
              </Button>
            </div>

            <div className="mt-4">
              <DataTable columns={columnas} data={TRABAJOS} exportTo initialPageSize={5} />
            </div>
          </AppShellMain>
        </AppShell>
      </div>

      <div className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {NOTAS.map((nota) => (
          <div key={nota.paquete} className="border-l-2 border-border-strong pl-3">
            <div className="font-mono text-xs font-medium text-primary">{nota.paquete}</div>
            <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
              <RichText>{t(nota.key)}</RichText>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
