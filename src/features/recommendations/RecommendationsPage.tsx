import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  useListRecommendationsQuery,
  usePromoteRecommendationMutation,
  type RecommendationCandidate,
} from "./recommendationsApi";
import {
  closePromote,
  openPromote,
  selectPromoteForm,
  selectPromoteOpen,
  selectSelectedCandidate,
  setPromoteField,
} from "./recommendationsSlice";
import { selectHasPermission } from "../session/sessionSelectors";
import { PageHeader } from "../../components/PageHeader";
import { ApiError } from "../../components/ApiError";
import { DataTable, DataTableCell } from "../../components/DataTable";

function safeString(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function candidateKey(c: RecommendationCandidate, idx: number): string {
  const model = safeString(c.model);
  const id = safeString(c.id);
  const fp = safeString(c.fingerprint);
  const key = [model, id, fp].filter(Boolean).join(":");
  return key || `row-${idx}`;
}

export function RecommendationsPage() {
  const { t } = useTranslation(["common", "recommendations"]);

  const dispatch = useAppDispatch();
  const promoteOpen = useAppSelector(selectPromoteOpen);
  const selected = useAppSelector(selectSelectedCandidate);
  const promoteForm = useAppSelector(selectPromoteForm);

  const canPromote = useAppSelector(
    selectHasPermission("recommendation:promote")
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useListRecommendationsQuery();

  const [promote, promoteState] = usePromoteRecommendationMutation();

  const rows = useMemo(() => data?.content ?? [], [data]);

  const onOpenPromote = (c: RecommendationCandidate) => {
    if (!canPromote) return;
    dispatch(openPromote(c));
  };

  const onClosePromote = () => dispatch(closePromote());

  const onSubmitPromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPromote) return;
    if (!selected?.model || selected.id === undefined || selected.id === null)
      return;

    await promote({
      model: selected.model,
      id: selected.id,
      fingerprint: selected.fingerprint,
      name: promoteForm.name.trim(),
      area: promoteForm.area.trim(),
      deviceType: promoteForm.deviceType.trim(),
    }).unwrap();

    dispatch(closePromote());
  };

  const columns = [
    { key: "model", header: "Model" },
    { key: "id", header: "ID" },
    { key: "weight", header: "Weight" },
    { key: "rssi", header: "RSSI" },
    { key: "frequency", header: "Frequency" },
    { key: "actions", header: "", align: "right" as const },
  ];

  return (
    <div style={{ padding: 16 }}>
      <PageHeader
        title={t("recommendations:title")}
        loading={isLoading || isFetching}
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
          >
            {t("common:actions.refresh")}
          </button>
        }
      />

      {isError && <ApiError title={t("common:errors.generic")} error={error} />}

      {!isLoading && !isError && rows.length === 0 && (
        <div style={{ marginTop: 12 }}>{t("recommendations:list.empty")}</div>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <DataTable columns={columns}>
            {rows.map((c, idx) => (
              <tr key={candidateKey(c, idx)}>
                <DataTableCell>{safeString(c.model)}</DataTableCell>
                <DataTableCell>{safeString(c.id)}</DataTableCell>
                <DataTableCell>{c.weight ?? ""}</DataTableCell>
                <DataTableCell>{c.rssi ?? ""}</DataTableCell>
                <DataTableCell>{c.frequency ?? ""}</DataTableCell>

                <DataTableCell align="right">
                  {canPromote && (
                    <button
                      type="button"
                      onClick={() => onOpenPromote(c)}
                      disabled={!c.model || c.id === undefined || c.id === null}
                    >
                      {t("common:actions.promote")}
                    </button>
                  )}
                </DataTableCell>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {/* Promote dialog */}
      {canPromote && promoteOpen && selected && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={onClosePromote}
        >
          <div
            style={{
              width: "min(640px, 100%)",
              background: "white",
              borderRadius: 8,
              padding: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>
              {t("recommendations:promote.title")}
            </h3>

            <div style={{ marginBottom: 12, opacity: 0.8 }}>
              <div>
                <strong>Model:</strong> {safeString(selected.model)}
              </div>
              <div>
                <strong>ID:</strong> {safeString(selected.id)}
              </div>
            </div>

            <form onSubmit={onSubmitPromote}>
              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span>{t("recommendations:promote.name")}</span>
                  <input
                    value={promoteForm.name}
                    onChange={(e) =>
                      dispatch(
                        setPromoteField({
                          field: "name",
                          value: e.target.value,
                        })
                      )
                    }
                    required
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span>{t("recommendations:promote.area")}</span>
                  <input
                    value={promoteForm.area}
                    onChange={(e) =>
                      dispatch(
                        setPromoteField({
                          field: "area",
                          value: e.target.value,
                        })
                      )
                    }
                    required
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span>{t("recommendations:promote.deviceType")}</span>
                  <input
                    value={promoteForm.deviceType}
                    onChange={(e) =>
                      dispatch(
                        setPromoteField({
                          field: "deviceType",
                          value: e.target.value,
                        })
                      )
                    }
                    required
                  />
                </label>
              </div>

              {promoteState.isError && (
                <ApiError
                  title={t("common:errors.generic")}
                  error={promoteState.error}
                />
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <button
                  type="button"
                  onClick={onClosePromote}
                  disabled={promoteState.isLoading}
                >
                  {t("common:actions.cancel")}
                </button>
                <button type="submit" disabled={promoteState.isLoading}>
                  {t("recommendations:promote.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
