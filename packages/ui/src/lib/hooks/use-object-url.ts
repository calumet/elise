import * as React from "react";

export function useObjectUrl(file: File | undefined): string | undefined {
  const [url, setUrl] = React.useState<string>();
  React.useEffect(() => {
    if (!file) {
      // oxlint-disable-next-line react/set-state-in-effect -- crear el objectURL fuera del efecto lo deja sin la limpieza que lo revoca.
      setUrl(undefined);
      return;
    }
    const next = URL.createObjectURL(file);
    // oxlint-disable-next-line react/set-state-in-effect -- ídem: el par crear/revocar vive en el efecto.
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}
