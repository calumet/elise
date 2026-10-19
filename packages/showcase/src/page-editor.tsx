import React from "react";
import { createRoot, type Root } from "react-dom/client";

import "./index.css";
import PageEditorDemo from "./sections/PageEditorDemo";

const container = document.getElementById("root") as HTMLElement & { __reactRoot?: Root };
const root = (container.__reactRoot ??= createRoot(container));

root.render(
  <React.StrictMode>
    <div className="min-h-screen p-6">
      <PageEditorDemo />
    </div>
  </React.StrictMode>,
);
