import type * as React from "react";

import "../index.css";

export default function Root({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
