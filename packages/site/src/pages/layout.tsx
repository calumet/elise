import { AlertHost } from "@calumet/elise-alerts";
import { I18nProvider, useLocale } from "@calumet/elise-i18n";
import { Toaster } from "@calumet/elise-toasts";
import { ThemeProvider } from "@calumet/elise-ui/theme";
import { Head } from "@calumet/suamox-head";
import geistLatino from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2";
import monoLatino from "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2";
import * as React from "react";

import { i18nConfig } from "../config";
import { messages } from "../i18n";

/**
 * Layout raíz del sitio. Monta los dos providers una sola vez para todas las
 * rutas: si vivieran en la página, cambiar de ruta reiniciaría el idioma y el
 * tema elegidos.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {/* `crossOrigin` es obligatorio aunque el origen sea el mismo: sin él la
          petición del preload no se comparte con la de la fuente y el archivo se
          descarga dos veces. */}
      <Head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={geistLatino}
          crossOrigin="anonymous"
        />
        <link rel="preload" as="font" type="font/woff2" href={monoLatino} crossOrigin="anonymous" />
        <script type="module" src="/dither.js" />
      </Head>
      <I18nProvider
        messages={messages}
        defaultLocale={i18nConfig.defaultLocale}
        fallbackLocale={i18nConfig.fallbackLocale}
      >
        <Marco>{children}</Marco>
      </I18nProvider>
    </ThemeProvider>
  );
}

function Marco({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();

  /* El idioma del documento sigue al del contenido. Es lo que usa el lector de
     pantalla para elegir la voz, y sin esto lee el inglés con fonética
     española. Va en un efecto porque `<html>` lo emite la plantilla y no el
     árbol de React. */
  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // La cabecera flota sobre el hero, así que el contenedor de la página es el
  // que le da la referencia de posición.
  return (
    <div className="relative">
      {children}
      <Toaster />
      <AlertHost />
    </div>
  );
}
