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

import {
  PageHeader,
  ErrorPanel,
  EmptyState,
  DataTable,
  Modal,
  type DataColumn,
} from "../../components";

function safeString(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function candidateKey(c: RecommendationCandidate, idx: number): string {
  const model = safeString((c as any).model);
  const id = safeString((c as any).id);
  const fp = safeString((c as any).fingerprint);
  const key = [model, id, fp].filter(Boolean).join(":");
  return key || `row-${idx}`;
}

export function RecommendationsPage() {
  const { t } = useTranslation(["common", "recommendations"]);

  const dispatch = useAppDispatch();

  const promoteOpen = useAppSelector(selectPromoteOpen);
  const selected = useAppSelector(selectSelectedCandidate);
  const promoteForm = useAppSelector(selectPromoteForm);

  // Permission gating (Option A)
  const canPromote = useAppSelector((s) =>
    (s.session.permissions ?? []).includes("recommendation:promote")
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useListRecommendationsQuery();

  const [promote, promoteState] = usePromoteRecommendationMutation();

  const rows = useMemo(() => data?.content ?? [], [data]);

  const onOpenPromote = (c: RecommendationCandidate) =>
    dispatch(openPromote(c));
  const onClosePromote = () => dispatch(closePromote());

  const onSubmitPromote = async (e: React.FormEvent) => {
    e.preventDefault();

    // UI should already hide this, but guard anyway
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

  const columns: Array<DataColumn<RecommendationCandidate>> = [
    { header: "Model", render: (c) => safeString(c.model) },
    { header: "ID", render: (c) => safeString(c.id) },
    { header: "Weight", render: (c) => (c.weight ?? "").toString() },
    { header: "RSSI", render: (c) => (c.rssi ?? "").toString() },
    { header: "Frequency", render: (c) => (c.frequency ?? "").toString() },
    {
      header: "",
      align: "right",
      render: (c) =>
        canPromote ? (
          <button
            type="button"
            onClick={() => onOpenPromote(c)}
            disabled={!c.model || c.id === undefined || c.id === null}
          >
            {t("common:actions.promote")}
          </button>
        ) : null,
    },
  ];

  const isBusy = isLoading || isFetching;

  return (
    <div style={{ padding: 16 }}>
      <PageHeader
        title={t("recommendations:title")}
        isBusy={isBusy}
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

      {isError ? (
        <ErrorPanel message={t("common:errors.generic")} error={error} />
      ) : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <EmptyState>{t("recommendations:list.empty")}</EmptyState>
      ) : null}

      {!isLoading && !isError && rows.length > 0 ? (
        <DataTable<RecommendationCandidate>
          rows={rows}
          columns={columns}
          keyForRow={candidateKey}
        />
      ) : null}

      {/* Promote dialog */}
      <Modal
        open={!!(promoteOpen && selected && canPromote)}
        title={t("recommendations:promote.title")}
        onClose={onClosePromote}
        width={640}
      >
        {selected ? (
          <>
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

              {promoteState.isError ? (
                <ErrorPanel
                  message={t("common:errors.generic")}
                  error={promoteState.error}
                />
              ) : null}

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
          </>
        ) : null}
      </Modal>
    </div>
  );
}
