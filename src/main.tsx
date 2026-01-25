import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { Provider } from "react-redux";

import "./app/i18n";
import { router } from "./app/router";
import { AuthProvider } from "./auth/AuthProvider";
import { store } from "./app/store";

import { ColorModeProvider } from "./theme/ColorModeProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<div />}>
      <Provider store={store}>
        <AuthProvider>
          <ColorModeProvider>
            <RouterProvider router={router} />
          </ColorModeProvider>
        </AuthProvider>
      </Provider>
    </Suspense>
  </React.StrictMode>,
);
