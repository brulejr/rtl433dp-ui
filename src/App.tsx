// src/App.tsx
import * as React from "react";
import { RouterProvider } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { buildTheme } from "./ui/theme";
import { router } from "./app/router";

import { useAppDispatch } from "./app/hooks";
import { initSession } from "./features/session/sessionThunks";

export default function App() {
  const theme = React.useMemo(() => buildTheme("dark"), []);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(initSession());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
