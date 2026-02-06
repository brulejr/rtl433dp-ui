import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";

import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, type SupportedLang } from "../app/i18n";

export function LanguageSwitcherMenuItem() {
  const { i18n, t } = useTranslation(["common"]);
  const current = (i18n.resolvedLanguage || "en") as SupportedLang;

  const onChange = (e: SelectChangeEvent<string>) => {
    void i18n.changeLanguage(e.target.value as SupportedLang);
  };

  return (
    <MenuItem>
      <ListItemIcon sx={{ minWidth: 36 }}>
        <LanguageIcon fontSize="small" />
      </ListItemIcon>

      <ListItemText primary={t("common:labels.language")} />

      <Select
        size="small"
        value={current}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()} // keep the profile menu from closing
        variant="filled"
        sx={{
          ml: 1,
          "& .MuiSelect-select": { py: 0.75 },
        }}
      >
        {SUPPORTED_LANGS.map((lng) => (
          <MenuItem key={lng} value={lng}>
            {lng.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </MenuItem>
  );
}
