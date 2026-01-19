import * as React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../features/layout/AppLayout";
import { PublicLayout } from "../features/layout/PublicLayout";
import { RequireAuth } from "../features/session/RequireAuth";
import { AuthCallbackPage } from "../features/session/AuthCallbackPage";

import { LoginPage } from "../features/profile/LoginPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { KnownDevicesPage } from "../features/knownDevices/KnownDevicesPage";

export const router = createBrowserRouter([
  // Public pages (NO application frame)
  {
    element: <PublicLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/auth/callback", element: <AuthCallbackPage /> },
    ],
  },

  // Protected app (application frame only when authed)
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/known-devices" replace /> },
          { path: "/known-devices", element: <KnownDevicesPage /> },
          { path: "/profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
]);
