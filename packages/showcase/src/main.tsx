import React from "react";
import { createRoot, type Root } from "react-dom/client";

import "./index.css";
import App from "./App";

// La raíz se guarda en el propio contenedor: si HMR re-ejecuta este entry,
// se reutiliza en vez de llamar createRoot dos veces sobre el mismo nodo.
const container = document.getElementById("root") as HTMLElement & { __reactRoot?: Root };
const root = (container.__reactRoot ??= createRoot(container));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
