import { useTranslation } from "@calumet/elise-i18n";
import { Card } from "@calumet/elise-ui/card";

import { Dither } from "../components/Dither";

function Panel({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="border-b border-border px-4 py-3 font-mono text-2xs font-medium tracking-[0.06em] text-muted-foreground uppercase">
        {titulo}
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-sm/7 text-card-foreground">
        {children}
      </pre>
    </Card>
  );
}

/* El scope `.dark` acá no es un tema alternativo sino una franja invertida: los
   tokens oscuros aplican a esta sección y todo lo de adentro los hereda sin
   pedir una sola clase `dark:`. */
export function Install() {
  const { t } = useTranslation("install");

  return (
    <section
      id="instalacion"
      className="dark relative isolate mt-20 overflow-hidden bg-background py-20 text-foreground"
    >
      <Dither kind="dark" className="absolute inset-0 size-full" />
      <div className="relative mx-auto w-full max-w-[1200px] px-6 sm:px-10">
        <h2 className="text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.12] font-semibold tracking-[-0.035em]">
          {t("title")}
        </h2>
        <p className="mt-3 max-w-[540px] text-lg text-muted-foreground text-pretty">{t("lede")}</p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Panel titulo={t("panel.terminal")}>
            <span className="text-muted-foreground">$</span> pnpm add @calumet/elise-ui{"\n"}
            <span className="text-muted-foreground">$</span> pnpm add -D tailwindcss
            @tailwindcss/vite
          </Panel>
          <Panel titulo={t("panel.css")}>
            <span className="text-muted-foreground">@import</span>{" "}
            <span className="text-primary">&quot;@calumet/elise-ui/tailwind/fonts.css&quot;</span>;
            {"\n"}
            <span className="text-muted-foreground">@import</span>{" "}
            <span className="text-primary">&quot;tailwindcss&quot;</span>;{"\n"}
            <span className="text-muted-foreground">@import</span>{" "}
            <span className="text-primary">&quot;@calumet/elise-ui/tailwind/elise.css&quot;</span>;
          </Panel>
        </div>
      </div>
    </section>
  );
}
