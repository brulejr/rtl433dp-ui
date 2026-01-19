import * as React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectIsAuthenticated,
  selectProfile,
  selectPermissions,
  selectAccessToken,
} from "../session/sessionSlice";
import { startLogin, startLogout } from "../session/sessionThunks";

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const profile = useAppSelector(selectProfile);
  const permissions = useAppSelector(selectPermissions);
  const accessToken = useAppSelector(selectAccessToken);

  const displayName =
    profile?.preferred_username ?? profile?.name ?? profile?.email ?? "User";

  return (
    <Stack spacing={2.5}>
      <Typography variant="h5">Profile</Typography>

      {!isAuthenticated ? (
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<LoginIcon />}
              onClick={() => dispatch(startLogin())}
            >
              Login
            </Button>
          }
        >
          You are not signed in.
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
          >
            <Avatar sx={{ width: 64, height: 64 }}>
              {(displayName?.[0] ?? "U").toUpperCase()}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">{displayName}</Typography>
              {profile?.email ? (
                <Typography variant="body2" color="text.secondary">
                  {profile.email}
                </Typography>
              ) : null}

              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1, flexWrap: "wrap" }}
              >
                <Chip
                  size="small"
                  label={isAuthenticated ? "Authenticated" : "Anonymous"}
                />
                <Chip
                  size="small"
                  label={`Permissions: ${permissions.length}`}
                />
              </Stack>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<LoginIcon />}
                disabled={isAuthenticated}
                onClick={() => dispatch(startLogin())}
              >
                Login
              </Button>
              <Button
                variant="contained"
                startIcon={<LogoutIcon />}
                disabled={!isAuthenticated}
                onClick={() => dispatch(startLogout())}
              >
                Logout
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Row label="sub" value={profile?.sub} />
            <Row
              label="preferred_username"
              value={profile?.preferred_username}
            />
            <Row label="name" value={profile?.name} />
            <Row label="email" value={profile?.email} />
          </Stack>
        </CardContent>
      </Card>

      {isAuthenticated ? (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Debug
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Permissions
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                borderRadius: 2,
                bgcolor: "action.hover",
                overflowX: "auto",
                fontSize: 12,
              }}
            >
              {JSON.stringify(permissions, null, 2)}
            </Box>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Access Token (preview)
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                borderRadius: 2,
                bgcolor: "action.hover",
                overflowX: "auto",
                fontSize: 12,
              }}
            >
              {accessToken
                ? `${accessToken.slice(0, 24)}…${accessToken.slice(-12)}`
                : "—"}
            </Box>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}

function Row(props: { label: string; value?: string }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
      <Typography variant="body2" sx={{ width: { sm: 180 }, fontWeight: 600 }}>
        {props.label}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ wordBreak: "break-word" }}
      >
        {props.value || "—"}
      </Typography>
    </Stack>
  );
}
