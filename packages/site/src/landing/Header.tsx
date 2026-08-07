import { useTranslation } from "@calumet/elise-i18n";
import { Button } from "@calumet/elise-ui/button";

import { GithubMark } from "../components/GithubMark";
import { LocaleSelect } from "../components/LocaleSelect";
import { DOCS_URL, REPO_URL, START_URL } from "../config";

const NAV = [
  { key: "components", href: "#pantalla" },
  { key: "packages", href: "#paquetes" },
  { key: "themes", href: "#decisiones" },
  { key: "docs", href: DOCS_URL },
];

/**
 * Barra flotante sobre el hero. No se pega al hacer scroll: la landing es
 * corta y una barra fija le comería 48px a cada sección de aquí abajo.
 */
export function Header() {
  const { t } = useTranslation("nav");

  return (
    <div className="absolute inset-x-0 top-2.5 z-10 flex justify-center px-4 sm:px-10">
      <header className="flex h-12 w-full max-w-[1180px] items-center justify-between rounded-lg border border-card/70 bg-card/30 py-0 pr-2 pl-4 shadow-lg backdrop-blur-[2px]">
        <div className="flex items-center gap-6">
          <a href="#top" aria-label={t("home")} className="text-lg font-semibold">
            Elise
          </a>
          <nav className="hidden items-center gap-5 text-base md:flex">
            {NAV.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground"
              >
                {t(item.key)}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSelect />
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <a href={REPO_URL}>
              <GithubMark />
              GitHub
            </a>
          </Button>
          <Button size="sm" asChild>
            <a href={START_URL}>{t("start")}</a>
          </Button>
        </div>
      </header>
    </div>
  );
}
