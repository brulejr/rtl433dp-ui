import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import {
  useListModelsQuery,
  useSearchModelsMutation,
  type ModelSummary,
  type ModelsSearchRequest,
} from "./modelsApi";

import {
  PageHeader,
  ErrorPanel,
  EmptyState,
  DataTable,
  type DataColumn,
} from "../../components";

function safeString(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function modelKey(m: ModelSummary, idx: number): string {
  const key = [safeString(m.model), safeString(m.fingerprint)]
    .filter(Boolean)
    .join(":");
  return key || `row-${idx}`;
}

export default function ModelsPage() {
  const { t } = useTranslation(["common", "models"]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useListModelsQuery();
  const [searchModels, searchState] = useSearchModelsMutation();

  // Keep a simple “advanced JSON” input like earlier, but not slice-dependent.
  const [searchJson, setSearchJson] = useState<string>("");

  const rows = useMemo(() => data?.content ?? [], [data]);

  const onSubmitSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchJson.trim();
    if (!trimmed) return;

    let body: ModelsSearchRequest;
    try {
      body = JSON.parse(trimmed) as ModelsSearchRequest;
    } catch {
      // If you already have a toast pattern, swap this out.
      alert("Search JSON is invalid.");
      return;
    }

    await searchModels(body).unwrap();
    // NOTE: your API marks search invalidates tags, so list refetch will happen.
  };

  const columns: Array<DataColumn<ModelSummary>> = [
    {
      header: t("models:fields.modelName"),
      render: (m) => safeString(m.model),
    },
    {
      header: t("models:fields.fingerprint"),
      render: (m) => (
        <code style={{ fontSize: 12 }}>{safeString(m.fingerprint)}</code>
      ),
    },
    {
      header: "Category",
      render: (m) => safeString(m.category),
    },
    {
      header: "",
      align: "right",
      render: (m) => (
        <Link
          to={`/models/${encodeURIComponent(m.model)}/${encodeURIComponent(
            m.fingerprint
          )}`}
        >
          Details
        </Link>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <PageHeader
        title={t("models:title")}
        isBusy={isLoading || isFetching || searchState.isLoading}
        actions={
          <>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
            >
              {t("common:actions.refresh")}
            </button>
          </>
        }
      />

      {/* Search (advanced) */}
      <div style={{ marginTop: 12 }}>
        <details>
          <summary style={{ cursor: "pointer" }}>
            {t("models:search.title")}
          </summary>
          <div style={{ marginTop: 10 }}>
            <div style={{ opacity: 0.8, marginBottom: 8 }}>
              {t("models:search.hint")}
            </div>

            <form onSubmit={onSubmitSearch}>
              <textarea
                value={searchJson}
                onChange={(e) => setSearchJson(e.target.value)}
                placeholder='{"model":"Acurite-Tower"}'
                rows={6}
                style={{ width: "100%", fontFamily: "monospace" }}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={searchState.isLoading || !searchJson.trim()}
                >
                  {t("models:search.submit")}
                </button>
                <button
                  type="button"
                  onClick={() => setSearchJson("")}
                  disabled={searchState.isLoading}
                >
                  {t("models:search.reset")}
                </button>
              </div>

              {searchState.isError ? (
                <ErrorPanel
                  message={t("common:errors.generic")}
                  error={searchState.error}
                />
              ) : null}
            </form>
          </div>
        </details>
      </div>

      {isError ? (
        <ErrorPanel message={t("common:errors.generic")} error={error} />
      ) : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <EmptyState>{t("models:list.empty")}</EmptyState>
      ) : null}

      {!isLoading && !isError && rows.length > 0 ? (
        <DataTable<ModelSummary>
          columns={columns}
          rows={rows}
          keyForRow={modelKey}
        />
      ) : null}
    </div>
  );
}
