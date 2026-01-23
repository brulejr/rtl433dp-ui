// src/theme/ColorModeProvider.tsx
import * as React from "react";
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
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

  // If OS preference changes and user hasn’t explicitly chosen a mode
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
        // optional: shape/typography/components overrides here
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
