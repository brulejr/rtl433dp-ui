import { useAuth } from "../../auth/AuthProvider";
import { Card } from "../../components/Card";
import { JsonBlock } from "../../components/JsonBlock";
import { useTranslation } from "react-i18next";

export function ProfilePage() {
  const { t } = useTranslation(["common"]);
  const { user } = useAuth();

  return (
    <div>
      <Card title={t("common:nav.profile")}>
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          This page currently reflects the OIDC user session. A dedicated profile service can be added later.
        </p>

        <h4 style={{ marginBottom: 8 }}>Token claims</h4>
        <JsonBlock value={user?.profile ?? {}} />

        <h4 style={{ marginBottom: 8 }}>Session</h4>
        <JsonBlock value={{
          expired: user?.expired,
          expires_at: user?.expires_at,
          scope: user?.scope
        }} />
      </Card>
    </div>
  );
}
