import * as React from "react";

import type { EditorSchema } from "../types";

export type EditorServices = {
  schema: EditorSchema;
  locales?: string[];
  onUploadImage?: (file: File) => Promise<{ src: string; alt?: string }>;
  onUploadFile?: (file: File) => Promise<{ src: string; name: string; size?: number }>;
  searchLinks?: (query: string) => Promise<{ label: string; href: string }[]>;
};

const ServicesContext = React.createContext<EditorServices | null>(null);

export const ServicesProvider: React.Provider<EditorServices | null> = ServicesContext.Provider;

export const useServices = (): EditorServices => {
  const services = React.useContext(ServicesContext);
  if (!services) throw new Error("Editor pieces must be rendered inside Editor.Root");
  return services;
};
