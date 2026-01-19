import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useListKnownDevicesQuery, type KnownDevice } from "./knownDevicesApi";

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

function rowKey(d: KnownDevice, idx: number): string {
  // Prefer stable key fields if present
  const model = safeString((d as any).model);
  const deviceId = safeString((d as any).deviceId ?? (d as any).id);
  const fp = safeString((d as any).fingerprint);
  const key = [model, deviceId, fp].filter(Boolean).join(":");
  return key || `row-${idx}`;
}

export function KnownDevicesPage() {
  const { t } = useTranslation(["common", "knownDevices"]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useListKnownDevicesQuery();

  // IMPORTANT: the backend envelope in your project is:
  // { content: T, status: number, timestamp: string, messages: string[] }
  // so rows should be data?.content (NOT data?.content?.content)
  const rows = useMemo(() => data?.content ?? [], [data]);

  const columns: Array<DataColumn<KnownDevice>> = [
    { header: "Model", render: (d) => safeString((d as any).model) },
    {
      header: "Device ID",
      render: (d) => safeString((d as any).deviceId ?? (d as any).id),
    },
    {
      header: "Fingerprint",
      render: (d) => safeString((d as any).fingerprint),
    },
    { header: "Name", render: (d) => safeString((d as any).name) },
    { header: "Type", render: (d) => safeString((d as any).type) },
    { header: "Area", render: (d) => safeString((d as any).area) },
    { header: "Time", render: (d) => safeString((d as any).time) },
  ];

  // We only treat the initial load as blocking. Background fetching should not hide data.
  const showEmpty = !isLoading && !isError && rows.length === 0;

  return (
    <div style={{ padding: 16 }}>
      <PageHeader
        title={t("knownDevices:title")}
        isBusy={isLoading || isFetching}
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

      {showEmpty ? (
        <EmptyState>{t("knownDevices:list.empty")}</EmptyState>
      ) : null}

      {/* Key part: if we have rows, render them even if isFetching is true */}
      {!isError && rows.length > 0 ? (
        <DataTable<KnownDevice>
          rows={rows}
          columns={columns}
          keyForRow={rowKey}
        />
      ) : null}
    </div>
  );
}

export default KnownDevicesPage;
