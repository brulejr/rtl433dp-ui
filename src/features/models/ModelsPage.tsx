import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useAuth } from "../../auth/AuthProvider";
import { toUserMessage } from "../../api/errors";
import { Card } from "../../components/Card";
import { JsonBlock } from "../../components/JsonBlock";
import { modelsApi, type ModelResourceList } from "./modelsApi";

export function ModelsPage() {
  const { t } = useTranslation(["models", "common"]);
  const { getAccessToken } = useAuth();
  const api = modelsApi(getAccessToken());

  const [searchJson, setSearchJson] = React.useState<string>("{\n  \n}");
  const [searchResults, setSearchResults] = React.useState<ModelResourceList[] | null>(null);
  const [searchError, setSearchError] = React.useState<string | null>(null);

  const listQ = useQuery({
    queryKey: ["models", "list"],
    queryFn: api.list
  });

  const runSearch = async () => {
    try {
      setSearchError(null);
      const parsed = JSON.parse(searchJson || "{}") as Record<string, unknown>;
      const res = await api.search(parsed);
      setSearchResults(res);
    } catch (e) {
      setSearchError(String(e));
    }
  };

  const resetSearch = () => {
    setSearchResults(null);
    setSearchError(null);
    setSearchJson("{\n  \n}");
  };

  return (
    <div>
      <Card
        title={t("models:title")}
        actions={
          <button onClick={() => listQ.refetch()} style={{ padding: "8px 10px", borderRadius: 8 }}>
            {t("common:actions.refresh")}
          </button>
        }
      >
        {listQ.isLoading && <div>Loading…</div>}
        {listQ.error && <div>{toUserMessage(listQ.error, t)}</div>}

        {!listQ.isLoading && !listQ.error && (listQ.data?.length ?? 0) === 0 && (
          <div style={{ opacity: 0.85 }}>{t("models:list.empty")}</div>
        )}

        {!listQ.isLoading && !listQ.error && (listQ.data?.length ?? 0) > 0 && (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {listQ.data!.map((m) => (
              <li key={`${m.modelName}:${m.fingerprint}`}>
                <Link
                  to={`/models/${encodeURIComponent(m.modelName)}/${encodeURIComponent(m.fingerprint)}`}
                  style={{ color: "#9ad1ff" }}
                >
                  {m.modelName} / {m.fingerprint}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title={t("models:search.title")}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={runSearch} style={{ padding: "8px 10px", borderRadius: 8 }}>
              {t("models:search.submit")}
            </button>
            <button onClick={resetSearch} style={{ padding: "8px 10px", borderRadius: 8 }}>
              {t("models:search.reset")}
            </button>
          </div>
        }
      >
        <p style={{ marginTop: 0, opacity: 0.85 }}>{t("models:search.hint")}</p>
        <textarea
          value={searchJson}
          onChange={(e) => setSearchJson(e.target.value)}
          rows={8}
          style={{ width: "100%", borderRadius: 12, padding: 12 }}
        />
        {searchError && <div style={{ marginTop: 8, color: "#ffb4b4" }}>{searchError}</div>}

        {searchResults && (
          <div style={{ marginTop: 12 }}>
            <JsonBlock value={searchResults} />
          </div>
        )}
      </Card>
    </div>
  );
}
