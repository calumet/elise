import { useLocale, useTranslation } from "@calumet/elise-i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@calumet/elise-ui/select";

import { i18nConfig, LOCALE_LABELS } from "../config";

/**
 * Selector de idioma de la página.
 *
 * El orden sale de `i18nConfig` y no del diccionario, porque ese se arma con un
 * glob y ordena por nombre de archivo.
 */
export function LocaleSelect({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation("nav");

  return (
    <Select value={locale} onValueChange={setLocale}>
      <SelectTrigger
        aria-label={t("language")}
        className={`h-8 w-auto gap-1 border-border-strong bg-transparent px-2 ${className ?? ""}`}
      >
        {/* El rótulo va escrito y no deducido del item elegido. Radix solo monta
            los items al abrir el desplegable, así que sin esto el disparador
            viaja vacío desde el servidor y el valor no aparece hasta hidratar. */}
        <SelectValue>{LOCALE_LABELS[locale] ?? locale}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {i18nConfig.locales.map((code) => (
          <SelectItem key={code} value={code} lang={code}>
            {LOCALE_LABELS[code] ?? code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
