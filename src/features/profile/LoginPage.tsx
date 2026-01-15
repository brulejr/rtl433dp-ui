import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthProvider";

export function LoginPage() {
  const { t } = useTranslation(["common"]);
  const { login, user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && user) {
      // already signed in; basic redirect to home
      window.location.href = "/";
    }
  }, [isLoading, user]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ width: "min(540px, 100%)", padding: 16, borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)" }}>
        <h2 style={{ marginTop: 0 }}>{t("common:appTitle")}</h2>
        <p style={{ opacity: 0.8, marginTop: 0 }}>
          OIDC login is required to access the UI.
        </p>
        <button onClick={() => login()} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {t("common:auth.login")}
        </button>
      </div>
    </div>
  );
}
