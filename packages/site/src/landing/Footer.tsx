import { useTranslation } from "@calumet/elise-i18n";
import { ArrowRight } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";

import { CopyCommand } from "../components/CopyCommand";
import { Dither } from "../components/Dither";
import { COPYRIGHT_YEAR, REPO_URL } from "../config";

const ENLACES = [
  { key: "link.start", href: `${REPO_URL}/tree/master/docs/guia-inicio.md` },
  { key: "link.architecture", href: `${REPO_URL}/tree/master/docs/arquitectura.md` },
  { key: "link.themes", href: `${REPO_URL}/tree/master/docs/temas.md` },
  { key: "link.changelog", href: `${REPO_URL}/blob/master/CHANGELOG.md` },
  { key: "link.github", href: REPO_URL },
];

export function Footer() {
  const { t } = useTranslation("footer");

  return (
    <div className="dark bg-background text-foreground">
      <section className="relative overflow-hidden px-6 pt-14 pb-12 text-center sm:px-10 sm:pt-20 sm:pb-16">
        {/* El nombre es el titular: no lleva un <h2> encima repitiéndolo. */}
        <h2 className="sr-only">Elise</h2>
        {/* El wordmark se escala al ancho, así que en el móvil una caja de 240px
            deja bandas vacías arriba y abajo. */}
        <div className="relative h-32 sm:h-60">
          <Dither kind="text" text="ELISE" className="absolute inset-0 size-full" />
        </div>
        <div className="-mt-2 flex flex-col items-stretch justify-center gap-3 sm:-mt-4 sm:flex-row sm:items-center">
          <Button size="lg" asChild>
            <a href="#pantalla">
              {t("cta")}
              <ArrowRight />
            </a>
          </Button>
          <CopyCommand />
        </div>
      </section>

      {/* En el móvil el menú ocupa el ancho completo, así que apilar es lo único
          que lo deja respirar; desde `sm` vuelve a la derecha del aviso legal. */}
      <footer className="flex flex-col gap-6 border-t border-border px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-x-6 sm:px-10">
        <nav className="flex flex-wrap gap-x-5 gap-y-2 sm:order-2">
          {ENLACES.map((enlace) => (
            <a
              key={enlace.key}
              href={enlace.href}
              className="text-secondary-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground"
            >
              {t(enlace.key)}
            </a>
          ))}
        </nav>
        <span className="text-sm text-muted-foreground sm:order-1">
          {t("copyright", { year: COPYRIGHT_YEAR })}
        </span>
      </footer>
    </div>
  );
}
