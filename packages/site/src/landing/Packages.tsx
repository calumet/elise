import { useTranslation } from "@calumet/elise-i18n";
import { ArrowRight } from "@calumet/elise-icons";
import { Card } from "@calumet/elise-ui/card";

import { Dither } from "../components/Dither";
import { RichText } from "../components/RichText";
import { DOCS_URL } from "../config";

/* El nombre del paquete es el mismo en cualquier idioma; el título y el cuerpo
   salen del diccionario. */
const PACKAGES = ["ui", "forms", "tables", "i18n", "toasts", "alerts", "icons", "linter"];

export function Packages() {
  const { t } = useTranslation("packages");

  return (
    <section id="paquetes" className="mx-auto w-full max-w-[1200px] px-6 pt-20 sm:px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <div>
          <h2 className="text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.12] font-semibold tracking-[-0.035em]">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h2>
          <p className="mt-2.5 max-w-[560px] text-lg text-muted-foreground">{t("lede")}</p>
        </div>
        <a
          href={DOCS_URL}
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          {t("docsLink")}
          <ArrowRight className="size-4" />
        </a>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PACKAGES.map((nombre) => (
          <Card key={nombre} className="relative gap-0 overflow-hidden p-5">
            <Dither kind="patch" cell={7} className="absolute top-0 right-0 size-23" />
            <span className="relative font-mono text-xs font-medium text-primary">
              elise-{nombre}
            </span>
            <h3 className="relative mt-2.5 text-lg font-semibold">{t(`${nombre}.title`)}</h3>
            <p className="relative mt-1.5 text-sm text-muted-foreground">
              <RichText>{t(`${nombre}.body`)}</RichText>
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
