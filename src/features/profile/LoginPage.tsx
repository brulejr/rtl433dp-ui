// src/features/profile/LoginPage.tsx
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { startLogin } from "../session/sessionThunks";
import {
  selectIsAuthenticated,
  selectIsLoading,
} from "../session/sessionSlice";
import { Navigate, useLocation } from "react-router-dom";

export function LoginPage() {
  const { t } = useTranslation(["common", "login"]);
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const location = useLocation();

  // If user is already authed, bounce them into the app
  const from = (location.state as any)?.from ?? "/profile";
  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <Card>
      <CardContent>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h5">{t("common:appTitle")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t("login:title")}
            </Typography>
          </Box>

          <Alert severity="info">{t("login:messages.alert")}</Alert>

          <Button
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            disabled={isLoading}
            onClick={() => {
              dispatch(startLogin())
                .unwrap()
                .catch((e) => console.error("Login failed:", e));
            }}
          >
            {t("common:auth.login")}
          </Button>

          <Typography variant="caption" color="text.secondary">
            {t("login:caption")}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
