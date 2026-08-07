import { useState } from "react";

import { DateRange } from "./format";

type UseDateRangeOptions = {
  initial?: DateRange;
};

/**
 * Estado para un rango de fechas. Además de `range` y `setRange` devuelve
 * `setFrom` y `setTo`, para mover un extremo sin rearmar el objeto.
 */
export const useDateRange = ({ initial }: UseDateRangeOptions = {}): {
  range: DateRange | undefined;
  setRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  setFrom: (from?: Date) => void;
  setTo: (to?: Date) => void;
  reset: () => void;
} => {
  const [range, setRange] = useState<DateRange | undefined>(initial);

  const setFrom = (from?: Date) => setRange((curr) => ({ ...curr, from }));
  const setTo = (to?: Date) => setRange((curr) => ({ ...curr, to }));

  const reset = () => setRange(undefined);

  return {
    range,
    setRange,
    setFrom,
    setTo,
    reset,
  };
};
