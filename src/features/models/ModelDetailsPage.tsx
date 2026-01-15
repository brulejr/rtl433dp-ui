import React from "react";
import { useParams } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthProvider";
import { toUserMessage } from "../../api/errors";
import { Card } from "../../components/Card";
import { JsonBlock } from "../../components/JsonBlock";
import { modelsApi, type ModelKey } from "./modelsApi";

export function ModelDetailsPage() {
  const { t } = useTranslation(["models", "common"]);
  const params = useParams();
  const modelName = params.modelName ?? "";
  const fingerprint = params.fingerprint ?? "";
  const key: ModelKey = { modelName: decodeURIComponent(modelName), fingerprint: decodeURIComponent(fingerprint) };

  const { getAccessToken } = useAuth();
  const api = modelsApi(getAccessToken());

  const detailsQ = useQuery({
    queryKey: ["models", "details", key.modelName, key.fingerprint],
    queryFn: () => api.get(key)
  });

  const [sensorsJson, setSensorsJson] = React.useState<string>("{\n  \n}");

  const updateM = useMutation({
    mutationFn: async () => {
      const parsed = JSON.parse(sensorsJson || "{}");
      return api.updateSensors(key, { sensors: parsed });
    },
    onSuccess: () => detailsQ.refetch()
  });

  return (
    <div>
      <Card title={`${t("models:details.title")}: ${key.modelName} / ${key.fingerprint}`}>
        {detailsQ.isLoading && <div>Loading…</div>}
        {detailsQ.error && <div>{toUserMessage(detailsQ.error, t)}</div>}
        {detailsQ.data && <JsonBlock value={detailsQ.data} />}
      </Card>

      <Card
        title={t("models:details.updateSensors")}
        actions={
          <button
            onClick={() => updateM.mutate()}
            disabled={updateM.isPending}
            style={{ padding: "8px 10px", borderRadius: 8 }}
          >
            {t("common:actions.save")}
          </button>
        }
      >
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          Paste the JSON payload for <code>SensorsUpdateRequest</code> (currently modeled as <code>{"{ sensors: any }"}</code>).
        </p>
        <textarea
          value={sensorsJson}
          onChange={(e) => setSensorsJson(e.target.value)}
          rows={8}
          style={{ width: "100%", borderRadius: 12, padding: 12 }}
        />
        {updateM.error && <div style={{ marginTop: 8, color: "#ffb4b4" }}>{toUserMessage(updateM.error, t)}</div>}
        {updateM.isSuccess && <div style={{ marginTop: 8, opacity: 0.85 }}>Updated.</div>}
      </Card>
    </div>
  );
}
