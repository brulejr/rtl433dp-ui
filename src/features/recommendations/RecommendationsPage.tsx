import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthProvider";
import { toUserMessage } from "../../api/errors";
import { Card } from "../../components/Card";
import { JsonBlock } from "../../components/JsonBlock";
import {
  recommendationsApi,
  type PromotionRequest,
  type RecommendationResource,
} from "./recommendationsApi";

export function RecommendationsPage() {
  const { t } = useTranslation(["recommendations", "common"]);
  const { getAccessToken, hasPermission } = useAuth();
  const api = recommendationsApi(getAccessToken());
  const qc = useQueryClient();

  const listQ = useQuery({
    queryKey: ["recommendations", "candidates"],
    queryFn: api.listCandidates,
  });

  const promoteM = useMutation({
    mutationFn: (req: PromotionRequest) => api.promote(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recommendations", "candidates"] });
      qc.invalidateQueries({ queryKey: ["knownDevices", "list"] });
    },
  });

  const [selected, setSelected] = React.useState<RecommendationResource | null>(
    null
  );
  const [name, setName] = React.useState("");
  const [area, setArea] = React.useState("");
  const [deviceType, setDeviceType] = React.useState("");

  const promote = () => {
    if (!selected) return;

    // This assumes your backend expects model+id + metadata. Adjust to match your PromotionRequest exactly.
    const model = String(selected.model ?? "");
    const id = String(selected.id ?? "");
    promoteM.mutate({ model, id, name, area, deviceType });
  };

  return (
    <div>
      <Card
        title={t("recommendations:title")}
        actions={
          <button
            onClick={() => listQ.refetch()}
            style={{ padding: "8px 10px", borderRadius: 8 }}
          >
            {t("common:actions.refresh")}
          </button>
        }
      >
        {listQ.isLoading && <div>Loading…</div>}
        {listQ.error && <div>{toUserMessage(listQ.error, t)}</div>}

        {!listQ.isLoading &&
          !listQ.error &&
          (listQ.data?.length ?? 0) === 0 && (
            <div style={{ opacity: 0.85 }}>
              {t("recommendations:list.empty")}
            </div>
          )}

        {!listQ.isLoading && !listQ.error && (listQ.data?.length ?? 0) > 0 && (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {listQ.data!.map((r, idx) => (
              <li key={idx} style={{ marginBottom: 6 }}>
                {hasPermission("recommendation:promote") && (
                  <button
                    onClick={() => setSelected(r)}
                    style={{ padding: "6px 8px", borderRadius: 8 }}
                  >
                    Select
                  </button>
                )}
                <span style={{ opacity: 0.9 }}>
                  {String(r.model ?? "")} / {String(r.id ?? "")}
                  {typeof r.weight === "number" ? `  (weight=${r.weight})` : ""}
                  {typeof r.rssi === "number" ? `  (rssi=${r.rssi})` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {hasPermission("recommendation:promote") && (
        <Card title={t("recommendations:promote.title")}>
          {!selected && (
            <div style={{ opacity: 0.85 }}>
              Select a candidate above to promote.
            </div>
          )}
          {selected && (
            <>
              <p style={{ marginTop: 0, opacity: 0.85 }}>
                Candidate:
                <code style={{ marginLeft: 8 }}>
                  {String(selected.model ?? "")}/{String(selected.id ?? "")}
                </code>
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                <label>
                  <div style={{ opacity: 0.8, marginBottom: 4 }}>
                    {t("recommendations:promote.name")}
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%", borderRadius: 10, padding: 8 }}
                  />
                </label>
                <label>
                  <div style={{ opacity: 0.8, marginBottom: 4 }}>
                    {t("recommendations:promote.area")}
                  </div>
                  <input
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    style={{ width: "100%", borderRadius: 10, padding: 8 }}
                  />
                </label>
                <label>
                  <div style={{ opacity: 0.8, marginBottom: 4 }}>
                    {t("recommendations:promote.deviceType")}
                  </div>
                  <input
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    style={{ width: "100%", borderRadius: 10, padding: 8 }}
                  />
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 12,
                  alignItems: "center",
                }}
              >
                <button
                  onClick={promote}
                  disabled={promoteM.isPending}
                  style={{ padding: "8px 10px", borderRadius: 8 }}
                >
                  {t("common:actions.promote")}
                </button>
                {promoteM.error && (
                  <span style={{ color: "#ffb4b4" }}>
                    {toUserMessage(promoteM.error, t)}
                  </span>
                )}
                {promoteM.isSuccess && (
                  <span style={{ opacity: 0.85 }}>Promoted.</span>
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                <JsonBlock value={selected} />
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
