/**
 * El marco solo, a pantalla completa.
 *
 * Dentro de la vitrina el `AppShell` vive en una caja de 560px, y ahí los anchos
 * no son los de verdad: la cabecera mide lo que mide la caja y no la ventana,
 * así que lo que se rompe por responsive no se ve o se ve donde no es.
 */

import React from "react";
import { createRoot, type Root } from "react-dom/client";

import "./index.css";
import AppShellDemo from "./sections/AppShellDemo";

const container = document.getElementById("root") as HTMLElement & { __reactRoot?: Root };
const root = (container.__reactRoot ??= createRoot(container));

root.render(
  <React.StrictMode>
    <AppShellDemo pantallaCompleta />
  </React.StrictMode>,
);
