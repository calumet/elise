/**
 * La pantalla de ajustes sola, en su propia página.
 *
 * Dentro de la vitrina cuelga de una lista larguísima, y ahí mirarla obliga a
 * desplazarse doce mil píxeles.
 */

import React from "react";
import { createRoot, type Root } from "react-dom/client";

import "./index.css";
import PantallaAjustes from "./sections/pantallas/PantallaAjustes";

const container = document.getElementById("root") as HTMLElement & { __reactRoot?: Root };
const root = (container.__reactRoot ??= createRoot(container));

root.render(
  <React.StrictMode>
    <div className="p-10">
      <PantallaAjustes />
    </div>
  </React.StrictMode>,
);
