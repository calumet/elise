import { useLocale } from "@calumet/elise-i18n";
import { Button } from "@calumet/elise-ui/button";

export const LocaleToggle = () => {
  const { locale, setLocale } = useLocale();
  const next = locale === "es-CO" ? "en-US" : "es-CO";
  const label = locale === "es-CO" ? "ES" : "EN";

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Idioma</span>
      <Button variant="outline" size="sm" onClick={() => setLocale(next)} className="px-3">
        {label}
      </Button>
    </div>
  );
};
