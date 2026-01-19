import * as React from "react";
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

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { startLogin } from "../session/sessionThunks";
import {
  selectIsAuthenticated,
  selectIsLoading,
} from "../session/sessionSlice";
import { Navigate, useLocation } from "react-router-dom";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const location = useLocation();

  // If user is already authed, bounce them into the app
  const from = (location.state as any)?.from ?? "/known-devices";
  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <Card>
      <CardContent>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h5">rtl433dp</Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to view and manage your devices.
            </Typography>
          </Box>

          <Alert severity="info">
            You must sign in before accessing the application.
          </Alert>

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
            Sign in
          </Button>

          <Typography variant="caption" color="text.secondary">
            You’ll be redirected to your identity provider and then returned
            here.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
