// src/features/models/ModelsPage.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useGetModelsQuery, type ModelSummary } from "./modelsApi";

function ErrorBox({ title, details }: { title: string; details?: string }) {
  return (
    <div
      style={{
        border: "1px solid #e57373",
        background: "#ffebee",
        color: "#b71c1c",
        padding: "12px 14px",
        borderRadius: 8,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      {details ? (
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{details}</pre>
      ) : null}
    </div>
  );
}

function Table({
  rows,
  t,
}: {
  rows: ModelSummary[];
  t: (k: string) => string;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          borderSpacing: 0,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "10px 8px",
                borderBottom: "1px solid #ddd",
                fontWeight: 700,
              }}
            >
              {t("models.fields.modelName")}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "10px 8px",
                borderBottom: "1px solid #ddd",
                fontWeight: 700,
              }}
            >
              {t("models.fields.fingerprint")}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "10px 8px",
                borderBottom: "1px solid #ddd",
                fontWeight: 700,
              }}
            >
              Source
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "10px 8px",
                borderBottom: "1px solid #ddd",
                fontWeight: 700,
              }}
            >
              Category
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m, idx) => (
            <tr key={`${m.source}:${m.model}:${m.fingerprint}:${idx}`}>
              <td
                style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}
              >
                {m.model}
              </td>
              <td
                style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}
              >
                <code style={{ fontSize: 12 }}>{m.fingerprint}</code>
              </td>
              <td
                style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}
              >
                {m.source}
              </td>
              <td
                style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}
              >
                {m.category ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ModelsPage() {
  const { t } = useTranslation();

  // IMPORTANT: the server returns { content: [...] }, so we read data?.content below.
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetModelsQuery();

  const rows = React.useMemo(() => data?.content ?? [], [data]);

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22 }}>{t("models.title")}</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => refetch()}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
            }}
          >
            {t("actions.refresh")}
          </button>

          {isFetching ? (
            <span style={{ fontSize: 12, color: "#666" }}>Refreshing…</span>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 12, color: "#444" }}>Loading…</div>
      ) : null}

      {isError ? (
        <ErrorBox
          title={t("errors.generic")}
          details={
            typeof error === "object"
              ? JSON.stringify(error, null, 2)
              : String(error)
          }
        />
      ) : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <div style={{ padding: 12, color: "#666" }}>
          {t("models.list.empty")}
        </div>
      ) : null}

      {!isLoading && !isError && rows.length > 0 ? (
        <Table rows={rows} t={t} />
      ) : null}
    </div>
  );
}
