// src/components/ColorModeMenuItem.tsx
import * as React from "react";
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from "@mui/material";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { useTranslation } from "react-i18next";

import { ColorModeContext } from "./ColorModeProvider";

export function ColorModeMenuItem() {
  const { t } = useTranslation(["common"]);
  const { mode, toggleColorMode } = React.useContext(ColorModeContext);

  return (
    <MenuItem onClick={toggleColorMode}>
      <ListItemIcon sx={{ minWidth: 36 }}>
        {mode === "dark" ? (
          <LightModeIcon fontSize="small" />
        ) : (
          <DarkModeIcon fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText primary={t("common:labels.theme")} />

      <Typography variant="body2" sx={{ color: "text.secondary", mr: 1 }}>
        {t(mode === "dark" ? "common:labels.dark" : "common:labels.light")}
      </Typography>
    </MenuItem>
  );
}
