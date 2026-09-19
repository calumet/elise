import { openAlert } from "@calumet/elise-alerts";
import { formatDate, formatPercent, useTranslation } from "@calumet/elise-i18n";
import { toast } from "@calumet/elise-toasts";
import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import { Card } from "@calumet/elise-ui/card";
import { Code } from "@calumet/elise-ui/code";
import { Field } from "@calumet/elise-ui/field";
import { Input } from "@calumet/elise-ui/input";
import * as React from "react";

import { i18nConfig } from "../config";

const TOKENS = ["--primary", "--success", "--warning", "--destructive"];

const VERSIONS = [
  { name: "elise-ui", version: "2.0.0", live: true },
  { name: "elise-tables", version: "1.4.2", live: true },
  { name: "elise-i18n", version: "1.1.0", live: true },
  { name: "elise-linter", version: "0.9.4", live: false },
];

const PROGRESS = 0.82;
const DATE = new Date(2026, 2, 9);
const SHORT_DATE = { day: "numeric", month: "short", year: "numeric" } as const;

function Title({ children }: { children: React.ReactNode }) {
  return <p className="text-lg font-semibold text-card-foreground">{children}</p>;
}

/** Muestra del tema: la misma Card con los mismos controles, claro y oscuro. */
function Sample({ label, save, brand, ok }: Record<string, string>) {
  return (
    <Card className="gap-2.5 p-3.5">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <Button size="sm" className="w-full">
        {save}
      </Button>
      <div className="flex gap-1.5">
        <Badge tone="brand" variant="subtle" size="sm">
          {brand}
        </Badge>
        <Badge tone="success" variant="subtle" size="sm">
          {ok}
        </Badge>
      </div>
    </Card>
  );
}

/** El mismo dato formateado con un locale concreto. */
function Value({ locale, dimmed }: { locale: string; dimmed?: boolean }) {
  return (
    // oxlint-disable-next-line shadcn/no-restyle -- `Card` no tiene tono atenuado
    <Card lang={locale} className={dimmed ? "gap-0 p-3 opacity-60" : "gap-0 p-3"}>
      <div className="text-xl font-semibold tabular-nums">
        {formatPercent(PROGRESS, { locale })}
      </div>
      <div className="mt-1 font-mono text-xs text-muted-foreground">
        {formatDate(DATE, { locale, ...SHORT_DATE })}
      </div>
    </Card>
  );
}

export function Decisions() {
  const { t, locale } = useTranslation("decisions");
  const otherLocale = i18nConfig.locales.find((code) => code !== locale) ?? i18nConfig.locales[1];

  return (
    <section id="decisiones" className="mx-auto w-full max-w-300 px-6 py-20 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h2 className="text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.12] font-semibold tracking-[-0.035em]">
          {t("title")}
        </h2>
        <p className="max-w-105 text-lg text-pretty text-muted-foreground sm:text-right">
          {t("lede")}
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-12">
        {/* oxlint-disable-next-line shadcn/no-restyle -- `Card` no tiene tono */}
        <Card className="gap-3.5 bg-secondary p-5 lg:col-span-5">
          <Title>{t("theme.title")}</Title>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Sample
              label={t("theme.light")}
              save={t("theme.save")}
              brand={t("theme.brand")}
              ok={t("theme.ok")}
            />
            {/* Mismo markup, tokens invertidos: no hay una segunda copia del
                componente para el modo oscuro. */}
            <div className="dark">
              <Sample
                label={t("theme.dark")}
                save={t("theme.save")}
                brand={t("theme.brand")}
                ok={t("theme.ok")}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {TOKENS.map((token) => (
              <span
                key={token}
                title={token}
                aria-hidden
                className="size-5.5 rounded-md"
                // oxlint-disable-next-line shadcn/no-inline-styles -- el valor ya es una variable del tema
                style={{ background: `var(${token})` }}
              />
            ))}
            <Code>applyTheme(tokens)</Code>
          </div>
        </Card>

        <Card className="gap-3.5 p-5 lg:col-span-4">
          <Title>{t("copy.title")}</Title>
          {/* Un árbol de archivos es un dibujo, no un componente: no hay nada en
              Elise que lo represente y forzarlo sería peor. */}
          <div className="flex flex-col gap-1.5 rounded-lg border border-dashed border-border-strong bg-muted p-3 font-mono text-xs">
            <span className="text-secondary-foreground">components/ui/</span>
            {["button.tsx", "dialog.tsx", "data-table.tsx"].map((file) => (
              <span key={file} className="flex items-center gap-2 text-muted-foreground">
                <span aria-hidden className="size-1 rounded-xs bg-track" />
                {file}
              </span>
            ))}
            <span className="flex items-center justify-between gap-2 text-destructive">
              {t("copy.rest")} <span>{t("copy.yours")}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Code>&quot;@calumet/elise-ui&quot;: &quot;^2.0.0&quot;</Code>
            <span className="text-xs text-success">{t("copy.ours")}</span>
          </div>
        </Card>

        <Card className="gap-3.5 p-5 lg:col-span-3">
          <Title>{t("locale.title")}</Title>
          <div className="flex flex-col gap-2.5">
            <Value locale={locale} />
            <Value locale={otherLocale} dimmed />
          </div>
        </Card>

        <Card className="gap-3.5 p-5 lg:col-span-5">
          <Title>{t("form.title")}</Title>
          <div className="grid items-start gap-3 sm:grid-cols-2">
            {/* `Field` ata el rótulo, la descripción y el error al control: el
                `id`, el `aria-describedby` y el `aria-invalid` los pone él. */}
            <Field label={t("form.label")} error={t("form.error")} required>
              {(control) => <Input {...control} defaultValue="ana@" readOnly />}
            </Field>
            <div className="dark rounded-lg bg-background p-3 font-mono text-xs/6 text-foreground">
              <div>
                <span className="text-primary">const</span> form = useZodForm(schema)
              </div>
              <div className="text-muted-foreground">{t("form.comment1")}</div>
              <div className="text-muted-foreground">{t("form.comment2")}</div>
            </div>
          </div>
          <Badge asChild tone="neutral" variant="outline">
            <code>{t("form.stack")}</code>
          </Badge>
        </Card>

        <Card className="gap-3.5 p-5 lg:col-span-3">
          <Title>{t("imperative.title")}</Title>
          {/* Los dos botones llaman de verdad a `toast()` y a `openAlert()`. Un
              aviso dibujado dentro de la tarjeta demostraría lo contrario de lo
              que dice el título. */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast({
                  title: t("imperative.saved"),
                  description: t("imperative.savedBody"),
                  variant: "success",
                })
              }
            >
              {t("imperative.notify")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                openAlert({
                  variant: "confirm",
                  title: t("imperative.ask"),
                  description: t("imperative.askBody"),
                  confirmLabel: t("imperative.delete"),
                  cancelLabel: t("imperative.cancel"),
                })
              }
            >
              {t("imperative.confirm")}
            </Button>
          </div>
          <Code>await confirm(&#123; tone &#125;)</Code>
        </Card>

        <Card className="gap-3.5 p-5 lg:col-span-4">
          <Title>{t("versions.title")}</Title>
          <Code>extends: [&quot;@calumet/elise-linter&quot;]</Code>
          <div className="flex flex-col gap-2.5">
            {VERSIONS.map((pkg) => (
              <div key={pkg.name} className="flex items-center gap-2.5 font-mono text-xs">
                <span
                  aria-hidden
                  className={`size-1.5 rounded-full ${pkg.live ? "bg-success" : "bg-track"}`}
                />
                <span className="flex-1 text-secondary-foreground">{pkg.name}</span>
                <span className="text-muted-foreground tabular-nums">{pkg.version}</span>
              </div>
            ))}
          </div>
          <span className="font-mono text-xs text-muted-foreground">{t("versions.note")}</span>
        </Card>
      </div>
    </section>
  );
}
