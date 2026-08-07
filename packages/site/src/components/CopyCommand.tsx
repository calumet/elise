import { useTranslation } from "@calumet/elise-i18n";
import { Check, Copy } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import * as React from "react";

import { INSTALL_CMD } from "../config";

/** El comando de instalación, y al tocarlo va al portapapeles. */
export function CopyCommand({ className }: { className?: string }) {
  const { t } = useTranslation("common");
  const [copiado, setCopiado] = React.useState(false);

  React.useEffect(() => {
    if (!copiado) return;
    const id = setTimeout(() => setCopiado(false), 1600);
    return () => clearTimeout(id);
  }, [copiado]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopiado(true);
    } catch {
      // Sin permiso de portapapeles no hay nada que hacer: el comando queda
      // visible en el botón para copiarlo a mano.
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={copiar}
      aria-label={t("copy", { cmd: INSTALL_CMD })}
      /* `outline` no trae relleno, que es lo correcto sobre una página lisa. Acá
         va encima del dither, así que necesita superficie propia o el comando
         queda ilegible. */
      className={`bg-card/85 font-mono backdrop-blur-[2px] ${className ?? ""}`}
    >
      {INSTALL_CMD}
      {copiado ? <Check className="text-success" /> : <Copy className="text-muted-foreground" />}
      <span className="sr-only" aria-live="polite">
        {copiado ? t("copied") : ""}
      </span>
    </Button>
  );
}
