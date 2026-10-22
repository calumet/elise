import { I18nProvider } from "@calumet/elise-i18n";
import { ThemeProvider } from "@calumet/elise-themes";
import React from "react";
import { createRoot, type Root } from "react-dom/client";

import "./index.css";
import { i18nConfig } from "./config";
import { messages } from "./i18n";
import PageEditorDemo from "./sections/PageEditorDemo";

const container = document.getElementById("root") as HTMLElement & { __reactRoot?: Root };
const root = (container.__reactRoot ??= createRoot(container));

root.render(
  <React.StrictMode>
    <I18nProvider
      defaultLocale={i18nConfig.defaultLocale}
      fallbackLocale={i18nConfig.fallbackLocale}
      messages={messages}
    >
      <ThemeProvider attribute="class" defaultTheme="light">
        <PageEditorDemo />
      </ThemeProvider>
    </I18nProvider>
  </React.StrictMode>,
);
