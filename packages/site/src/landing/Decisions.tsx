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

const VERSIONES = [
  { nombre: "elise-ui", version: "2.0.0", vivo: true },
  { nombre: "elise-tables", version: "1.4.2", vivo: true },
  { nombre: "elise-i18n", version: "1.1.0", vivo: true },
  { nombre: "elise-linter", version: "0.9.4", vivo: false },
];

const AVANCE = 0.82;
const FECHA = new Date(2026, 2, 9);
const FECHA_CORTA = { day: "numeric", month: "short", year: "numeric" } as const;

function Titulo({ children }: { children: React.ReactNode }) {
  return <p className="text-lg font-semibold text-card-foreground">{children}</p>;
}

/** Muestra del tema: la misma Card con los mismos controles, claro y oscuro. */
function Muestra({ etiqueta, guardar, brand, ok }: Record<string, string>) {
  return (
    <Card className="gap-2.5 p-3.5">
      <span className="font-mono text-xs text-muted-foreground">{etiqueta}</span>
      <Button size="sm" className="w-full">
        {guardar}
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
function Dato({ locale, atenuado }: { locale: string; atenuado?: boolean }) {
  return (
    <Card lang={locale} className={atenuado ? "gap-0 p-3 opacity-60" : "gap-0 p-3"}>
      <div className="text-xl font-semibold tabular-nums">{formatPercent(AVANCE, { locale })}</div>
      <div className="mt-1 font-mono text-xs text-muted-foreground">
        {formatDate(FECHA, { locale, ...FECHA_CORTA })}
      </div>
    </Card>
  );
}

export function Decisions() {
  const { t, locale } = useTranslation("decisions");
  const otroLocale = i18nConfig.locales.find((code) => code !== locale) ?? i18nConfig.locales[1];

  return (
    <section id="decisiones" className="mx-auto w-full max-w-[1200px] px-6 py-20 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h2 className="text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.12] font-semibold tracking-[-0.035em]">
          {t("title")}
        </h2>
        <p className="max-w-[420px] text-lg text-muted-foreground text-pretty sm:text-right">
          {t("lede")}
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-12">
        <Card className="gap-3.5 bg-secondary p-5 lg:col-span-5">
          <Titulo>{t("theme.title")}</Titulo>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Muestra
              etiqueta={t("theme.light")}
              guardar={t("theme.save")}
              brand={t("theme.brand")}
              ok={t("theme.ok")}
            />
            {/* Mismo markup, tokens invertidos: no hay una segunda copia del
                componente para el modo oscuro. */}
            <div className="dark">
              <Muestra
                etiqueta={t("theme.dark")}
                guardar={t("theme.save")}
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
                style={{ background: `var(${token})` }}
              />
            ))}
            <Code>applyTheme(tokens)</Code>
          </div>
        </Card>

        <Card className="gap-3.5 p-5 lg:col-span-4">
          <Titulo>{t("copy.title")}</Titulo>
          {/* Un árbol de archivos es un dibujo, no un componente: no hay nada en
              Elise que lo represente y forzarlo sería peor. */}
          <div className="flex flex-col gap-1.5 rounded-lg border border-dashed border-border-strong bg-muted p-3 font-mono text-xs">
            <span className="text-secondary-foreground">components/ui/</span>
            {["button.tsx", "dialog.tsx", "data-table.tsx"].map((archivo) => (
              <span key={archivo} className="flex items-center gap-2 text-muted-foreground">
                <span aria-hidden className="size-1 rounded-xs bg-track" />
                {archivo}
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
          <Titulo>{t("locale.title")}</Titulo>
          <div className="flex flex-col gap-2.5">
            <Dato locale={locale} />
            <Dato locale={otroLocale} atenuado />
          </div>
        </Card>

        <Card className="gap-3.5 p-5 lg:col-span-5">
          <Titulo>{t("form.title")}</Titulo>
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
          <Badge tone="neutral" variant="outline" className="border-border font-mono">
            {t("form.stack")}
          </Badge>
        </Card>

        <Card className="gap-3.5 p-5 lg:col-span-3">
          <Titulo>{t("imperative.title")}</Titulo>
          {/* Los dos botones llaman de verdad a `toast()` y a `openAlert()`. Un
              aviso dibujado dentro de la tarjeta demostraría lo contrario de lo
              que dice el título. */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast({ title: t("imperative.saved"), variant: "success" })}
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
          <Titulo>{t("versions.title")}</Titulo>
          <Code>extends: [&quot;@calumet/elise-linter&quot;]</Code>
          <div className="flex flex-col gap-2.5">
            {VERSIONES.map((paquete) => (
              <div key={paquete.nombre} className="flex items-center gap-2.5 font-mono text-xs">
                <span
                  aria-hidden
                  className={`size-1.5 rounded-full ${paquete.vivo ? "bg-success" : "bg-track"}`}
                />
                <span className="flex-1 text-secondary-foreground">{paquete.nombre}</span>
                <span className="text-muted-foreground tabular-nums">{paquete.version}</span>
              </div>
            ))}
          </div>
          <span className="font-mono text-xs text-muted-foreground">{t("versions.note")}</span>
        </Card>
      </div>
    </section>
  );
}
