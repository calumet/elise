import { useTranslation } from "@calumet/elise-i18n";
import { ArrowRight } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import { Stat } from "@calumet/elise-ui/stat";

import { CopyCommand } from "../components/CopyCommand";
import { Dither } from "../components/Dither";

/* Las cifras no se traducen, los rótulos sí. */
const STATS = [
  { value: "58", key: "stat.components" },
  { value: "8", key: "stat.packages" },
  { value: "AA", key: "stat.contrast" },
  { value: "React 19", key: "stat.stack" },
];

export function Hero() {
  const { t } = useTranslation("hero");

  return (
    <>
      <section id="top" className="relative isolate overflow-hidden bg-accent">
        <Dither kind="flow" className="absolute inset-0 size-full" />
        <div className="relative flex min-h-[min(870px,90svh)] flex-col items-center px-6 pt-36 pb-20 text-center sm:pt-44">
          {/* 1.29 es exactamente el alto de la caja de fondo dividido por el
              cuerpo de la letra: con ese interlineado las dos barras resaltadas
              se tocan y se leen como un solo bloque. Cualquier valor mayor abre
              una franja de página entre las dos. */}
          <h1 className="max-w-4xl text-[clamp(2.25rem,6vw,4.25rem)] leading-[1.29] font-semibold tracking-[-0.035em] text-balance">
            <span className="box-decoration-clone bg-primary px-3 text-primary-foreground">
              {t("titleLine1")}
            </span>
            <br />
            <span className="box-decoration-clone bg-primary px-3 text-primary-foreground">
              {t("titleLine2")}
            </span>
          </h1>

          <p className="mt-7 max-w-[620px] text-[clamp(1rem,1.6vw,1.1875rem)] leading-relaxed text-secondary-foreground text-pretty">
            {t("lede")}
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button size="lg" asChild>
              <a href="#pantalla">
                {t("cta")}
                <ArrowRight />
              </a>
            </Button>
            <CopyCommand />
          </div>
        </div>
      </section>

      <div className="border-b border-border bg-card">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-2 px-6 sm:px-10 md:grid-cols-4">
          {STATS.map((stat) => (
            <Stat
              key={stat.key}
              label={t(stat.key)}
              value={stat.value}
              /* Al revés que el Stat de una pantalla de datos: acá la cifra es
                 el titular y el rótulo el pie.

                 Las separaciones van por posición en la rejilla y no por orden,
                 porque en el móvil son dos filas de dos y la celda que abre fila
                 es la impar, no solo la primera. */
              className="flex-col-reverse gap-1.5 border-border px-7 py-6 odd:pl-0 even:border-l even:pr-0 [&:nth-child(n+3)]:border-t md:border-t-0 md:border-l md:odd:pl-7 md:even:pr-7 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
            />
          ))}
        </div>
      </div>
    </>
  );
}
