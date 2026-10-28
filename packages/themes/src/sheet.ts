import { DECISIONS, set } from "./decisions";
import type { EliseTheme } from "./theme";
import { lightTheme, type EliseVar } from "./tokens.generated";

const PAPER = DECISIONS.find((decision) => decision.id === "paper");

/* Lo que la página pone debajo del tema: la hoja de su lado, y no siempre la clara. */
export const sheetOf = (theme: EliseTheme): Record<EliseVar, string> => {
  const paper = theme["--background"];
  return { ...lightTheme, ...(PAPER && paper ? set(PAPER, {}, paper) : {}) };
};
