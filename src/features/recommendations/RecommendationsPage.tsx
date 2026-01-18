import React, { useMemo, useEffect } from "react";
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
import { hasPermission } from "../../auth/permissions";

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

  // ✅ Option A: permission gate from redux session state
  const permissions = useAppSelector((s) => s.session.permissions);
  const canPromote = hasPermission(permissions, "recommendation:promote");

  const { data, isLoading, isFetching, isError, error, refetch } =
    useListRecommendationsQuery();

  const [promote, promoteState] = usePromoteRecommendationMutation();

  const rows = useMemo(() => data?.content ?? [], [data]);

  // ✅ Safety: if permissions change (or user logs out), force-close the modal
  useEffect(() => {
    if (promoteOpen && !canPromote) {
      dispatch(closePromote());
    }
  }, [promoteOpen, canPromote, dispatch]);

  const onOpenPromote = (c: RecommendationCandidate) => {
    if (!canPromote) return; // ✅ hard guard
    dispatch(openPromote(c));
  };

  const onClosePromote = () => dispatch(closePromote());

  const onSubmitPromote = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ extra guard (don’t attempt privileged action without permission)
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

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>{t("recommendations:title")}</h2>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
        >
          {t("common:actions.refresh")}
        </button>

        {(isLoading || isFetching) && (
          <span style={{ opacity: 0.7 }}>Loading…</span>
        )}
      </div>

      {isError && (
        <div style={{ marginTop: 12, color: "crimson" }}>
          {t("common:errors.generic")}
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <div style={{ marginTop: 12 }}>{t("recommendations:list.empty")}</div>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Model
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Weight
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  RSSI
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Frequency
                </th>

                {/* ✅ Only show the action column if user can promote */}
                {canPromote && (
                  <th style={{ borderBottom: "1px solid #ddd", padding: 8 }} />
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((c, idx) => (
                <tr key={candidateKey(c, idx)}>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {safeString(c.model)}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {safeString(c.id)}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {c.weight ?? ""}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {c.rssi ?? ""}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {c.frequency ?? ""}
                  </td>

                  {/* ✅ Only show Promote button if allowed */}
                  {canPromote && (
                    <td
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #f0f0f0",
                        textAlign: "right",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenPromote(c)}
                        disabled={
                          !c.model || c.id === undefined || c.id === null
                        }
                      >
                        {t("common:actions.promote")}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Promote dialog only exists if canPromote */}
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
                <div style={{ marginTop: 12, color: "crimson" }}>
                  {t("common:errors.generic")}
                </div>
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
