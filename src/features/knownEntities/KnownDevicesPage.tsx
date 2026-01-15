import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthProvider";
import { toUserMessage } from "../../api/errors";
import { Card } from "../../components/Card";
import { JsonBlock } from "../../components/JsonBlock";
import { knownDevicesApi } from "./knownDevicesApi";

export function KnownDevicesPage() {
  const { t } = useTranslation(["knownDevices", "common"]);
  const { getAccessToken } = useAuth();
  const api = knownDevicesApi(getAccessToken());

  const listQ = useQuery({
    queryKey: ["knownDevices", "list"],
    queryFn: api.listAll
  });

  return (
    <div>
      <Card
        title={t("knownDevices:title")}
        actions={
          <button onClick={() => listQ.refetch()} style={{ padding: "8px 10px", borderRadius: 8 }}>
            {t("common:actions.refresh")}
          </button>
        }
      >
        {listQ.isLoading && <div>Loading…</div>}
        {listQ.error && <div>{toUserMessage(listQ.error, t)}</div>}

        {!listQ.isLoading && !listQ.error && (listQ.data?.length ?? 0) === 0 && (
          <div style={{ opacity: 0.85 }}>{t("knownDevices:list.empty")}</div>
        )}

        {!listQ.isLoading && !listQ.error && (listQ.data?.length ?? 0) > 0 && (
          <JsonBlock value={listQ.data} />
        )}
      </Card>
    </div>
  );
}
