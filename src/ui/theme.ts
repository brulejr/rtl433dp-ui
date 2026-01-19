// src/ui/theme.ts
import { createTheme } from "@mui/material/styles";

export function buildTheme(mode: "light" | "dark" = "dark") {
  return createTheme({
    palette: { mode },
    shape: { borderRadius: 10 },
    components: {
      MuiAppBar: { styleOverrides: { root: { boxShadow: "none" } } },
      MuiPaper: { defaultProps: { elevation: 1 } },
    },
  });
}
