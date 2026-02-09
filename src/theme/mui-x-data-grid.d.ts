// src/theme/mui-x-data-grid.d.ts

import type { Components, Theme } from "@mui/material/styles";

// IMPORTANT: this import makes sure the DataGrid types/modules are loaded
import type {} from "@mui/x-data-grid/themeAugmentation";

declare module "@mui/material/styles" {
  // This augments the Components interface used by both Theme and CssVarsTheme themes
  interface Components<Theme = Theme> {
    MuiDataGrid?: {
      defaultProps?: Record<string, unknown>;
      styleOverrides?: Record<string, unknown>;
      variants?: Array<Record<string, unknown>>;
    };
  }
}
