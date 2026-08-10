import { useTranslation } from "@calumet/elise-i18n";
import { Head } from "@calumet/suamox-head";

import { AppPreview } from "../landing/AppPreview";
import { Decisions } from "../landing/Decisions";
import { Footer } from "../landing/Footer";
import { Header } from "../landing/Header";
import { Hero } from "../landing/Hero";
import { Install } from "../landing/Install";
import { Packages } from "../landing/Packages";

export default function HomePage() {
  const { t } = useTranslation("meta");

  return (
    <>
      <Head>
        <title>{t("title")}</title>
        <meta name="description" content={t("description")} />
      </Head>
      <Header />
      <main>
        <Hero />
        <Packages />
        <Install />
        <AppPreview />
        <Decisions />
      </main>
      <Footer />
    </>
  );
}
