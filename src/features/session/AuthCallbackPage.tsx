import * as React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { initSession } from "./sessionThunks";

// 🔧 Update this import to your real userManager location
import { userManager } from "../../auth/oidc";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    (async () => {
      try {
        // This completes the OIDC redirect flow (processes code/state, stores user)
        await userManager.signinRedirectCallback();

        // Hydrate Redux session from stored user (sets isAuthenticated, accessToken, profile)
        await dispatch(initSession()).unwrap();

        // Go to app
        navigate("/known-devices", { replace: true });
      } catch (e) {
        console.error("Auth callback failed:", e);
        navigate("/login", { replace: true });
      }
    })();
  }, [dispatch, navigate]);

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Box sx={{ display: "grid", gap: 2, justifyItems: "center" }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Completing sign-in…
        </Typography>
      </Box>
    </Box>
  );
}
