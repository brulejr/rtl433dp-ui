// src/theme/ColorModeProvider.tsx
import * as React from "react";
import {
  CssBaseline,
  Theme,
  ThemeProvider,
  alpha,
  createTheme,
  useMediaQuery,
} from "@mui/material";

type Mode = "light" | "dark";

export const ColorModeContext = React.createContext({
  mode: "light" as Mode,
  toggleColorMode: () => {},
  setMode: (_m: Mode) => {},
});

const STORAGE_KEY = "mui-color-mode";

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  const [mode, setModeState] = React.useState<Mode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Mode | null;
    return saved ?? (prefersDark ? "dark" : "light");
  });

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setModeState(prefersDark ? "dark" : "light");
  }, [prefersDark]);

  const setMode = React.useCallback((m: Mode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);

  const toggleColorMode = React.useCallback(() => {
    setMode(mode === "light" ? "dark" : "light");
  }, [mode, setMode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: { mode },
        shape: { borderRadius: 10 },
        components: {
          MuiAppBar: { styleOverrides: { root: { boxShadow: "none" } } },
          MuiPaper: { defaultProps: { elevation: 1 } },

          MuiDataGrid: {
            styleOverrides: {
              root: ({ theme }: { theme: Theme }) => {
                const isDark = theme.palette.mode === "dark";

                // Zebra + selected tuning
                const stripeAlpha = isDark ? 0.08 : 0.03;
                const stripeHoverAlpha = isDark ? 0.12 : 0.06;

                const selectedAlpha = isDark ? 0.28 : 0.18;
                const selectedHoverAlpha = isDark ? 0.34 : 0.24;

                // Header tint (used as an overlay, but base stays opaque)
                const headerTint = alpha(
                  theme.palette.primary.main,
                  isDark ? 0.22 : 0.12,
                );

                // Used to soften DataGrid internal border vars
                const gridLine = alpha(
                  theme.palette.divider,
                  isDark ? 0.16 : 0.3,
                );

                const headerFg = isDark
                  ? alpha(theme.palette.common.white, 0.92)
                  : alpha(theme.palette.common.black, 0.82);

                const headerFgMuted = isDark
                  ? alpha(theme.palette.common.white, 0.72)
                  : alpha(theme.palette.common.black, 0.6);

                return {
                  // Globally soften DataGrid line colors
                  "--DataGrid-rowBorderColor": gridLine,
                  "--DataGrid-cellBorderColor": gridLine,

                  /* =======================
                   * Header (opaque + layered)
                   * ======================= */

                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: theme.palette.background.paper,
                    backgroundImage: `linear-gradient(${headerTint}, ${headerTint})`,
                    color: headerFg,

                    position: "sticky",
                    top: 0,
                    zIndex: 3,

                    borderBottom: "none !important",
                    boxShadow: `inset 0 -1px 0 ${gridLine}`,
                  },

                  "& .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeaders .MuiDataGrid-filler":
                    {
                      borderBottom: "none !important",
                    },

                  "& .MuiDataGrid-columnHeader": {
                    backgroundColor: "inherit",
                  },

                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 600,
                    color: "inherit",
                  },

                  // Column separators between columns
                  "& .MuiDataGrid-iconSeparator": {
                    color: alpha(headerFgMuted, 0.55),
                  },

                  // Sort/menu icons
                  "& .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIcon": {
                    color: headerFgMuted,
                    opacity: 1,
                    marginLeft: 0,
                    padding: 0,
                  },
                  "& .MuiDataGrid-iconButtonContainer": {
                    marginLeft: 6,
                  },
                  "& .MuiDataGrid-columnHeader .MuiIconButton-root": {
                    color: headerFgMuted,
                    padding: 4,
                  },

                  // Header hover
                  "& .MuiDataGrid-columnHeader:hover": {
                    backgroundColor: alpha(
                      theme.palette.primary.main,
                      isDark ? 0.28 : 0.16,
                    ),
                  },

                  /* =======================
                   * ✅ HIDE last header separator (your requested fix)
                   * ======================= */

                  // Normal header row
                  "& .MuiDataGrid-columnHeader--last .MuiDataGrid-columnSeparator":
                    {
                      display: "none !important",
                    },

                  // Column grouping header row (only matters if you use columnGroupingModel)
                  "& .MuiDataGrid-columnHeader--last .MuiDataGrid-columnSeparator--sideRight":
                    {
                      display: "none !important",
                    },

                  // If your build uses the resizable-specific class, hide that too
                  "& .MuiDataGrid-columnHeader--last .MuiDataGrid-columnSeparator--resizable":
                    {
                      display: "none !important",
                    },

                  /* =======================
                   * Remove the “dark bar” under header
                   * ======================= */

                  "& .MuiDataGrid-virtualScrollerRenderZone .MuiDataGrid-row:first-of-type .MuiDataGrid-cell":
                    {
                      borderTop: "none",
                    },
                  "& .MuiDataGrid-virtualScrollerRenderZone .MuiDataGrid-row:first-of-type":
                    {
                      borderTop: "none",
                    },

                  /* =======================
                   * Focus ring removal
                   * ======================= */

                  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within":
                    {
                      outline: "none",
                    },
                  "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                    {
                      outline: "none",
                    },
                  "& .MuiDataGrid-cell.MuiDataGrid-cell--editing:focus-within":
                    {
                      outline: "none",
                    },

                  /* =======================
                   * Zebra striping
                   * ======================= */

                  "& .rtl433dp-row-odd": {
                    backgroundColor: alpha(
                      theme.palette.text.primary,
                      stripeAlpha,
                    ),
                  },
                  "& .rtl433dp-row-odd:hover": {
                    backgroundColor: alpha(
                      theme.palette.text.primary,
                      stripeHoverAlpha,
                    ),
                  },

                  /* =======================
                   * Selected row
                   * ======================= */

                  "& .rtl433dp-row-selected": {
                    backgroundColor: alpha(
                      theme.palette.primary.main,
                      selectedAlpha,
                    ),
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                  },
                  "& .rtl433dp-row-selected:hover": {
                    backgroundColor: alpha(
                      theme.palette.primary.main,
                      selectedHoverAlpha,
                    ),
                  },
                  "& .rtl433dp-row-selected.rtl433dp-row-odd, & .rtl433dp-row-selected.rtl433dp-row-even":
                    {
                      backgroundColor: alpha(
                        theme.palette.primary.main,
                        selectedAlpha,
                      ),
                    },
                };
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
