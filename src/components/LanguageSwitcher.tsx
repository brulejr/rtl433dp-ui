import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, type SupportedLang } from "../app/i18n";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation(["common"]);
  const current = (i18n.resolvedLanguage || "en") as SupportedLang;

  return (
    <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <span style={{ opacity: 0.8 }}>{t("common:labels.language")}:</span>
      <select
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        {SUPPORTED_LANGS.map((lng) => (
          <option key={lng} value={lng}>
            {lng.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
