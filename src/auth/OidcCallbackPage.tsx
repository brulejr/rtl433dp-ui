import React from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { userManager } from "./oidc";

export function OidcCallbackPage() {
  const nav = useNavigate();
  const { t } = useTranslation(["common"]);

  React.useEffect(() => {
    userManager
      .signinRedirectCallback()
      .then(() => nav("/", { replace: true }))
      .catch(() => nav("/login?error=callback", { replace: true }));
  }, [nav]);

  return <div style={{ padding: 16 }}>{t("common:auth.signingIn")}</div>;
}
