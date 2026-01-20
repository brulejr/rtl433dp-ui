// src/app/router.tsx
import * as React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../features/layout/AppLayout";
import { PublicLayout } from "../features/layout/PublicLayout";
import { RequireAuth } from "../features/session/RequireAuth";
import { AuthCallbackPage } from "../features/session/AuthCallbackPage";

import { LoginPage } from "../features/profile/LoginPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { KnownDevicesPage } from "../features/knownDevices/KnownDevicesPage";
import { ModelsPage } from "../features/models/ModelsPage";
import { RecommendationsPage } from "../features/recommendations/RecommendationsPage";

import { useAppSelector } from "./hooks";
import { selectHasPermission } from "../features/session/sessionSelectors";

function RequirePermission({
  anyOf,
  children,
  fallback = <Navigate to="/known-devices" replace />,
}: {
  anyOf: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const allowed = useAppSelector((s) =>
    anyOf.some((p) => selectHasPermission(p)(s)),
  );
  return <>{allowed ? children : fallback}</>;
}

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

          {
            path: "/models",
            element: (
              <RequirePermission anyOf={["model:list", "model:search"]}>
                <ModelsPage />
              </RequirePermission>
            ),
          },

          { path: "/profile", element: <ProfilePage /> },

          {
            path: "/recommendations",
            element: (
              <RequirePermission anyOf={["recommendation:list"]}>
                <RecommendationsPage />
              </RequirePermission>
            ),
          },
        ],
      },
    ],
  },
]);
