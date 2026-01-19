import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { OidcCallbackPage } from "../auth/OidcCallbackPage";
import { AppShell } from "../components/Layout";

import { LoginPage } from "../features/profile/LoginPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import ModelsPage from "../features/models/ModelsPage";
import { ModelDetailsPage } from "../features/models/ModelDetailsPage";
import { RecommendationsPage } from "../features/recommendations/RecommendationsPage";
import { KnownDevicesPage } from "../features/knownDevices/KnownDevicesPage";

export const router = createBrowserRouter([
  { path: "/auth/callback", element: <OidcCallbackPage /> },
  { path: "/login", element: <LoginPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <ProfilePage /> },
          { path: "/models", element: <ModelsPage /> },
          {
            path: "/models/:modelName/:fingerprint",
            element: <ModelDetailsPage />,
          },
          { path: "/recommendations", element: <RecommendationsPage /> },
          { path: "/known-devices", element: <KnownDevicesPage /> },
        ],
      },
    ],
  },
]);
